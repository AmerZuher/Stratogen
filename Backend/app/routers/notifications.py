from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.crud import notifications as crud
from app.schemas import notifications as schemas
from app.core.database import get_db_session 

router = APIRouter()

@router.post("/", response_model=schemas.Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: schemas.NotificationCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Create a new notification.
    """
    return await crud.create_notification(db=db, notification=notification)


@router.get("/user/{user_id}", response_model=List[schemas.Notification])
async def read_user_notifications(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Retrieve notifications for a specific user.
    """
    notifications = await crud.get_notifications_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return notifications


@router.get("/{notification_id}", response_model=schemas.Notification)
async def read_notification(notification_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    Retrieve a single notification by its ID.
    """
    db_notification = await crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification


@router.patch("/{notification_id}/status", response_model=schemas.Notification)
async def update_notification_status(
    notification_id: int,
    status_update: schemas.NotificationUpdate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Update the status of a notification (e.g., to READ or ARCHIVED).
    """
    if status_update.status is None:
        raise HTTPException(status_code=400, detail="Status field is required")

    db_notification = await crud.update_notification_status(
        db=db, notification_id=notification_id, status=status_update.status
    )
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification


@router.patch("/target/{target_id}/read", response_model=schemas.NotificationTarget)
async def mark_notification_target_as_read(
    target_id: int,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Mark a specific notification target as read.
    """
    db_target = await crud.update_notification_target_read_status(
        db=db, notification_target_id=target_id, read=True
    )
    if db_target is None:
        raise HTTPException(status_code=404, detail="Notification target not found")
    return db_target


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: int, db: AsyncSession = Depends(get_db_session)):
    """
    Delete a notification.
    """
    db_notification = await crud.delete_notification(db, notification_id=notification_id)
    if not db_notification:
         raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}

