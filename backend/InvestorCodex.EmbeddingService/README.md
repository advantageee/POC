# InvestorCodex Embedding Service

This service exposes simple endpoints for generating embeddings using Azure OpenAI and storing them in Azure Cognitive Search.

- **POST /api/embedding/vectorize** – Compute a vector for provided text and store it in the `company-embeddings` index along with metadata.
- **GET /api/embedding/search** – Perform a vector similarity search with optional filters.

The implementation uses FastAPI for the HTTP layer and the Azure SDKs for OpenAI and Cognitive Search. Calls to external services are mocked or left as TODOs so the service can run locally without Azure credentials.
