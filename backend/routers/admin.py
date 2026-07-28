from fastapi import APIRouter, HTTPException, Depends
from core.firebase import get_db
from core.security import verify_admin
from schemas.models import TeamCreate, MemberCreate, MemberUpdate, OverrideStepRequest, Trail
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(verify_admin)])

@router.put("/game/start")
def start_game():
    db = get_db()
    db.collection("game_config").document("global_state").set({
        "status": "active",
        "start_time": datetime.utcnow().isoformat()
    })
    return {"status": "Game started"}

@router.put("/game/stop")
def stop_game():
    db = get_db()
    db.collection("game_config").document("global_state").set({
        "status": "ended"
    }, merge=True)
    return {"status": "Game stopped"}

@router.get("/teams")
def list_teams():
    db = get_db()
    teams = []
    teams_ref = db.collection("teams").stream()
    for team_doc in teams_ref:
        team_data = team_doc.to_dict()
        team_data["id"] = team_doc.id
        
        members = []
        members_ref = db.collection("teams").document(team_doc.id).collection("members").stream()
        for member_doc in members_ref:
            member_data = member_doc.to_dict()
            member_data["id"] = member_doc.id
            members.append(member_data)
            
        team_data["members"] = members
        teams.append(team_data)
        
    return teams

@router.post("/teams")
def create_team(team: TeamCreate):
    db = get_db()
    team_doc_id = f"team_{uuid.uuid4().hex[:8]}"
    team_data = {
        "team_id": team.team_id,
        "team_name": team.team_name,
        "completed": False,
        "penalty_minutes": 0
    }
    db.collection("teams").document(team_doc_id).set(team_data)
    team_data["id"] = team_doc_id
    return team_data

@router.post("/teams/{team_doc_id}/members")
def add_member(team_doc_id: str, member: MemberCreate):
    db = get_db()
    player_id = f"player_{uuid.uuid4().hex[:8]}"
    member_data = {
        "player_name": member.player_name,
        "phone_number": member.phone_number,
        "character_role": member.character_role,
        "current_step": 0,
        "history": []
    }
    db.collection("teams").document(team_doc_id).collection("members").document(player_id).set(member_data)
    member_data["id"] = player_id
    return member_data

@router.put("/teams/{team_doc_id}/members/{player_id}")
def update_member(team_doc_id: str, player_id: str, member: MemberUpdate):
    db = get_db()
    update_data = member.model_dump(exclude_unset=True)
    if not update_data:
        return {"status": "No changes provided"}
        
    member_ref = db.collection("teams").document(team_doc_id).collection("members").document(player_id)
    member_ref.update(update_data)
    return {"status": "Updated successfully"}

@router.put("/teams/{team_doc_id}/members/{player_id}/approve_task")
def approve_task(team_doc_id: str, player_id: str):
    db = get_db()
    member_ref = db.collection("teams").document(team_doc_id).collection("members").document(player_id)
    member_doc = member_ref.get()
    
    if not member_doc.exists:
        raise HTTPException(status_code=404, detail="Player not found")
        
    member_data = member_doc.to_dict()
    current_step = member_data.get("current_step", 0)
    
    history = member_data.get("history", [])
    history.append({
        "step_number": current_step,
        "scanned_at": datetime.utcnow().isoformat(),
        "status": "task_approved"
    })
    
    member_ref.update({
        "current_step": current_step + 1,
        "history": history
    })
    return {"status": "Task approved", "new_step": current_step + 1}

@router.put("/teams/{team_doc_id}/members/{player_id}/override_step")
def override_step(team_doc_id: str, player_id: str, request: OverrideStepRequest):
    db = get_db()
    member_ref = db.collection("teams").document(team_doc_id).collection("members").document(player_id)
    member_doc = member_ref.get()
    
    if not member_doc.exists:
        raise HTTPException(status_code=404, detail="Player not found")
        
    member_data = member_doc.to_dict()
    current_step = member_data.get("current_step", 0)
    
    history = member_data.get("history", [])
    history.append({
        "step_number": current_step,
        "scanned_at": datetime.utcnow().isoformat(),
        "status": "admin_override"
    })
    
    member_ref.update({
        "current_step": request.new_step,
        "history": history
    })
    return {"status": "Step overridden", "new_step": request.new_step}

@router.get("/trails")
def get_trails():
    db = get_db()
    trails = []
    trails_ref = db.collection("trails").stream()
    for trail_doc in trails_ref:
        trail_data = trail_doc.to_dict()
        trail_data["role_name"] = trail_doc.id
        trails.append(trail_data)
    return trails

@router.post("/trails")
def create_trail(trail: Trail):
    db = get_db()
    trail_data = trail.model_dump()
    db.collection("trails").document(trail.role_name).set(trail_data)
    return {"status": "Trail created"}
