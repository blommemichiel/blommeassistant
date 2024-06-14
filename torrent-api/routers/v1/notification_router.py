import json
import time
from fastapi import APIRouter, HTTPException, status
from typing import Optional
from helper.is_site_available import check_if_site_available
from pydantic import BaseModel
from helper.error_messages import error_handler

router = APIRouter(tags=["Notification Routes"])
NOTIFICATIONS_FILE = "routers/v1/notifications.json"

class Notification(BaseModel):
    id: int
    timestamp: float
    message: str
    read: int

@router.post("/")
@router.post("")
async def create_notification(notification: str):
    with open(NOTIFICATIONS_FILE, "r") as f:
        notifications = json.load(f)

    new_notification={
        "id": len(notifications) + 1,
        "timestamp": time.time(),
        "message": notification,
        "read": 0
    }

    notifications.append(new_notification)

    with open(NOTIFICATIONS_FILE, "w") as f:
        json.dump(notifications, f)

    return new_notification

@router.get("/")
@router.get("")
async def get_notifications():
    with open(NOTIFICATIONS_FILE, "r") as f:
        notifications = json.load(f)
    return notifications

@router.get("/unread")
async def get_unread_notifications():
    with open(NOTIFICATIONS_FILE, "r") as f:
        notifications = json.load(f)
    unread_notifications = [notification for notification in notifications if notification["read"] == 0]
    return unread_notifications

@router.get("/status")
async def change_status(id: int):
    with open(NOTIFICATIONS_FILE, "r") as f:
        notifications = json.load(f)

    # Find the notification with the provided id
    found_notification = None
    for notification in notifications:
        if notification["id"] == id:
            found_notification = notification
            break

    if found_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Change the status of the notification to read (set read to 1)
    found_notification["read"] = 1

    # Write back the modified notifications to the file
    with open(NOTIFICATIONS_FILE, "w") as f:
        json.dump(notifications, f)

    return {"message": "Notification status changed successfully"}