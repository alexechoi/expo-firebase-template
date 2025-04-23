from datetime import datetime
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv
import os
from pino import pino

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
VALID_AUDIENCE = "api"
VALID_ISSUERS = ["mobile"]
security = HTTPBearer()
logger = pino()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        token = credentials.credentials
        
        try:
            # First try to decode without verification to see the payload
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            logger.info(f"Unverified payload: {unverified_payload}")
        except Exception as e:
            logger.error(f"Error decoding unverified token: {str(e)}")
        
        # Now try the actual verification
        try:
            payload = jwt.decode(
                token, 
                SECRET_KEY, 
                algorithms=[ALGORITHM], 
                audience=VALID_AUDIENCE, 
                issuer=VALID_ISSUERS
            )
        except JWTError as e:
            logger.error(f"JWT Verification Error: {str(e)}")
            raise
            
        return payload
    except JWTError:
        logger.error("JWTError")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 