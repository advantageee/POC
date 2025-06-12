# Investor Codex

This repository contains a proof-of-concept implementation for the Investor Codex platform. The goal is to mirror key features of commercial investment intelligence tools using open data sources and Azure OpenAI for enrichment.

## Repository Layout

* `backend/` contains several services:
  * **InvestorCodex.Api** – Minimal API used for experimentation
  * **InvestorCodex.SyncService** – Worker service that syncs companies and contacts from Apollo into PostgreSQL
  * **InvestmentFilingETL** – Python scripts that collect and enrich public investment filings
* `frontend/` – Minimal Next.js app demonstrating the dashboard
  * Includes an **API Configuration** screen under `/settings`
* `docs/` – Project documentation including the full functional specification

The project is at an early stage and currently only includes minimal scaffolding.

