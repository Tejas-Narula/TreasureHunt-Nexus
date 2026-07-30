import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, firestore
from core.config import settings

# Global variables to cache initialized apps/clients in serverless environment
_firebase_app = None
_db = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app
    
    # Avoid initializing multiple times in serverless
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass # App not initialized yet

    cred = None
    if settings.FIREBASE_SERVICE_ACCOUNT_B64:
        # Load from base64 encoded environment variable (Vercel friendly)
        decoded_cert = base64.b64decode(settings.FIREBASE_SERVICE_ACCOUNT_B64).decode("utf-8")
        cert_dict = json.loads(decoded_cert)
        cred = credentials.Certificate(cert_dict)
    elif settings.FIREBASE_CREDENTIALS_PATH:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if not os.path.isabs(cred_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            possible_path = os.path.join(base_dir, cred_path)
            if os.path.exists(possible_path):
                cred_path = possible_path
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            cred = credentials.ApplicationDefault()
    else:
        # Fallback to application default credentials (useful for GCP/local testing if logged in)
        cred = credentials.ApplicationDefault()
    
    _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app

def get_db():
    global _db
    if _db is not None:
        return _db
    
    app = get_firebase_app()
    _db = firestore.client(app=app)
    return _db
