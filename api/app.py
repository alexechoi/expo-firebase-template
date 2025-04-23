from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_token

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
    return {"message": "Welcome to the FastAPI app!", "user": token_data}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None, token_data: dict = Depends(verify_token)):
    return {"item_id": item_id, "query": q, "user": token_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

