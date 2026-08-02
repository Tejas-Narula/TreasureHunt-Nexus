from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from typing import Literal

GameStatus = Literal["waiting", "active", "paused", "ended"]
StepType = Literal["qr_scan", "special_task"]
MemberStatus = Literal["completed", "admin_override", "task_approved"]

class GameState(BaseModel):
    status: GameStatus = "waiting"
    start_time: Optional[datetime] = None

class StepConfig(BaseModel):
    step_number: int
    step_type: StepType
    location_name: str
    clue_text: str
    task_description: Optional[str] = None
    story_text: Optional[str] = None
    hint_text: Optional[str] = None

class Location(BaseModel):
    name: str
    code: str

class Trail(BaseModel):
    name: str
    steps: List[StepConfig] = []

class PlayerHistory(BaseModel):
    step_number: int
    scanned_at: datetime
    status: MemberStatus

class MemberCreate(BaseModel):
    player_name: str
    phone_number: str
    character_role: Optional[str] = None

class MemberUpdate(BaseModel):
    player_name: Optional[str] = None
    phone_number: Optional[str] = None
    character_role: Optional[str] = None

class Member(BaseModel):
    id: str
    player_name: str
    phone_number: str
    character_role: Optional[str] = None

class TeamCreate(BaseModel):
    team_id: str
    team_name: str

class TeamWithMemberCreate(BaseModel):
    team_id: str
    team_name: Optional[str] = None
    phone_number: str
    player_name: Optional[str] = "Captain"
    character_role: Optional[str] = "demogorgon_hunter"


class Team(BaseModel):
    id: str
    team_id: str
    team_name: str
    completed: bool = False
    penalty_minutes: int = 0
    current_step: int = 0
    history: List[PlayerHistory] = []
    assigned_trail: Optional[str] = None
    members: List[Member] = []

class LoginRequest(BaseModel):
    team_id: str
    phone_number: str

class LoginResponse(BaseModel):
    team: Team
    member: Member

class ScanRequest(BaseModel):
    team_id: str
    player_id: str
    qr_token: str

class ScanResponse(BaseModel):
    success: bool
    message: str
    next_step: Optional[StepConfig] = None
    completed: bool = False

class OverrideStepRequest(BaseModel):
    new_step: int

class TeamInfoResponse(BaseModel):
    team: Team
    trail: Optional[Trail] = None
