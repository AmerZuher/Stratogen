from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models.notifications import NotificationStatus, NotificationType, TargetType

# --- Notification Target Schemas ---

class NotificationTargetBase(BaseModel):
    target_type: TargetType
    target_id: int

class NotificationTargetCreate(NotificationTargetBase):
    pass

class NotificationTarget(NotificationTargetBase):
    id: int
    notification_id: int
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Notification Schemas ---

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType
    investment_id: Optional[int] = None
    related_type: Optional[str] = None
    related_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    status: Optional[NotificationStatus] = None
    targets: List[NotificationTargetCreate] = []

class NotificationUpdate(BaseModel):
    status: NotificationStatus

class Notification(NotificationBase):
    id: int
    status: NotificationStatus
    created_at: datetime
    targets: List[NotificationTarget] = []

    class Config:
        from_attributes = True

