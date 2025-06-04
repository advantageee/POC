"""ETL pipeline for public investment filings.

This script fetches disclosures from multiple sources (SEC EDGAR, SEDAR+, CIRO/IROC)
and stores a normalized record in the `investments` table. Each record is enriched
by calling the `/api/enrich/investment-summary` endpoint.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List

import requests
from bs4 import BeautifulSoup
import feedparser
import fitz  # PyMuPDF
from pdfminer.high_level import extract_text
import psycopg2

logging.basicConfig(level=logging.INFO)

API_URL = os.getenv("ENRICH_API_URL", "http://localhost:7071")
DB_CONNECTION = os.getenv("POSTGRES_CONNECTION", "")
USER_AGENT = os.getenv("USER_AGENT", "InvestorCodexETL")

@dataclass
class InvestmentRecord:
    company: str
    filing_type: str
    filing_date: datetime
    source: str
    url: str
    raw_text: str
    summary: str = ""
    investment_score: float = 0.0

def call_enrichment(record: InvestmentRecord) -> None:
    """Call enrichment API to generate summary and investment score."""
    payload = {"RawJson": json.dumps({
        "company": record.company,
        "filing_type": record.filing_type,
        "filing_date": record.filing_date.isoformat(),
        "source": record.source,
        "url": record.url,
        "raw_text": record.raw_text,
    })}
    try:
        resp = requests.post(f"{API_URL}/api/enrich/investment-summary", json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        record.summary = data.get("Summary", "")
        record.investment_score = float(data.get("InvestmentScore", 0))
    except Exception as exc:
        logging.warning("Enrichment failed for %s: %s", record.url, exc)

def parse_sec_filings(cik: str) -> Iterable[InvestmentRecord]:
    """Fetch recent SEC filings for a given CIK."""
    headers = {"User-Agent": USER_AGENT}
    url = f"https://data.sec.gov/submissions/{cik}.json"
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    recent = data.get("filings", {}).get("recent", {})
    forms = recent.get("form", [])
    accession_numbers = recent.get("accessionNumber", [])
    filing_dates = recent.get("filingDate", [])
    for form, acc, fdate in zip(forms, accession_numbers, filing_dates):
        if form not in {"13D", "13G", "D", "10-K", "8-K"}:
            continue
        filing_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc.replace('-', '')}/{acc}-index.html"
        html = requests.get(filing_url, headers=headers, timeout=30).text
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(separator="\n")
        yield InvestmentRecord(
            company=cik,
            filing_type=form,
            filing_date=datetime.strptime(fdate, "%Y-%m-%d"),
            source="SEC",
            url=filing_url,
            raw_text=text,
        )

def parse_sedar_pdf(url: str, company: str, filing_type: str, filing_date: datetime) -> InvestmentRecord:
    """Download a PDF from SEDAR+ and extract text."""
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    resp.raise_for_status()
    with fitz.open(stream=resp.content, filetype="pdf") as doc:
        text = "\n".join(page.get_text() for page in doc)
    return InvestmentRecord(
        company=company,
        filing_type=filing_type,
        filing_date=filing_date,
        source="SEDAR",
        url=url,
        raw_text=text,
    )

def parse_ciro_rss(feed_url: str) -> Iterable[InvestmentRecord]:
    """Parse CIRO/IROC RSS feed and yield investment records."""
    parsed = feedparser.parse(feed_url)
    for entry in parsed.entries:
        title = entry.get("title", "")
        published = entry.get("published", "")
        link = entry.get("link", "")
        summary = BeautifulSoup(entry.get("summary", ""), "html.parser").get_text()
        date = datetime.strptime(published[:10], "%Y-%m-%d") if published else datetime.utcnow()
        yield InvestmentRecord(
            company=title,
            filing_type="Notice",
            filing_date=date,
            source="CIRO",
            url=link,
            raw_text=summary,
        )

def upsert_records(records: Iterable[InvestmentRecord]) -> None:
    """Upsert investment records into PostgreSQL."""
    if not DB_CONNECTION:
        logging.warning("No database connection string configured")
        return
    conn = psycopg2.connect(DB_CONNECTION)
    with conn, conn.cursor() as cur:
        cur.execute(
            """CREATE TABLE IF NOT EXISTS investments (
            id SERIAL PRIMARY KEY,
            company TEXT,
            filing_type TEXT,
            filing_date DATE,
            source TEXT,
            url TEXT UNIQUE,
            summary TEXT,
            investment_score DOUBLE PRECISION
        )"""
        )
        for rec in records:
            call_enrichment(rec)
            cur.execute(
                """INSERT INTO investments (company, filing_type, filing_date, source, url, summary, investment_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (url) DO UPDATE SET summary = EXCLUDED.summary, investment_score = EXCLUDED.investment_score""",
                (
                    rec.company,
                    rec.filing_type,
                    rec.filing_date.date(),
                    rec.source,
                    rec.url,
                    rec.summary,
                    rec.investment_score,
                ),
            )
    conn.close()

def main():
    cik = os.getenv("SEC_CIK", "0000320193")  # Apple as example
    sedar_pdf_url = os.getenv("SEDAR_PDF_URL")
    ciro_feed = os.getenv("CIRO_RSS", "https://www.iiroc.ca/news-and-publications/notices-and-guidance?_format=xml")

    records: List[InvestmentRecord] = []
    try:
        records.extend(list(parse_sec_filings(cik)))
    except Exception as exc:
        logging.error("SEC ETL failed: %s", exc)

    if sedar_pdf_url:
        try:
            records.append(
                parse_sedar_pdf(
                    sedar_pdf_url,
                    company="Unknown",
                    filing_type="Prospectus",
                    filing_date=datetime.utcnow(),
                )
            )
        except Exception as exc:
            logging.error("SEDAR ETL failed: %s", exc)

    try:
        records.extend(list(parse_ciro_rss(ciro_feed)))
    except Exception as exc:
        logging.error("CIRO ETL failed: %s", exc)

    if records:
        upsert_records(records)

if __name__ == "__main__":
    main()
