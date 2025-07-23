from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import verify_token
from slack import slack_notifier
from pino import pino
import asyncio
from typing import Optional

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



# Pydantic models for analytics endpoints
class AuthAnalyticsRequest(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    auth_method: Optional[str] = None  # "email", "google", etc.
    additional_data: Optional[dict] = None

@app.get("/")
async def read_root(token_data: dict = Depends(verify_token)):
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the FastAPI app!", "user": token_data}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None, token_data: dict = Depends(verify_token)):
    logger.info(f"Item endpoint accessed with item_id: {item_id} and query: {q}")
    return {"item_id": item_id, "query": q, "user": token_data}

# Analytics endpoints for authentication events
@app.post("/analytics/login-success")
async def track_login_success(request: Request, data: AuthAnalyticsRequest):
    """
    Track successful login events for analytics
    This is a fire-and-forget endpoint that won't affect the main auth flow
    """
    try:
        logger.info(f"Login success tracked for user: {data.user_id or data.email}")
        
        # Send Slack notification in background
        asyncio.create_task(
            slack_notifier.send_notification(
                request, 
                "login_success", 
                data.dict(exclude_none=True)
            )
        )
        
        return {"status": "success", "message": "Login event tracked"}
    except Exception as e:
        logger.error(f"Error tracking login success: {str(e)}")
        # Return success even on error to not affect main flow
        return {"status": "success", "message": "Event processed"}

@app.post("/analytics/signup-success")
async def track_signup_success(request: Request, data: AuthAnalyticsRequest):
    """
    Track successful signup events for analytics
    This is a fire-and-forget endpoint that won't affect the main auth flow
    """
    try:
        logger.info(f"Signup success tracked for user: {data.user_id or data.email}")
        
        # Send Slack notification in background
        asyncio.create_task(
            slack_notifier.send_notification(
                request, 
                "signup_success", 
                data.dict(exclude_none=True)
            )
        )
        
        return {"status": "success", "message": "Signup event tracked"}
    except Exception as e:
        logger.error(f"Error tracking signup success: {str(e)}")
        # Return success even on error to not affect main flow
        return {"status": "success", "message": "Event processed"}

# Cleanup on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    await slack_notifier.close()