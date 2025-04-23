from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_token
from pino import pino

logger = pino()

app = FastAPI()

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def read_root(token_data: dict = Depends(verify_token)):
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the FastAPI app!", "user": token_data}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None, token_data: dict = Depends(verify_token)):
    logger.info(f"Item endpoint accessed with item_id: {item_id} and query: {q}")
    return {"item_id": item_id, "query": q, "user": token_data}