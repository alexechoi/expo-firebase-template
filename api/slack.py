import os
import json
import httpx
import asyncio
from datetime import datetime
from fastapi import Request
from pino import pino

logger = pino()

class SlackNotifier:
    def __init__(self):
        self.webhook_url = os.environ.get('SLACK_WEBHOOK_URL')
        if not self.webhook_url:
            logger.warning('SLACK_WEBHOOK_URL environment variable is not set')
            logger.warning('Slack notifications will be disabled')
        
        self.enabled = bool(self.webhook_url)
        self.client = httpx.AsyncClient(timeout=10.0) if self.enabled else None
    
    async def send_notification(self, request: Request, event_type: str, user_data: dict = None):
        """
        Send a notification to Slack about user authentication events
        
        Args:
            request: The FastAPI request object
            event_type: Type of event (login_success, signup_success)
            user_data: Optional user data to include in the notification
        """
        if not self.enabled or not self.client:
            return
        
        try:
            # Get client IP address
            client_ip = request.client.host if request.client else "Unknown"
            
            # Try to get country from headers (if using a proxy like Cloudflare)
            country = request.headers.get("CF-IPCountry", "Unknown")
            
            # Get user agent
            user_agent = request.headers.get("user-agent", "Unknown")
            
            # Format timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Determine action title based on event type
            action_title = self._get_friendly_action_title(event_type)
            
            # Prepare message
            message = {
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": action_title
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": f"*Time:*\n{timestamp}"
                            },
                            {
                                "type": "mrkdwn",
                                "text": f"*Country:*\n{country}"
                            }
                        ]
                    }
                ]
            }
            
            # Add user data if provided
            if user_data:
                user_block = {
                    "type": "section",
                    "fields": []
                }
                
                # Add relevant user fields (avoid sensitive data)
                for key, value in user_data.items():
                    if key in ["user_id", "email", "first_name", "last_name", "auth_method"]:
                        # Mask email for privacy
                        if key == "email" and value:
                            display_value = f"{value[:3]}***@{value.split('@')[1]}" if "@" in value else "***"
                        else:
                            display_value = str(value)
                        
                        user_block["fields"].append({
                            "type": "mrkdwn",
                            "text": f"*{key.replace('_', ' ').title()}:*\n{display_value}"
                        })
                
                if user_block["fields"]:
                    message["blocks"].append(user_block)
            
            # Add technical details
            message["blocks"].append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Technical Details:* IP: {client_ip} | Event: {event_type}"
                }
            })
            
            # Add divider
            message["blocks"].append({
                "type": "divider"
            })
            
            # Send notification
            await self.client.post(
                self.webhook_url,
                json=message
            )
            
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {str(e)}")
    
    def _get_friendly_action_title(self, event_type: str) -> str:
        """
        Convert event type to user-friendly action title
        """
        if event_type == "login_success":
            return "🔐 User Login Success"
        elif event_type == "signup_success":
            return "🎉 New User Signup"
        else:
            return f"📱 User Event: {event_type}"
    
    async def close(self):
        """Close the HTTP client"""
        if self.client:
            await self.client.aclose()

# Create a singleton instance
slack_notifier = SlackNotifier() 