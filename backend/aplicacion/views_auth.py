from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    # Callback URL must match the one configured in Google Cloud Console
    callback_url = "http://localhost:3000" 

class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter
