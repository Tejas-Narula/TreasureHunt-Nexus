from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def get_player_limiter_key(request: Request) -> str:
    ip_address = get_remote_address(request)
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return ip_address
    
    token = auth_header.split(" ")[1]
    try:
        from core.auth import decode_access_token
        payload = decode_access_token(token)
        if payload:
            player_id = payload.get("player_id")
            if player_id:
                return player_id
    except Exception:
        pass
        
    return ip_address
