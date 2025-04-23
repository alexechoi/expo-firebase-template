from datetime import datetime
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
VALID_AUDIENCE = "api"
VALID_ISSUERS = ["mobile"]
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        token = credentials.credentials
        
        try:
            # First try to decode without verification to see the payload
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            print(f"Unverified payload: {unverified_payload}")
        except Exception as e:
            print(f"Error decoding unverified token: {str(e)}")
        
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
            print(f"JWT Verification Error: {str(e)}")
            raise
            
        return payload
    except JWTError:
        print("JWTError")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 