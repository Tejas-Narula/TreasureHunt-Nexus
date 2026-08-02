from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from core.firebase import get_db
from core.security import verify_admin
from core.websocket import manager
from schemas.models import TeamCreate, TeamWithMemberCreate, MemberCreate, MemberUpdate, OverrideStepRequest, Trail, GameState, Location
from typing import Union
from datetime import datetime
import uuid
import random

async def broadcast_ws(message: dict):
    await manager.broadcast(message)

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(verify_admin)])

@router.get("/game/state", response_model=GameState)
def get_admin_game_state():
    db = get_db()
    state_doc = db.collection("game_config").document("global_state").get()
    if not state_doc.exists:
        return GameState(status="waiting")
    return GameState(**state_doc.to_dict())

@router.put("/game/start")
def start_game(background_tasks: BackgroundTasks):
    db = get_db()
    
    # Ensure all teams have a balanced trail assignment
    trails_ref = db.collection("trails").stream()
    trail_ids = [trail.id for trail in trails_ref]
    if trail_ids:
        teams_ref = list(db.collection("teams").stream())
        unassigned_teams = [t for t in teams_ref if not t.to_dict().get("assigned_trail")]
        if unassigned_teams:
            counts = {t_id: 0 for t_id in trail_ids}
            for t in teams_ref:
                at = t.to_dict().get("assigned_trail")
                if at in counts:
                    counts[at] += 1
            for team in unassigned_teams:
                min_count = min(counts.values())
                min_trails = [t_id for t_id, c in counts.items() if c == min_count]
                chosen = random.choice(min_trails)
                team.reference.update({"assigned_trail": chosen})
                counts[chosen] += 1

    db.collection("game_config").document("global_state").set({
        "status": "active",
        "start_time": datetime.utcnow().isoformat() + "Z"
    }, merge=True)
    background_tasks.add_task(broadcast_ws, {"type": "game_state", "status": "active"})
    return {"status": "Game started"}

@router.put("/game/pause")
def pause_game(background_tasks: BackgroundTasks):
    db = get_db()
    db.collection("game_config").document("global_state").set({
        "status": "paused"
    }, merge=True)
    background_tasks.add_task(broadcast_ws, {"type": "game_state", "status": "paused"})
    return {"status": "Game paused"}

@router.put("/game/stop")
def stop_game(background_tasks: BackgroundTasks):
    db = get_db()
    db.collection("game_config").document("global_state").set({
        "status": "ended"
    }, merge=True)
    background_tasks.add_task(broadcast_ws, {"type": "game_state", "status": "ended"})
    return {"status": "Game stopped"}

@router.put("/game/reset")
def reset_game(background_tasks: BackgroundTasks):
    db = get_db()
    db.collection("game_config").document("global_state").set({
        "status": "waiting",
        "start_time": None
    }, merge=True)
    
    # Fetch all trails to evenly assign
    trails_ref = db.collection("trails").stream()
    trail_ids = [trail.id for trail in trails_ref]
    
    # Reset all participants positions and assign trails in round-robin fashion
    teams_ref = list(db.collection("teams").stream())
    random.shuffle(teams_ref)
    
    for idx, team in enumerate(teams_ref):
        assigned_trail = trail_ids[idx % len(trail_ids)] if trail_ids else None
        team.reference.update({
            "current_step": 0,
            "history": [],
            "assigned_trail": assigned_trail,
            "completed": False,
            "completed_at": None
        })

    background_tasks.add_task(broadcast_ws, {"type": "game_state", "status": "waiting"})
    return {"status": "Game reset to waiting"}

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
def create_team(team: Union[TeamWithMemberCreate, TeamCreate], background_tasks: BackgroundTasks):
    db = get_db()
    
    # Validate duplicate team_id
    existing_teams = db.collection("teams").where("team_id", "==", team.team_id).get()
    if len(existing_teams) > 0:
        raise HTTPException(status_code=400, detail="Team ID already exists")

    team_doc_id = f"team_{uuid.uuid4().hex[:8]}"
    team_name = getattr(team, "team_name", None) or f"Team {team.team_id}"
    
    # Assign trail with fewest current assignments
    trails_ref = db.collection("trails").stream()
    trail_ids = [trail.id for trail in trails_ref]
    assigned_trail = None
    if trail_ids:
        teams_ref = db.collection("teams").stream()
        counts = {t_id: 0 for t_id in trail_ids}
        for t in teams_ref:
            at = t.to_dict().get("assigned_trail")
            if at in counts:
                counts[at] += 1
        min_count = min(counts.values())
        min_trails = [t_id for t_id, c in counts.items() if c == min_count]
        assigned_trail = random.choice(min_trails)

    team_data = {
        "team_id": team.team_id,
        "team_name": team_name,
        "completed": False,
        "penalty_minutes": 0,
        "current_step": 0,
        "history": [],
        "assigned_trail": assigned_trail
    }
    db.collection("teams").document(team_doc_id).set(team_data)
    team_data["id"] = team_doc_id
    
    phone_number = getattr(team, "phone_number", None)
    if phone_number:
        player_id = f"player_{uuid.uuid4().hex[:8]}"
        player_name = getattr(team, "player_name", None) or "Captain"
        character_role = getattr(team, "character_role", None) or "demogorgon_hunter"
        
        member_data = {
            "player_name": player_name,
            "phone_number": phone_number,
            "character_role": character_role
        }
        db.collection("teams").document(team_doc_id).collection("members").document(player_id).set(member_data)
        member_data["id"] = player_id
        team_data["members"] = [member_data]
    else:
        team_data["members"] = []

    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return team_data

@router.delete("/teams/{team_doc_id}")
def delete_team(team_doc_id: str, background_tasks: BackgroundTasks):
    db = get_db()
    team_ref = db.collection("teams").document(team_doc_id)
    if not team_ref.get().exists:
        raise HTTPException(status_code=404, detail="Team not found")
        
    members = team_ref.collection("members").stream()
    for m in members:
        team_ref.collection("members").document(m.id).delete()
        
    team_ref.delete()
    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return {"status": "Team deleted successfully"}


@router.post("/teams/{team_doc_id}/members")
def add_member(team_doc_id: str, member: MemberCreate, background_tasks: BackgroundTasks):
    db = get_db()
    player_id = f"player_{uuid.uuid4().hex[:8]}"
    member_data = {
        "player_name": member.player_name,
        "phone_number": member.phone_number,
        "character_role": member.character_role
    }
    db.collection("teams").document(team_doc_id).collection("members").document(player_id).set(member_data)
    member_data["id"] = player_id
    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return member_data

@router.put("/teams/{team_doc_id}/members/{player_id}")
def update_member(team_doc_id: str, player_id: str, member: MemberUpdate, background_tasks: BackgroundTasks):
    db = get_db()
    update_data = member.model_dump(exclude_unset=True)
    if not update_data:
        return {"status": "No changes provided"}
        
    member_ref = db.collection("teams").document(team_doc_id).collection("members").document(player_id)
    member_ref.update(update_data)
    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return {"status": "Updated successfully"}

@router.put("/teams/{team_doc_id}/approve_task")
def approve_task(team_doc_id: str, background_tasks: BackgroundTasks):
    db = get_db()
    team_ref = db.collection("teams").document(team_doc_id)
    team_doc = team_ref.get()
    
    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")
        
    team_data = team_doc.to_dict()
    current_step = team_data.get("current_step", 0)
    
    history = team_data.get("history", [])
    history.append({
        "step_number": current_step,
        "scanned_at": datetime.utcnow().isoformat() + "Z",
        "status": "task_approved"
    })
    
    assigned_trail = team_data.get("assigned_trail")
    new_step = current_step + 1
    update_data = {
        "current_step": new_step,
        "history": history
    }
    
    if assigned_trail:
        trail_doc = db.collection("trails").document(assigned_trail).get()
        if trail_doc.exists:
            steps = trail_doc.to_dict().get("steps", [])
            has_next_step = any(s.get("step_number") == new_step for s in steps)
            if not has_next_step:
                update_data["completed"] = True
                update_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
                
    team_ref.update(update_data)
    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return {"status": "Task approved", "new_step": new_step}

@router.put("/teams/{team_doc_id}/override_step")
def override_step(team_doc_id: str, request: OverrideStepRequest, background_tasks: BackgroundTasks):
    db = get_db()
    team_ref = db.collection("teams").document(team_doc_id)
    team_doc = team_ref.get()
    
    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")
        
    team_data = team_doc.to_dict()
    current_step = team_data.get("current_step", 0)
    
    history = team_data.get("history", [])
    history.append({
        "step_number": current_step,
        "scanned_at": datetime.utcnow().isoformat() + "Z",
        "status": "admin_override"
    })
    
    assigned_trail = team_data.get("assigned_trail")
    new_step = request.new_step
    update_data = {
        "current_step": new_step,
        "history": history
    }
    
    if assigned_trail:
        trail_doc = db.collection("trails").document(assigned_trail).get()
        if trail_doc.exists:
            steps = trail_doc.to_dict().get("steps", [])
            max_step = max([s.get("step_number", 0) for s in steps]) if steps else 0
            
            if new_step < 0 or new_step > max_step + 1:
                raise HTTPException(status_code=400, detail=f"Invalid step {new_step}. Valid range is 0 to {max_step + 1}.")
                
            has_next_step = any(s.get("step_number") == new_step for s in steps)
            if not has_next_step:
                update_data["completed"] = True
                update_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
            else:
                update_data["completed"] = False
                update_data["completed_at"] = None
                
    team_ref.update(update_data)
    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return {"status": "Step overridden", "new_step": new_step}

@router.put("/teams/{team_doc_id}/clear_history")
def clear_team_history(team_doc_id: str, background_tasks: BackgroundTasks):
    db = get_db()
    team_ref = db.collection("teams").document(team_doc_id)
    if not team_ref.get().exists:
        raise HTTPException(status_code=404, detail="Team not found")
        
    team_ref.update({"history": []})
    background_tasks.add_task(broadcast_ws, {"type": "teams_updated"})
    return {"status": "History cleared"}

@router.get("/locations")
def get_locations():
    db = get_db()
    locations = []
    loc_ref = db.collection("locations").stream()
    for doc in loc_ref:
        loc_data = doc.to_dict()
        loc_data["id"] = doc.id
        locations.append(loc_data)
    return locations

@router.post("/locations")
def create_location(location: Location):
    db = get_db()
    db.collection("locations").add(location.model_dump())
    return {"status": "Location created"}

@router.get("/trails")
def get_trails():
    db = get_db()
    trails = []
    trails_ref = db.collection("trails").stream()
    for trail_doc in trails_ref:
        trail_data = trail_doc.to_dict()
        trail_data["name"] = trail_doc.id
        trails.append(trail_data)
    return trails

@router.post("/trails")
def create_trail(trail: Trail):
    db = get_db()
    trail_data = trail.model_dump()
    db.collection("trails").document(trail.name).set(trail_data)
    return {"status": "Trail created"}
