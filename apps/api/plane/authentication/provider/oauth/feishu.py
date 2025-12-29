# Python imports
import os
import logging
from datetime import datetime
from urllib.parse import urlencode

import pytz
import requests

# Module imports
from plane.authentication.adapter.oauth import OauthAdapter
from plane.license.utils.instance_value import get_configuration_value
from plane.authentication.adapter.error import (
    AUTHENTICATION_ERROR_CODES,
    AuthenticationException,
)

logger = logging.getLogger(__name__)


class FeishuOAuthProvider(OauthAdapter):
    token_url = "https://open.feishu.cn/open-apis/authen/v2/oauth/token"
    userinfo_url = "https://open.feishu.cn/open-apis/authen/v1/user_info"
    # Feishu scopes for getting user email (optional, mainly configured in admin console)
    scope = "contact:user.email:readonly contact:user.employee:readonly"
    provider = "feishu"

    def __init__(self, request, code=None, state=None, callback=None):
        (FEISHU_APP_ID, FEISHU_APP_SECRET) = get_configuration_value(
            [
                {
                    "key": "FEISHU_APP_ID",
                    "default": os.environ.get("FEISHU_APP_ID"),
                },
                {
                    "key": "FEISHU_APP_SECRET",
                    "default": os.environ.get("FEISHU_APP_SECRET"),
                },
            ]
        )

        if not (FEISHU_APP_ID and FEISHU_APP_SECRET):
            raise AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["FEISHU_NOT_CONFIGURED"],
                error_message="FEISHU_NOT_CONFIGURED",
            )

        client_id = FEISHU_APP_ID
        client_secret = FEISHU_APP_SECRET

        redirect_uri = f"""{"https" if request.is_secure() else "http"}://{request.get_host()}/auth/feishu/callback/"""
        url_params = {
            "app_id": client_id,
            "redirect_uri": redirect_uri,
            "state": state,
        }
        auth_url = f"https://open.feishu.cn/open-apis/authen/v1/authorize?{urlencode(url_params)}"

        super().__init__(
            request,
            self.provider,
            client_id,
            self.scope,
            redirect_uri,
            auth_url,
            self.token_url,
            self.userinfo_url,
            client_secret,
            code,
            callback=callback,
        )

    def get_user_token(self, data, headers=None):
        """
        Feishu v2 API uses POST with JSON body and requires client_id/client_secret in body
        """
        try:
            headers = headers or {}
            # Feishu v2 API uses client_id and client_secret (not app_id/app_secret)
            request_data = {
                **data,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            }
            logger.debug(f"Feishu token request URL: {self.get_token_url()}")
            
            response = requests.post(self.get_token_url(), json=request_data, headers=headers)
            
            logger.debug(f"Feishu token response status: {response.status_code}")
            
            response.raise_for_status()
            response_data = response.json()
            
            # Check Feishu API response code
            if response_data.get("code") != 0:
                error_msg = response_data.get('msg', 'Unknown error')
                logger.error(f"Feishu API error: {error_msg}")
                raise requests.RequestException(f"Feishu API error: {error_msg}")
            
            return response_data
        except requests.RequestException as e:
            logger.error(f"Feishu token request failed: {str(e)}")
            code = self.authentication_error_code()
            raise AuthenticationException(error_code=AUTHENTICATION_ERROR_CODES[code], error_message=str(code))

    def get_user_response(self):
        """
        Get user info from Feishu using Bearer token
        """
        try:
            access_token = self.token_data.get('access_token')
            headers = {"Authorization": f"Bearer {access_token}"}
            
            logger.debug(f"Feishu user info request URL: {self.get_user_info_url()}")
            
            response = requests.get(self.get_user_info_url(), headers=headers, timeout=10)
            
            logger.debug(f"Feishu user info response status: {response.status_code}")
            
            response.raise_for_status()
            response_data = response.json()
            
            # Check Feishu API response code
            if response_data.get("code") != 0:
                error_msg = response_data.get('msg', 'Unknown error')
                logger.error(f"Feishu user info API error: {error_msg}")
                raise requests.RequestException(f"Feishu API error: {error_msg}")
            
            return response_data
        except Exception as e:
            logger.error(f"Feishu user info request failed: {type(e).__name__}: {str(e)}")
            code = self.authentication_error_code()
            raise AuthenticationException(error_code=AUTHENTICATION_ERROR_CODES[code], error_message=str(code))

    def set_token_data(self):
        # Feishu v2 API requires redirect_uri in token request
        data = {
            "grant_type": "authorization_code",
            "code": self.code,
            "redirect_uri": self.redirect_uri,  # Required by Feishu v2 API
        }
        headers = {
            "Content-Type": "application/json; charset=utf-8"
        }
        token_response = self.get_user_token(data=data, headers=headers)
        
        # Feishu v2 API returns token data at top level (not nested in "data")
        # Response format: {code: 0, access_token: "...", expires_in: 7200, ...}
        
        # Calculate token expiration time
        expires_in = token_response.get("expires_in")
        refresh_expires_in = token_response.get("refresh_expires_in")
        
        super().set_token_data(
            {
                "access_token": token_response.get("access_token"),
                "refresh_token": token_response.get("refresh_token", None),
                "access_token_expired_at": (
                    datetime.fromtimestamp(datetime.now().timestamp() + expires_in, tz=pytz.utc)
                    if expires_in
                    else None
                ),
                "refresh_token_expired_at": (
                    datetime.fromtimestamp(datetime.now().timestamp() + refresh_expires_in, tz=pytz.utc)
                    if refresh_expires_in
                    else None
                ),
                "id_token": token_response.get("id_token", ""),
            }
        )

    def set_user_data(self):
        user_info_response = self.get_user_response()
        
        # Feishu returns data in nested structure: {code, msg, data: {...}}
        user_info = user_info_response.get("data", {})
        
        # Feishu returns different field names
        # open_id is the unique identifier
        # name is the user's display name
        # avatar_url is the user's avatar
        # email requires permission: contact:user.email:readonly or contact:user.employee:readonly
        
        # Get email from Feishu response
        email = user_info.get("email") or user_info.get("enterprise_email")
        open_id = user_info.get("open_id")
        
        logger.debug(f"Feishu user info retrieved: has_email={bool(email)}, has_open_id={bool(open_id)}")
        
        # If no email is configured in Feishu account, use union_id as fallback
        # This allows users without email to still login
        if not email:
            union_id = user_info.get("union_id")
            email = f"{union_id}@feishu.local" if union_id else f"{open_id}@feishu.local"
            logger.warning(f"No email configured in Feishu account, using fallback email domain: feishu.local")
        
        user_data = {
            "email": email,
            "user": {
                "avatar": user_info.get("avatar_url") or user_info.get("avatar_thumb"),
                "first_name": user_info.get("name", ""),
                "last_name": "",
                "provider_id": open_id,
                "is_password_autoset": True,
            },
        }
        super().set_user_data(user_data)

