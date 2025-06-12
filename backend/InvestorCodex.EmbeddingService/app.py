"""Embedding and similarity API powered by FastAPI."""

from __future__ import annotations

import os
import logging
import asyncio
from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# These imports would be required for real Azure integration
try:
    from azure.search.documents import SearchClient
    from azure.core.credentials import AzureKeyCredential
    from openai import AzureOpenAI
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    logging.warning("Azure dependencies not available, using mock implementations")

app = FastAPI(title="InvestorCodex Embedding Service", version="1.0.0")

# Configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AZURE_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
INDEX_NAME = "company-embeddings"
MODEL = "text-embedding-3-large"

# Global clients
openai_client = None
search_client = None


@app.on_event("startup")
async def startup_event():
    """Initialize Azure clients if available."""
    global openai_client, search_client
    
    if AZURE_AVAILABLE and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY:
        try:
            openai_client = AzureOpenAI(
                azure_endpoint=AZURE_OPENAI_ENDPOINT,
                api_key=AZURE_OPENAI_API_KEY,
                api_version="2024-02-01"
            )
            logging.info("Azure OpenAI client initialized")
        except Exception as e:
            logging.error(f"Failed to initialize Azure OpenAI client: {e}")
    
    if AZURE_AVAILABLE and AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY:
        try:
            search_client = SearchClient(
                endpoint=AZURE_SEARCH_ENDPOINT,
                index_name=INDEX_NAME,
                credential=AzureKeyCredential(AZURE_SEARCH_KEY)
            )
            logging.info("Azure Search client initialized")
        except Exception as e:
            logging.error(f"Failed to initialize Azure Search client: {e}")

class VectorizeRequest(BaseModel):
    text: str
    metadata: Dict[str, Any] = {}

class SearchResponse(BaseModel):
    id: str
    score: float
    metadata: Dict[str, Any]
    text: Optional[str] = None

class SimilarCompanyRequest(BaseModel):
    company_description: str
    industry: Optional[str] = None
    funding_stage: Optional[str] = None
    limit: int = 10

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding using Azure OpenAI or fallback to mock."""
    if openai_client:
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: openai_client.embeddings.create(
                    input=[text],
                    model=MODEL
                )
            )
            return response.data[0].embedding
        except Exception as e:
            logging.error(f"Azure OpenAI embedding failed: {e}")
    
    # Fallback: Generate a simple hash-based mock embedding
    import hashlib
    hash_obj = hashlib.md5(text.encode())
    hash_int = int(hash_obj.hexdigest(), 16)
    
    # Create a deterministic but varied 1536-dimensional vector
    np.random.seed(hash_int % (2**32))
    embedding = np.random.normal(0, 1, 1536).tolist()
    return embedding

@app.post("/api/embedding/vectorize")
async def vectorize(req: VectorizeRequest) -> Dict[str, Any]:
    """Compute an embedding and store it in Azure Cognitive Search."""
    try:
        # Generate embedding
        vector = await generate_embedding(req.text)
        
        # Use ID from metadata if provided, otherwise generate random ID
        doc_id = req.metadata.get("id", os.urandom(8).hex())
        
        document = {
            "id": doc_id,
            "vector": vector,
            "text": req.text,
            **req.metadata,
        }
        
        if not search_client:
            raise HTTPException(status_code=500, detail="Azure Search not configured")

        try:
            # Store in Azure Search
            search_client.upload_documents([document])
            logging.info(f"Stored document in Azure Search: {document['id']}")
        except Exception as e:
            logging.error(f"Failed to store in Azure Search: {e}")
            raise HTTPException(status_code=500, detail="Failed to store vector")

        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {str(e)}")

@app.get("/api/embedding/search")
async def search(q: str, limit: int = 10) -> List[SearchResponse]:
    """Perform a vector similarity search."""
    try:
        # Generate query embedding
        query_vector = await generate_embedding(q)
        
        if not search_client:
            raise HTTPException(status_code=500, detail="Azure Search not configured")

        try:
            # Use Azure Cognitive Search
            from azure.search.documents.models import VectorizedQuery
            vector_query = VectorizedQuery(
                vector=query_vector,
                k_nearest_neighbors=limit,
                fields="vector",
            )

            results = search_client.search(
                search_text=None,
                vector_queries=[vector_query],
                top=limit,
            )

            return [
                SearchResponse(
                    id=result["id"],
                    score=result["@search.score"],
                    metadata={k: v for k, v in result.items() if k not in ["id", "vector", "@search.score"]},
                    text=result.get("text"),
                )
                for result in results
            ]
        except Exception as e:
            logging.error(f"Azure Search failed: {e}")
            raise HTTPException(status_code=500, detail="Vector search failed")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/embedding/similar-companies")
async def find_similar_companies(
    company_description: str,
    industry: Optional[str] = None,
    funding_stage: Optional[str] = None,
    limit: int = 10
) -> List[SearchResponse]:
    """Find similar companies based on description."""
    # Enhance query with filters
    enhanced_query = company_description
    if industry:
        enhanced_query += f" industry:{industry}"
    if funding_stage:
        enhanced_query += f" stage:{funding_stage}"
    
    return await search(enhanced_query, limit)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "azure_openai_available": openai_client is not None,
        "azure_search_available": search_client is not None,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
