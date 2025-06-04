# Investor Codex Functional Specification (v1.0)

This document outlines the key features and components of the Investor Codex platform. It mirrors the full specification provided in the project planning stages and acts as a reference for contributors.

---

## Tech Stack Overview

- **Frontend**: React, TypeScript, Tailwind (Next.js)
- **Backend**: .NET 8 / ASP.NET Core Web API
- **Database**: PostgreSQL, CosmosDB
- **AI**: Azure OpenAI GPT-4o and embeddings
- **Vector Search**: Azure Cognitive Search
- **Auth**: Azure AD B2C

## Core Modules

1. **Company Intelligence**
   - Pull company data from Apollo.io and enrich it using Azure OpenAI.
   - Stored fields include name, industry, location and AI-generated summary, tags and risk flags.
2. **Contact Intelligence**
   - Similar enrichment for key contacts with persona classification.
3. **Investment History**
   - ETL jobs aggregate funding rounds and public filings from multiple sources.
4. **Signal Tracking**
   - Tracks real-time signals such as funding, hiring or risk events.
5. **Similar Company Search**
   - Embedding based search using Azure Cognitive Search.
6. **Dashboard Frontend**
   - Next.js powered user interface to browse companies, alerts and export data.

Refer to the original functional specification for detailed schema and milestone breakdown.

## Worker Services

- **Apollo Sync Service** – A .NET 8 worker that runs daily to fetch companies and contacts from Apollo's `/companies/search` and `/people/search` endpoints. Records are upserted into PostgreSQL and any failures are logged to a CosmosDB `sync_failures` container.
- **Investment Filing ETL** – A Python pipeline that parses SEC, SEDAR+ and CIRO/IROC filings using BeautifulSoup, PyMuPDF and pdfminer. Parsed filings are stored in an `investments` table and enriched via the `/api/enrich/investment-summary` endpoint.

## AI Enrichment Engine

- **Service**: Azure Function App
- **Models**: GPT-4o and `text-embedding-3-large`
- **Endpoints**
  - `POST /api/enrich/company`
  - `POST /api/enrich/investment-summary`
  - `POST /api/analyze/signal`
- **Input**: Raw Apollo JSON or parsed signal text
- **Output**
  - Company enrichment stored in `companies.summary`, `investment_score`, `tags[]` and `risk_flags[]`
  - Signal analysis stored in `signals.tags`, `signals.severity` and `signals.summary`
- **Queue Integration**: Uses Azure Storage Queue or Service Bus to support asynchronous processing


## Embedding + Similarity Service

This component provides vector storage and similarity search capabilities:

- **Model**: Azure OpenAI `text-embedding-3-large`
- **Storage**: Azure Cognitive Search index `company-embeddings`
- **Workflow**
  - `POST /api/embedding/vectorize` – Stores an embedding vector with metadata
  - `GET /api/embedding/search?q=...` – Performs a vector similarity search with optional filters

The service is implemented as a FastAPI app in `backend/InvestorCodex.EmbeddingService`.

## Dashboard Web App

The frontend is built with Next.js and Tailwind CSS. It consumes the backend APIs to present investment insights.

### Routing Views

- `/companies` – Table view with pagination and filters.
- `/companies/:id` – Tabbed profile showing **Signals**, **Contacts**, and **Investments**.
- `/alerts` – Timeline view of signals sorted by AI-assigned severity.
- `/similar/:id` – Displays embedding based similar company results.
- `/export` – Allows downloading PDF or CSV reports.

### User Roles

Azure AD B2C provides authentication with three roles:

- **Viewer** – Read-only access to company data.
- **Analyst** – Can trigger exports and manage alerts.
- **Admin** – Full access including user management.

## Export & Reporting Engine

When a user clicks the export button, an asynchronous job is placed on an Azure Queue. The job renders HTML templates to PDF via Puppeteer (or DinkToPDF) and generates CSV files directly from PostgreSQL. Files are stored temporarily in Azure Blob Storage and served through time-limited signed URLs.
