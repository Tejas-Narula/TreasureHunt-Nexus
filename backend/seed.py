import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.firebase import get_db
from core.auth import get_token_hash

def seed_database():
    db = get_db()
    print("Seeding Firestore Database...")

    # 1. Global Game Config
    db.collection("game_config").document("global_state").set({
        "status": "waiting",
        "start_time": None
    })
    print("[OK] Created 'game_config' collection (global_state: waiting)")

    # 2. Trails (Eleven & Dustin)
    db.collection("trails").document("eleven").set({
        "role_name": "eleven",
        "steps": [
            {
                "step_number": 0,
                "step_type": "qr_scan",
                "location_name": "Hawkins Lab Main Gate",
                "clue_text": "Head to the main lab entrance. Scan the QR code near the yellow warning sign.",
                "qr_token": get_token_hash("LAB-GATE-11")
            },
            {
                "step_number": 1,
                "step_type": "special_task",
                "location_name": "Waffle Station (Cafeteria)",
                "clue_text": "Find the Game Master at the Waffle Station in the Cafeteria.",
                "task_description": "Perform Eleven's iconic hand gesture and name 3 Eggo waffle flavors to pass."
            },
            {
                "step_number": 2,
                "step_type": "qr_scan",
                "location_name": "The Upside Down Portal",
                "clue_text": "Descend into the basement portal. Scan the code near the red light.",
                "qr_token": get_token_hash("UPSIDE-DOWN-PORTAL-88")
            }
        ]
    })

    db.collection("trails").document("dustin").set({
        "role_name": "dustin",
        "steps": [
            {
                "step_number": 0,
                "step_type": "qr_scan",
                "location_name": "Radio Tower (Cerebro)",
                "clue_text": "Climb up to Cerebro's antenna station. Scan the code on the transceiver.",
                "qr_token": get_token_hash("CEREBRO-TOWER-01")
            },
            {
                "step_number": 1,
                "step_type": "special_task",
                "location_name": "Palace Arcade",
                "clue_text": "Head to the Palace Arcade and find the Game Master.",
                "task_description": "Solve the D&D riddle given by the Game Master to unlock your next clue."
            }
        ]
    })
    print("[OK] Created 'trails' collection (eleven, dustin)")

    # 3. Sample Team and Members
    team_doc_id = "team_hellfire_01"
    db.collection("teams").document(team_doc_id).set({
        "team_id": "HELLFIRE-01",
        "team_name": "The Hellfire Club",
        "completed": False,
        "penalty_minutes": 0
    })

    db.collection("teams").document(team_doc_id).collection("members").document("player_dustin").set({
        "player_name": "Dustin Henderson",
        "phone_number": "9876543210",
        "character_role": "dustin",
        "current_step": 0,
        "history": []
    })

    db.collection("teams").document(team_doc_id).collection("members").document("player_eleven").set({
        "player_name": "Eleven",
        "phone_number": "1111111111",
        "character_role": "eleven",
        "current_step": 0,
        "history": []
    })

    print("[OK] Created 'teams' collection ('HELLFIRE-01' with Dustin & Eleven)")
    print("\nDatabase Seeding Complete!")

if __name__ == "__main__":
    seed_database()
