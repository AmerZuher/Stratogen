
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models import notifications as models
from app.schemas import notifications as schemas
from sqlalchemy.ext.asyncio import AsyncSession

from datetime import datetime


async def get_notification(db: AsyncSession, notification_id: int):
    """
    Asynchronously get a single notification by its ID, eagerly loading its targets.
    """
    query = (
        select(models.Notification)
        .where(models.Notification.id == notification_id)
        .options(selectinload(models.Notification.targets))
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_notifications_by_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    """
    Asynchronously get all notifications for a user, eagerly loading their targets.
    """
    query = (
        select(models.Notification)
        .join(models.NotificationTarget)
        .filter(
            models.NotificationTarget.target_type == models.TargetType.USER,
            models.NotificationTarget.target_id == user_id
        )
        .options(selectinload(models.Notification.targets))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().unique().all()

async def create_notification(db: AsyncSession, notification: schemas.NotificationCreate):
    """
    Asynchronously create a new notification and its targets.
    """
    db_notification = models.Notification(
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type,
        investment_id=notification.investment_id,
        related_type=notification.related_type,
        related_id=notification.related_id,
        status=notification.status or models.NotificationStatus.ACTIVE
    )

    if notification.targets:
        for target_data in notification.targets:
            db_target = models.NotificationTarget(
                target_type=target_data.target_type,
                target_id=target_data.target_id
            )
            db_notification.targets.append(db_target)

    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def update_notification_status(db: AsyncSession, notification_id: int, status: schemas.NotificationStatus):
    """
    Asynchronously update the status of a notification.
    """
    db_notification = await get_notification(db, notification_id)
    if db_notification:
        db_notification.status = status
        await db.commit()
        await db.refresh(db_notification)
    return db_notification

async def update_notification_target_read_status(db: AsyncSession, notification_target_id: int, read: bool):
    """
    Asynchronously mark a specific notification target as read or unread.
    """
    query = select(models.NotificationTarget).where(models.NotificationTarget.id == notification_target_id)
    result = await db.execute(query)
    db_target = result.scalar_one_or_none()
    
    if db_target:
        db_target.read_at = datetime.utcnow() if read else None
        await db.commit()
        await db.refresh(db_target)
    return db_target

async def delete_notification(db: AsyncSession, notification_id: int):
    """
    Asynchronously delete a notification by its ID.
    """
    db_notification = await get_notification(db, notification_id)
    if db_notification:
        await db.delete(db_notification)
        await db.commit()
    return db_notification

