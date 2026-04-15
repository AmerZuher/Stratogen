# app/schemas/risks_issues.py

import enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

# Define Enums for validation at the API layer
class RiskIssueType(str, enum.Enum):
    RISK = 'RISK'
    ISSUE = 'ISSUE'

class PriorityLevel(str, enum.Enum):
    HIGH = 'High'
    MEDIUM = 'Medium'
    LOW = 'Low'

# Base schema with common attributes
class RiskIssueBase(BaseModel):
    type: RiskIssueType
    name: str = Field(..., min_length=3)
    category: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    impact: Optional[int] = Field(None, ge=1, le=5)
    score: Optional[int] = Field(None, ge=0)

# Schema for creating a new risk/issue
class RiskIssueCreate(RiskIssueBase):
    pass

# Schema for updating a risk/issue
class RiskIssueUpdate(BaseModel):
    type: Optional[RiskIssueType] = None
    name: Optional[str] = Field(None, min_length=3)
    category: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    impact: Optional[int] = Field(None, ge=1, le=5)
    score: Optional[int] = Field(None, ge=0)

# Schema for reading/returning a risk/issue from the API
class RiskIssue(RiskIssueBase):
    id: int
    investment_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)