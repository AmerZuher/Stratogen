# app/models/risks_issues.py

import enum
from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base

# Define Enums for type-safe column values
class RiskIssueType(str, enum.Enum):
    RISK = 'RISK'
    ISSUE = 'ISSUE'

class PriorityLevel(str, enum.Enum):
    HIGH = 'High'
    MEDIUM = 'Medium'
    LOW = 'Low'

class RiskIssue(Base):
    """Risk/Issue model"""
    __tablename__ = "risks_issues"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey('investments.id', ondelete='CASCADE'), nullable=False)
    type = Column(SAEnum(RiskIssueType, name='risk_issue_type_enum'), nullable=False)
    name = Column(Text, nullable=False)
    category = Column(Text, nullable=True)
    priority = Column(SAEnum(PriorityLevel, name='priority_level_enum'), nullable=True)
    impact = Column(Integer, nullable=True)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Define relationship to the Investment model
    investment = relationship("Investment", back_populates="risks_issues")

    __table_args__ = (
        CheckConstraint('impact BETWEEN 1 AND 5', name='check_impact_range'),
        CheckConstraint('score >= 0', name='check_score_positive'),
    )