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
* Twitter API for additional signal monitoring
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
* TwitterService polls recent tweets for funding and acquisition chatter
* Smart categorization: hiring, leadership change, risk flags
* Alert scoring (0-1 confidence)
* Displayed in `/alerts` dashboard

### 4.5 News Integration (MCP Protocol)

* Fetchers ingest external feeds (Crunchbase, GNews, YahooFinance)
* Normalized via `MCP Context Assembler`
* Exposed via REST `/context?id=vc-latest`
* Displayed as cards in NLWeb UI
* Injected into LLM prompt template

### 4.6 Apollo Integration & Optimization

* **Database-First Strategy**: Check local database before making Apollo API calls
* **Smart Sync**: Intelligent synchronization targeting investor-focused companies
* **Bulk Load Operations**: Comprehensive data loading with duplicate detection
* **Rate Limiting**: 200ms delays between requests to respect Apollo API limits
* **Intelligent Querying**: Multiple search terms with fallback mechanisms
* **Error Handling**: Comprehensive fallback to database or sample data
* **Duplicate Detection**: Domain and name-based duplicate prevention
* **Contact Mapping**: Automatic company-contact relationship establishment
* **Investor Focus**: Targeted search terms for investment ecosystem companies

### 4.7 Search & Export

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

* `GET /api/companies` - Paginated company listing with Apollo integration
* `POST /api/companies` - Create new company record
* `PUT /api/companies/{id}` - Update existing company
* `DELETE /api/companies/{id}` - Delete company record
* `GET /api/companies/{id}` - Get single company by ID
* `GET /api/contacts` - Paginated contact listing with Apollo integration
* `POST /api/contacts` - Create new contact record
* `PUT /api/contacts/{id}` - Update existing contact
* `DELETE /api/contacts/{id}` - Delete contact record
* `GET /api/contacts/{id}` - Get single contact by ID
* `GET /api/investments` - Investment transaction listing
* `GET /api/signals` - Signal detection and alerts
* `POST /api/embedding/query` - Vector similarity search
* `GET /api/exports` - Export job status and management
* `POST /api/exports/companies` - Export companies to CSV/PDF
* `POST /api/exports/contacts` - Export contacts to CSV/PDF
* `GET /api/health` - System health and status check

### Apollo Integration APIs

* `POST /api/companies/sync-apollo` - Smart sync with database awareness
* `POST /api/companies/load-all-apollo` - Bulk load all Apollo data
* `GET /api/admin/apollo/test` - Test Apollo API connectivity
* `POST /api/admin/apollo/sync` - Admin-triggered smart sync
* `POST /api/admin/apollo/bulk-load` - Admin-triggered bulk load

### Admin Management APIs

* `GET /api/admin/stats` - System statistics and health metrics
* `POST /api/admin/apollo/sync` - Trigger Apollo synchronization
* `POST /api/admin/apollo/bulk-load` - Trigger bulk Apollo data load
* `GET /api/admin/apollo/test` - Test Apollo API connection status

### MCP APIs

* `GET /context?id=vc-latest` - Latest VC news and market updates
* `GET /context?id=investor-weekly` - Weekly investor intelligence digest
  * Returns an `MCPContext` JSON payload retrieved from the configured MCP feed (with a local sample fallback)

---

## 7. Frontend Structure (Next.js)

### Core Pages
* `app/page.tsx` – Landing page with search interface
* `app/dashboard/page.tsx` – Executive dashboard with signals + alerts overview
* `app/companies/page.tsx` – Company listing with advanced filtering
* `app/company/[id]/page.tsx` – Detailed company profile and analysis
* `app/contacts/page.tsx` – Contact management interface  
* `app/investments/page.tsx` – Investment tracking dashboard
* `app/exports/page.tsx` – Data export center and download management
* `app/alerts/page.tsx` – Alert monitoring and signal detection
* `app/search/page.tsx` – Advanced search with vector similarity
* `app/admin/page.tsx` – **NEW: System administration interface**

### Admin Interface Features (`app/admin/page.tsx`)
* **Real-time System Statistics**: Database counts, Apollo status, last updated timestamps
* **Apollo Management Panel**: Test connection, smart sync, bulk load operations
* **Status Monitoring**: Visual indicators for service health and optimization status
* **Interactive Controls**: One-click operations with loading states and result feedback
* **Optimization Dashboard**: Database-first strategy status, intelligent querying metrics

### Component Architecture
* `src/components/layout/` – Navigation, Sidebar, Header components
* `src/components/company/` – Company cards, details, search components
* `src/components/contact/` – Contact management UI components
* `src/components/export/` – Export center and job management
* `src/components/admin/` – **NEW: Admin interface components**
* `src/components/ui/` – Shared UI primitives (Button, Card, Badge, etc.)
* `src/lib/api/` – Centralized API client with error handling
* `src/types/` – TypeScript definitions for all data models

---

## 8. Performance Optimization

### 8.1 Database Optimization
* **Indexing Strategy**: Indexes on company.domain, company.name, contact.email for fast duplicate detection
* **Query Optimization**: Efficient pagination with limit/offset patterns
* **Connection Pooling**: PostgreSQL connection pooling for concurrent request handling
* **Bulk Operations**: Batch insertions for improved throughput during Apollo sync

### 8.2 Apollo API Optimization
* **Request Batching**: Combine multiple queries where possible
* **Rate Limiting**: 200ms delays between requests (300 requests/minute limit)
* **Response Caching**: Cache Apollo responses in database for future use
* **Smart Pagination**: Adaptive page sizes based on data density
* **Error Recovery**: Exponential backoff for failed requests

### 8.3 Frontend Performance
* **Code Splitting**: Route-based code splitting with Next.js
* **Image Optimization**: Automatic image optimization and lazy loading
* **API Caching**: Client-side caching of frequently accessed data
* **Loading States**: Comprehensive loading states for better UX
* **Debounced Search**: Prevent excessive API calls during user typing

### 8.4 Memory Management
* **Streaming Responses**: Large dataset streaming for exports
* **Garbage Collection**: Proper disposal of large objects and API responses
* **Memory Monitoring**: Track memory usage during bulk operations

---

## 9. Integration Config

### AppSettings (appsettings.json/.NET Configuration)

```json
{
  "ContextFeeds": {
    "vc-latest": "https://mcp.investorcodex.ai/context?id=vc-latest",
    "investor-weekly": "https://mcp.investorcodex.ai/context?id=investor-weekly"
  },
  "Apollo": {
    "ApiKey": "live_apollo_api_key_goes_here"
  },
  "OpenAI": {
    "Endpoint": "https://your-openai-instance.openai.azure.com/",
    "Key": "live_openai_api_key_goes_here",
    "EmbeddingModel": "text-embedding-3-large",
    "ChatModel": "gpt-4o"
  },
  "VectorSearch": {
    "Endpoint": "https://your-search-service.search.windows.net",
    "Index": "investor-index",
    "Key": "live_vector_search_key_here"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=InvestorCodex;Username=postgres;Password=your_password"
  },
  "Twitter": {
    "ApiKey": "your-twitter-api-key",
    "ApiSecret": "your-twitter-api-secret",
    "BearerToken": "your-twitter-bearer"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "InvestorCodex.Api.Services.ApolloService": "Information"
    }
  }
}
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
