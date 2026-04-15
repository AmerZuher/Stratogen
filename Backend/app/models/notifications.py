from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

# FIX: Import the shared Base from the models package.
from . import Base

class NotificationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    READ = "READ"
    ARCHIVED = "ARCHIVED"

class NotificationType(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ALERT = "ALERT"
    REMINDER = "REMINDER"

class TargetType(str, enum.Enum):
    USER = "USER"
    ROLE = "ROLE"
    DEPARTMENT = "DEPARTMENT"
    TEAM = "TEAM"


class Notification(Base):
    """
    SQLAlchemy model for notifications.
    """
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    investment_id = Column(Integer, ForeignKey('investments.id', ondelete='CASCADE'), nullable=True)
    related_type = Column(Text, nullable=True)
    related_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    # FIX: Set native_enum=False to match the TEXT column in the database schema.
    notification_type = Column(Enum(NotificationType, native_enum=False), nullable=False)
    # FIX: Set native_enum=False to match the TEXT column in the database schema.
    status = Column(Enum(NotificationStatus, native_enum=False), nullable=False, default=NotificationStatus.ACTIVE)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    targets = relationship("NotificationTarget", back_populates="notification", cascade="all, delete-orphan")
    investment = relationship("Investment", back_populates="notifications")

    __table_args__ = (
        CheckConstraint(
            "notification_type IN ('INFO','WARNING','ALERT','REMINDER')",
            name='check_notification_type'
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'READ', 'ARCHIVED')",
            name='check_notification_status'
        ),
    )


class NotificationTarget(Base):
    """
    SQLAlchemy model for notification targets.
    """
    __tablename__ = 'notification_targets'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    notification_id = Column(Integer, ForeignKey('notifications.id', ondelete='CASCADE'), nullable=False, index=True)
    # FIX: Set native_enum=False to match the TEXT column in the database schema.
    target_type = Column(Enum(TargetType, native_enum=False), nullable=False)
    target_id = Column(Integer, nullable=False)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)

    notification = relationship("Notification", back_populates="targets")

    __table_args__ = (
        CheckConstraint(
            "target_type IN ('USER','ROLE','DEPARTMENT','TEAM')",
            name='check_target_type'
        ),
    )

