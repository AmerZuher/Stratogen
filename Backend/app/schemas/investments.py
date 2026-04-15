"""
Investment-related schemas
"""
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, validator, ConfigDict

# ===================================================================
# Base Schemas
# ===================================================================

class InvestmentBase(BaseModel):
    """Base investment schema"""
    name: str
    type: str

    @validator('type')
    def validate_type(cls, v):
        allowed_types = ['IDEA', 'PROJECT', 'SME', 'RFP', 'KPI']
        if v not in allowed_types:
            raise ValueError(f'Type must be one of: {allowed_types}')
        return v

class IdeaBase(BaseModel):
    """Base idea schema"""
    demand_type: Optional[str] = None
    fast_track: Optional[bool] = None
    fast_track_reason: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    responsible_unit: Optional[str] = None
    assessment_notes: Optional[str] = None
    owner_department: Optional[str] = None

    @validator('demand_type')
    def validate_demand_type(cls, v):
        if v is not None:
            allowed_types = ['SME', 'RFP', 'PROJECT']
            if v not in allowed_types:
                raise ValueError(f'Demand type must be one of: {allowed_types}')
        return v

class ProjectBase(BaseModel):
    """Base project schema"""
    start_date: date
    end_date: Optional[date] = None
    objective: Optional[str] = None
    planned_cost: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None
    planned_effort: Optional[Decimal] = None
    actual_effort: Optional[Decimal] = None
    baseline_start: Optional[date] = None
    baseline_finish: Optional[date] = None
    progress: Optional[int] = 0

    @validator('progress')
    def validate_progress(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Progress must be between 0 and 100')
        return v

class KPIBase(BaseModel):
    """Base KPI schema"""
    name: str
    target_value: Decimal
    actual_value: Optional[Decimal] = None
    unit: Optional[str] = None
    measured_at: Optional[date] = None

class TaskBase(BaseModel):
    """Base task schema"""
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    owner_id: Optional[int] = None

class DocumentBase(BaseModel):
    """Base document schema"""
    name: str

class RiskIssueBase(BaseModel):
    """Base risk/issue schema"""
    type: str
    name: str
    category: Optional[str] = None
    priority: Optional[str] = None
    impact: Optional[int] = None
    score: Optional[int] = None

    @validator('type')
    def validate_type(cls, v):
        allowed_types = ['RISK', 'ISSUE']
        if v not in allowed_types:
            raise ValueError(f'Type must be one of: {allowed_types}')
        return v

    @validator('priority')
    def validate_priority(cls, v):
        if v is not None:
            allowed_priorities = ['High', 'Medium', 'Low']
            if v not in allowed_priorities:
                raise ValueError(f'Priority must be one of: {allowed_priorities}')
        return v

    @validator('impact')
    def validate_impact(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Impact must be between 1 and 5')
        return v

    @validator('score')
    def validate_score(cls, v):
        if v is not None and v < 0:
            raise ValueError('Score must be non-negative')
        return v

# ===================================================================
# Create Schemas
# ===================================================================

class InvestmentCreate(InvestmentBase):
    """Investment creation schema"""
    pass

class IdeaCreate(IdeaBase):
    """Idea creation schema"""
    pass

class ProjectCreate(ProjectBase):
    """Project creation schema"""
    manager_id: int

class KPICreate(KPIBase):
    """KPI creation schema"""
    pass

class TaskCreate(TaskBase):
    """Task creation schema"""
    pass

class DocumentCreate(DocumentBase):
    """Document creation schema"""
    pass

class RiskIssueCreate(RiskIssueBase):
    """Risk/Issue creation schema"""
    pass

# ===================================================================
# Update Schemas
# ===================================================================

class InvestmentUpdate(BaseModel):
    """Investment update schema"""
    name: Optional[str] = None
    type: Optional[str] = None

class IdeaUpdate(IdeaBase):
    """Idea update schema"""
    status: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = [
                'DMNDSBMSN', 'LINEMNGAPPR', 'ASSESMENT', 'PROJMNGAPR',
                'REVISION', 'CONVERTEDRFP', 'CONVERTEDPRJ', 'CONVERTEDSME', 'CANCELLED'
            ]
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {allowed_statuses}')
        return v

class ProjectUpdate(BaseModel):
    """Project update schema"""
    manager_id: Optional[int] = None
    end_date: Optional[date] = None
    objective: Optional[str] = None
    status: Optional[str] = None
    planned_cost: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None
    planned_effort: Optional[Decimal] = None
    actual_effort: Optional[Decimal] = None
    baseline_start: Optional[date] = None
    baseline_finish: Optional[date] = None
    progress: Optional[int] = None

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['Active', 'On Hold', 'Completed', 'Cancelled']
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {allowed_statuses}')
        return v

    @validator('progress')
    def validate_progress(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Progress must be between 0 and 100')
        return v

class KPIUpdate(BaseModel):
    """KPI update schema"""
    name: Optional[str] = None
    target_value: Optional[Decimal] = None
    actual_value: Optional[Decimal] = None
    unit: Optional[str] = None
    measured_at: Optional[date] = None
    status: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['Draft', 'Active', 'Achieved', 'Cancelled']
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {allowed_statuses}')
        return v

class TaskUpdate(BaseModel):
    """Task update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold']
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {allowed_statuses}')
        return v

class RiskIssueUpdate(BaseModel):
    """Risk/Issue update schema"""
    name: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    impact: Optional[int] = None
    score: Optional[int] = None

# ===================================================================
# Response Schemas (Order is important here)
# ===================================================================

class DocumentResponse(DocumentBase):
    """Document response schema"""
    id: int
    investment_id: int
    location: str
    uploaded_by_id: Optional[int] = None
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TaskResponse(TaskBase):
    """Task response schema"""
    id: int
    investment_id: int
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class KPIResponse(KPIBase):
    """KPI response schema"""
    id: int
    status: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ProjectResponse(ProjectBase):
    """Project response schema"""
    id: int
    manager_id: int
    status: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class IdeaResponse(IdeaBase):
    """Idea response schema"""
    id: int
    status: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RiskIssueResponse(RiskIssueBase):
    """Risk/Issue response schema"""
    id: int
    investment_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TeamMemberResponse(BaseModel):
    """Team member response schema"""
    user_id: int
    role_id: int
    allocation_percent: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class TeamResponse(BaseModel):
    """Team response schema"""
    id: int
    investment_id: int
    name: str
    members: List[TeamMemberResponse] = []
    model_config = ConfigDict(from_attributes=True)

class InvestmentResponse(InvestmentBase):
    """Investment response schema"""
    id: int
    created_by_id: int
    created_date: Optional[date] = None
    last_modified: Optional[datetime] = None
    
    # Related data - using string forward references
    idea: Optional["IdeaResponse"] = None
    project: Optional["ProjectResponse"] = None
    kpi: Optional["KPIResponse"] = None
    tasks: List["TaskResponse"] = []
    documents: List["DocumentResponse"] = []
    
    model_config = ConfigDict(from_attributes=True)

class InvestmentRecommendation(BaseModel):
    """Schema for investment recommendations."""
    id: int
    name: str
    type: str
    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# Final Step: Update Forward References
# This MUST be at the end of the file.
# ===================================================================
InvestmentResponse.model_rebuild()
