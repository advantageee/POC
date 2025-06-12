# Investor Codex

This repository contains a proof-of-concept implementation for the Investor Codex platform. The goal is to mirror key features of commercial investment intelligence tools using open data sources and Azure OpenAI for enrichment.

## Repository Layout

* `backend/` contains several services:
  * **InvestorCodex.Api** – Minimal API used for experimentation
  * **InvestorCodex.SyncService** – Worker service that syncs companies and contacts from Apollo into PostgreSQL
  * **InvestmentFilingETL** – Python scripts that collect and enrich public investment filings
* `frontend/` – Minimal Next.js app demonstrating the dashboard
  * Includes an **API Configuration** screen on the `/settings` page
* `docs/` – Project documentation including the full functional specification

The project is at an early stage and currently only includes minimal scaffolding.

## Configuration

The API expects several credentials to be supplied via environment variables or
your preferred secrets manager. The following variables are required:

```
ADVANTAGEAI__URL=<Azure OpenAI endpoint>
ADVANTAGEAI__KEY=<Azure OpenAI key>
ADVANTAGEAI__MODEL=<Model name>
APOLLO__APIKEY=<Apollo API key>
APOLLO__BASEURL=<Apollo base URL>
TWITTERAPI__APIKEY=<Twitter API key>
TWITTERAPI__APISECRET=<Twitter API secret>
TWITTERAPI__BEARERTOKEN=<Twitter bearer token>
```

Ensure these are set before running the backend project.

## Database Setup

The API uses PostgreSQL. On startup the `SignalRepository` checks for the
`signals` table and runs `schema.sql` if it is missing. To initialize an empty
database:

1. Create a PostgreSQL database and update the `DefaultConnection` string in
   `appsettings.json` or via environment variables.
2. Run the API from `backend/InvestorCodex.Api` using `dotnet run`.
   The schema and sample data will be created automatically on first launch.

