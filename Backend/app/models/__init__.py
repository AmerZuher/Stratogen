"""
SQLAlchemy models for the Enterprise Project Management System
"""
from sqlalchemy.ext.declarative import declarative_base

# Base class for all models
Base = declarative_base()

# Import all models to ensure they are registered
from .auth import User, Department, Role, UserRole
from .investments import (
    Investment, Idea, Project, KPI, Task, Team, TeamMember,
    RiskIssue, Document
)

from .llm_services import Conversation, Message, Feedback
from .notifications import Notification, NotificationTarget

__all__ = [
    "Base",
    "User", "Department", "Role", "UserRole",
    "Investment", "Idea", "Project", "KPI", "Task", "Team", "TeamMember",
    "RiskIssue", "Document",
    "Conversation", "Message", "Feedback",
    "Notification", "NotificationTarget"
]
