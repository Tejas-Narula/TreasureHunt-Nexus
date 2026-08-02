from fastapi import APIRouter, HTTPException, status
from core.firebase import get_db
from schemas.models import LoginRequest, LoginResponse, GameState, ScanRequest, ScanResponse, Team, Member, TeamInfoResponse, Trail
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
        trail_doc = db.collection("trails").document(team.assigned_trail).get()
        if trail_doc.exists:
            trail_data = trail_doc.to_dict()
            trail_data["name"] = trail_doc.id
            trail = Trail(**trail_data)
            
    return TeamInfoResponse(team=team, trail=trail)

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
    
    target_step = current_step + 1
    step_config = None
    for step in steps:
        if step.get("step_number") == target_step:
            step_config = step
            break
            
    if not step_config:
        max_step = max(s.get("step_number", 0) for s in steps) if steps else 0
        if current_step >= max_step:
            db.collection("teams").document(team_doc.id).update({
                "completed": True,
                "completed_at": datetime.utcnow().isoformat() + "Z"
            })
            return ScanResponse(success=True, message="Game completed", completed=True)
        raise HTTPException(status_code=400, detail="Invalid current step")
        
    if step_config.get("step_type") != "qr_scan":
        raise HTTPException(status_code=403, detail="Current step is a special task, cannot be bypassed with QR")
        
    if step_config.get("location_name") != request.qr_token:
        raise HTTPException(status_code=400, detail="Invalid QR token")
        
    new_step = target_step
    history = team_data.get("history", [])
    history.append({
        "step_number": current_step,
        "scanned_at": datetime.utcnow().isoformat() + "Z",
        "status": "qr_scan"
    })
    
    has_next_step = any(s.get("step_number") == new_step for s in steps)
    completed = not has_next_step
    
    update_data = {
        "current_step": new_step,
        "history": history
    }
    if completed:
        update_data["completed"] = True
        update_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
        
    db.collection("teams").document(team_doc.id).update(update_data)
    
    return ScanResponse(
        success=True,
        message="QR Scanned Successfully",
        next_step=next_step_config,
        completed=completed
    )
