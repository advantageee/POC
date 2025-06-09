# Functional Specification Document (FSD): Investor Codex Platform

## 1. Overview

Investor Codex is a full-stack, AI-powered investment intelligence platform aiming for full feature parity with PitchBook. It aggregates, enriches, and analyzes structured and unstructured data on companies, investors, and funding events. It now includes MCP-based context integration for real-time VC news and smart prompt grounding.

---

## 2. Goals

* Match PitchBook 1:1 in core capabilities
* Enable scalable AI-powered enrichment and summarization
* Provide investor intelligence, deal tracking, alerts, and analytics
* Integrate real-time news and contextual intelligence via MCP
* Support RAG-ready embedding and prompt APIs

---

## Table of Contents
1. [Overview](#1-overview)
2. [Goals](#2-goals)
3. [System-Architecture](#3-system-architecture)
4. [Functional-Components](#4-functional-components)
5. [Data-Model](#5-data-model)
6. [API-Endpoints](#6-api-endpoints)
7. [Frontend-Structure-nextjs](#7-frontend-structure-nextjs)
8. [Integration-Config](#8-integration-config)
9. [Prompt-Template-LLM](#9-prompt-template-llm)
10. [Schedule--Refresh](#10-schedule--refresh)
11. [Roadmap-PitchBook-Feature-Gaps](#11-roadmap-pitchbook-feature-gaps)
12. [Security--Roles](#12-security--roles)
13. [Testing--Monitoring](#13-testing--monitoring)
14. [Summary](#14-summary)
15. [Roadmap--Milestones-Delivery-Schedule](#roadmap--milestones-delivery-schedule)


## 3. System Architecture

### 3.1 Core Modules

* **InvestorCodex.Api (.NET 8)**: REST API
* **InvestorCodex.SyncService**: Apollo.io and partner data sync
* **InvestorCodex.EmbeddingService (Python/FastAPI)**: Vector search and embedding
* **InvestorCodex.EnrichmentFunction (.NET)**: AI enrichment handlers
* **InvestmentFilingETL (Python)**: Filing data ingestion (SEC, SEDAR+, CIRO)
* **Frontend (Next.js + TS + Tailwind)**: UI with search, dashboard, exports
* **MCP News Integration**: Real-time VC news via /context feeds

### 3.2 Data Sources

* Apollo.io
* Public filings (SEC, SEDAR+, CIRO)
* Crunchbase, YahooFinance, GNews, TechCrunch (via MCP)
* Internal annotations and manual enrichment

---

## 4. Functional Components

### 4.1 Company Intelligence

* CRUD + enrichment via `CompaniesController`
* AI-based enrichment: description, traction, risk factors
* MCP card injection with recent VC mentions
* Vector similarity via `EmbeddingController`

### 4.2 Contact Intelligence

* Contact ingestion via ApolloSyncWorker
* Persona tagging using LLMs
* Relationship mapping (future)

### 4.3 Investment Deal Tracking

* Ingested from filings, Apollo
* `InvestmentsController` manages endpoints
* Basic metadata (round, date, investors, amount)
* Term sheet ingestion roadmap (manual+DocuSign parsing)

### 4.4 Signal Detection & Alerting

* Alerts extracted via NLP from filings and news
* Smart categorization: hiring, leadership change, risk flags
* Alert scoring (0-1 confidence)
* Displayed in `/alerts` dashboard

### 4.5 News Integration (MCP Protocol)

* Fetchers ingest external feeds (Crunchbase, GNews, YahooFinance)
* Normalized via `MCP Context Assembler`
* Exposed via REST `/context?id=vc-latest`
* Displayed as cards in NLWeb UI
* Injected into LLM prompt template

### 4.6 Search & Export

* Vector + keyword filtering via `/search`
* Advanced filters planned: sector, geo, stage, score
* `ExportController` generates CSV / PDF exports

---

## 5. Data Model

### 5.1 Company

* id, name, industry, description
* funding history, signals[], enrichment
* tags[], vector[]

### 5.2 Contact

* id, name, company_id, title
* enrichment, persona_label

### 5.3 Investment

* id, company_id, round, date, investors[], terms (future)

### 5.4 Signal

* id, type, source, summary, confidence, company_id

### 5.5 MCPContext

* id, title, timestamp, entries[]

### 5.6 MCPEntry

* id, headline, summary, link, publishedAt, source, topics[], confidence

---

## 6. API Endpoints

### Core APIs

* `GET /api/companies`
* `GET /api/contacts`
* `GET /api/investments`
* `GET /api/signals`
* `POST /api/embedding/query`
* `GET /api/exports`

### MCP APIs

* `GET /context?id=vc-latest`
* `GET /context?id=investor-weekly`

---

## 7. Frontend Structure (Next.js)

* `app/companies/page.tsx` – company list
* `app/company/[id]/page.tsx` – company detail
* `app/dashboard/page.tsx` – signals + alerts overview
* `app/exports/page.tsx` – download center
* `src/components/` – reusable components (Table, Cards, Auth)
* `src/lib/api/` – centralized fetch wrappers

---

## 8. Integration Config

### AppSettings (web.config / appsettings.json)

```xml
<add key="VCContextFeedUrl" value="https://mcp.investorcodex.ai/context?id=vc-latest" />
<add key="InvestorBriefsFeedUrl" value="https://mcp.investorcodex.ai/context?id=investor-weekly" />
<add key="ApolloApiKey" value="live_apollo_api_key_goes_here" />
<add key="OpenAI__Endpoint" value="https://your-openai-instance.openai.azure.com/" />
<add key="OpenAI__Key" value="live_openai_api_key_goes_here" />
<add key="OpenAI__EmbeddingModel" value="text-embedding-3-large" />
<add key="OpenAI__ChatModel" value="gpt-4o" />
<add key="VectorSearchEndpoint" value="https://your-search-service.search.windows.net" />
<add key="VectorSearchIndex" value="investor-index" />
<add key="VectorSearchKey" value="live_vector_search_key_here" />
<add key="DatabaseConnection" value="Host=localhost;Port=5432;Database=InvestorCodex;Username=postgres;Password=your_password" />
```

---

## 9. Prompt Template (LLM)

```kotlin
You are a venture analyst AI. Use the following recent VC news entries to assist users:
{{#each context.entries}}
- {{this.headline}} ({{this.source}}): {{this.summary}}
{{/each}}
```

---

## 10. Schedule & Refresh

| Process                | Frequency   |
| ---------------------- | ----------- |
| Feed Polling           | Every 15min |
| MCP Context Reassembly | Every 30min |
| NLWeb UI Refresh       | Hourly      |
| Vector Re-Embedding    | Daily       |

---

## 11. Roadmap (PitchBook Feature Gaps)

* [ ] Fund profiles & investor database
* [ ] Term sheet + cap table UI
* [ ] Advanced deal comparables engine
* [ ] CRM sync and API exports
* [ ] Smart alerts + watchlists
* [ ] Semantic auto-tagging in MCP
* [ ] Dashboard widgets (round activity, deal flow)

---

## 12. Security & Roles

* Viewer, Analyst, Admin (RBAC)
* Session management via custom `AuthProvider.tsx`
* Future: Azure AD B2C integration for SSO

---

## 13. Testing & Monitoring

* `INTEGRATION_TEST_RESULTS.md` documents success cases
* `test-api.js`, `test-apis.ps1`: manual test utilities
* Health endpoints `/api/health`
* Future: integrate App Insights, Datadog or Azure Monitor

---

## 14. Summary

This FSD describes a production-grade PitchBook alternative grounded in AI, modern search, and scalable enrichment workflows. It maintains the original AdvantageEE POC structure, fully integrating the MCP-based VC feed without breaking compatibility and defines a clear milestone plan for feature-complete delivery.

---

## Roadmap & Milestones (Delivery Schedule)

| Date         | Milestone Description                                |
| ------------ | ---------------------------------------------------- |
| Today 2PM    | ✅ Confirm FSD scope, architecture, and data sources  |
| Today 4PM    | ✅ Finalize backend service routes + appsettings      |
| Today 6PM    | ✅ Implement API stubs and scaffolding                |
| Tonight 9PM  | ✅ Connect embedding + vector search modules          |
| Tonight 11PM | ✅ SyncService & ETL for Apollo and filings           |
| Tomorrow 2AM | ✅ Implement MCP news fetch and /context feed         |
| Tomorrow 4AM | ✅ Frontend integration + component rendering (cards) |
| Tomorrow 6AM | ✅ Prompt injection, export center, testing + polish  |
| Tomorrow 8AM | 🟢 GO/NO-GO deployment checkpoint                    |
