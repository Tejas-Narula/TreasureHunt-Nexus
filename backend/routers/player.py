from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from core.firebase import get_db
from schemas.models import LoginRequest, LoginResponse, GameState, ScanRequest, ScanResponse, Team, Member, TeamInfoResponse, Trail
from datetime import datetime
import time
from google.cloud import firestore

_TRAILS_CACHE = {}
_TRAILS_CACHE_TTL = 60

_STATE_CACHE = None
_STATE_CACHE_TIME = 0
_STATE_CACHE_TTL = 5

def get_cached_game_state(db):
    global _STATE_CACHE, _STATE_CACHE_TIME
    now = time.time()
    if _STATE_CACHE and (now - _STATE_CACHE_TIME < _STATE_CACHE_TTL):
        return _STATE_CACHE
    state_doc = db.collection("game_config").document("global_state").get()
    if state_doc.exists:
        _STATE_CACHE = state_doc.to_dict()
    else:
        _STATE_CACHE = {"status": "waiting"}
    _STATE_CACHE_TIME = now
    return _STATE_CACHE

def get_cached_trail(db, trail_id: str):
    now = time.time()
    if trail_id in _TRAILS_CACHE:
        cached_data, timestamp = _TRAILS_CACHE[trail_id]
        if now - timestamp < _TRAILS_CACHE_TTL:
            return cached_data
            
    trail_doc = db.collection("trails").document(trail_id).get()
    if trail_doc.exists:
        data = trail_doc.to_dict()
        data["name"] = trail_doc.id
        _TRAILS_CACHE[trail_id] = (data, now)
        return data
    return None

router = APIRouter(prefix="/api/player", tags=["Player"])

async def broadcast_ws(message: dict):
    from core.websocket import manager
    await manager.broadcast(message)

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, background_tasks: BackgroundTasks):
    db = get_db()
    
    teams_ref = db.collection("teams").where("team_id", "==", request.team_id).stream()
    team_doc = None
    for doc in teams_ref:
        team_doc = doc
        break
        
    if not team_doc:
        raise HTTPException(status_code=401, detail="Invalid team ID")
        
    team_data = team_doc.to_dict()
    team_data["id"] = team_doc.id
    
    members_ref = db.collection("teams").document(team_doc.id).collection("members").where("phone_number", "==", request.phone_number).stream()
    member_doc = None
    for doc in members_ref:
        member_doc = doc
        break
        
    if not member_doc:
        raise HTTPException(status_code=401, detail="Invalid phone number")
        
    member_data = member_doc.to_dict()
    member_data["id"] = member_doc.id
    
    return LoginResponse(
        team=Team(**team_data),
        member=Member(**member_data)
    )

@router.get("/state", response_model=GameState)
def get_game_state():
    db = get_db()
    state = get_cached_game_state(db)
    return GameState(**state)

@router.get("/team/{team_id}", response_model=TeamInfoResponse)
def get_team_info(team_id: str):
    db = get_db()
    
    # fetch team
    teams_ref = db.collection("teams").where("team_id", "==", team_id).stream()
    team_doc = None
    for doc in teams_ref:
        team_doc = doc
        break
        
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
        
    team_data = team_doc.to_dict()
    team_data["id"] = team_doc.id
    
    # fetch members
    members = []
    members_ref = db.collection("teams").document(team_doc.id).collection("members").stream()
    for doc in members_ref:
        member_data = doc.to_dict()
        member_data["id"] = doc.id
        members.append(member_data)
        
    team_data["members"] = members
    team = Team(**team_data)
    
    trail = None
    if team.assigned_trail:
        trail_data = get_cached_trail(db, team.assigned_trail)
        if trail_data:
            # ANTI-CHEAT: redact future steps to preserve step_type for map
            current_step = team.current_step
            safe_steps = []
            for step in trail_data.get("steps", []):
                s = step.copy()
                if s.get("step_number") > current_step:
                    s["location_name"] = "CLASSIFIED"
                    s["clue_text"] = "CLASSIFIED"
                    s["hint_text"] = "CLASSIFIED"
                    if "story_text" in s: s["story_text"] = "CLASSIFIED"
                    if "task_description" in s: s["task_description"] = "CLASSIFIED"
                safe_steps.append(s)
            
            # Create a copy so we don't mutate the cached dictionary
            safe_trail_data = trail_data.copy()
            safe_trail_data["total_steps"] = len(safe_steps)
            safe_trail_data["steps"] = safe_steps
            trail = Trail(**safe_trail_data)
            
    return TeamInfoResponse(team=team, trail=trail)

@router.post("/scan", response_model=ScanResponse)
def scan_qr(request: ScanRequest, background_tasks: BackgroundTasks):
    db = get_db()
    
    state_dict = get_cached_game_state(db)
    if state_dict.get("status") != "active":
        raise HTTPException(status_code=403, detail="Game is not active")
        
    teams_ref = db.collection("teams").where("team_id", "==", request.team_id).stream()
    team_doc = None
    for doc in teams_ref:
        team_doc = doc
        break
        
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
        
    member_ref = db.collection("teams").document(team_doc.id).collection("members").document(request.player_id)
    member_doc = member_ref.get()
    if not member_doc.exists:
        raise HTTPException(status_code=404, detail="Player not found")
        
    transaction = db.transaction()
    team_ref = db.collection("teams").document(team_doc.id)
    
    @firestore.transactional
    def process_scan_in_transaction(transaction, t_ref):
        t_doc = t_ref.get(transaction=transaction)
        if not t_doc.exists:
            raise HTTPException(status_code=404, detail="Team not found")
            
        team_data = t_doc.to_dict()
        current_step = team_data.get("current_step", 0)
        assigned_trail = team_data.get("assigned_trail")
        
        if not assigned_trail:
            raise HTTPException(status_code=400, detail="Team has no assigned trail")
            
        trail_data = get_cached_trail(db, assigned_trail)
        if not trail_data:
            raise HTTPException(status_code=404, detail="Assigned trail not found")

        steps = trail_data.get("steps", [])
        
        target_step = current_step
        step_config = None
        for step in steps:
            if step.get("step_number") == target_step:
                step_config = step
                break
                
        if not step_config:
            max_step = max(s.get("step_number", 0) for s in steps) if steps else 0
            if current_step >= max_step:
                transaction.update(t_ref, {
                    "completed": True,
                    "completed_at": datetime.utcnow().isoformat() + "Z"
                })
                return {"completed": True, "message": "Game completed", "next_step_config": None}
            raise HTTPException(status_code=400, detail="Invalid current step")
            
        if step_config.get("step_type") != "qr_scan":
            raise HTTPException(status_code=403, detail="Current step is a special task, cannot be bypassed with QR")
            
        if step_config.get("location_name") != request.qr_token:
            raise HTTPException(status_code=400, detail="Invalid QR token")
            
        new_step = current_step + 1
        history = team_data.get("history", [])
        history.append({
            "step_number": current_step,
            "scanned_at": datetime.utcnow().isoformat() + "Z",
            "status": "qr_scan"
        })
        
        has_next_step = any(s.get("step_number") == new_step for s in steps)
        completed = not has_next_step
        
        next_step_config = None
        if not completed:
            for step in steps:
                if step.get("step_number") == new_step:
                    next_step_config = step
                    break
        
        update_data = {
            "current_step": new_step,
            "history": history
        }
        if completed:
            update_data["completed"] = True
            update_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
            
        transaction.update(t_ref, update_data)
        
        return {
            "completed": completed,
            "message": "QR Scanned Successfully",
            "next_step_config": next_step_config
        }

    result = process_scan_in_transaction(transaction, team_ref)
    
    background_tasks.add_task(broadcast_ws, {"type": "team_updated", "team_id": request.team_id})
    
    return ScanResponse(
        success=True,
        message=result["message"],
        next_step=result["next_step_config"],
        completed=result["completed"]
    )
