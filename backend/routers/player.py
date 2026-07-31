from fastapi import APIRouter, HTTPException, status
from core.firebase import get_db
from schemas.models import LoginRequest, LoginResponse, GameState, ScanRequest, ScanResponse, Team, Member
from datetime import datetime

router = APIRouter(prefix="/api/player", tags=["Player"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
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
    state_doc = db.collection("game_config").document("global_state").get()
    if not state_doc.exists:
        return GameState(status="waiting")
    return GameState(**state_doc.to_dict())

@router.post("/scan", response_model=ScanResponse)
def scan_qr(request: ScanRequest):
    db = get_db()
    
    state_doc = db.collection("game_config").document("global_state").get()
    if not state_doc.exists or state_doc.to_dict().get("status") != "active":
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
        
    team_data = team_doc.to_dict()
    current_step = team_data.get("current_step", 0)
    assigned_trail = team_data.get("assigned_trail")
    
    if not assigned_trail:
        raise HTTPException(status_code=400, detail="Team has no assigned trail")
        
    trail_doc = db.collection("trails").document(assigned_trail).get()
    if not trail_doc.exists:
        raise HTTPException(status_code=404, detail="Assigned trail not found")
        
    trail_data = trail_doc.to_dict()
    steps = trail_data.get("steps", [])
    
    step_config = None
    for step in steps:
        if step.get("step_number") == current_step:
            step_config = step
            break
            
    if not step_config:
        if current_step > 0 and current_step >= len(steps):
            return ScanResponse(success=False, message="Game completed", completed=True)
        raise HTTPException(status_code=400, detail="Invalid current step")
        
    if step_config.get("step_type") != "qr_scan":
        raise HTTPException(status_code=403, detail="Current step is a special task, cannot be bypassed with QR")
        
    if step_config.get("qr_token") != request.qr_token:
        raise HTTPException(status_code=400, detail="Invalid QR token")
        
    new_step = current_step + 1
    history = team_data.get("history", [])
    history.append({
        "step_number": current_step,
        "scanned_at": datetime.utcnow().isoformat(),
        "status": "completed"
    })
    
    db.collection("teams").document(team_doc.id).update({
        "current_step": new_step,
        "history": history
    })
    
    next_step_config = None
    for step in steps:
        if step.get("step_number") == new_step:
            next_step_config = step
            break
            
    completed = next_step_config is None
    
    return ScanResponse(
        success=True,
        message="QR Scanned Successfully",
        next_step=next_step_config,
        completed=completed
    )
