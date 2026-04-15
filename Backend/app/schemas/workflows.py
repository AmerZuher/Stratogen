"""
Workflow schemas
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# ===================================================================
# Workflow State & Action Schemas
# ===================================================================

class WorkflowActionInfo(BaseModel):
    """Workflow action information"""
    name: str
    next_step: Optional[str] = None
    is_terminal: bool = False

class WorkflowStepInfo(BaseModel):
    """Workflow step information"""
    id: int
    name: str
    status: Optional[str] = None
    is_terminal: bool = False
    available_actions: List[WorkflowActionInfo] = []

class WorkflowResponsibleInfo(BaseModel):
    """Workflow responsible information"""
    type: str  # USER, TEAM, ROLE, DEPARTMENT
    role: Optional[str] = None
    department: Optional[str] = None

class WorkflowStateResponse(BaseModel):
    """Workflow state response"""
    entity_id: int
    entity_type: str
    current_step: Optional[WorkflowStepInfo] = None
    status: str
    available_actions: List[WorkflowActionInfo] = []
    responsible: List[WorkflowResponsibleInfo] = []
    can_user_act: bool = False

class WorkflowActionRequest(BaseModel):
    """Workflow action request"""
    action: str
    notes: Optional[str] = None

class WorkflowActionResponse(BaseModel):
    """Workflow action response"""
    success: bool
    message: str
    new_status: Optional[str] = None
    new_step: Optional[str] = None
    is_terminal: bool = False

class WorkflowHistoryResponse(BaseModel):
    """Workflow history response"""
    id: int
    step_name: str
    action: str
    actor_name: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# Workflow Definition & Configuration Schemas
# ===================================================================

class WorkflowDefinition(BaseModel):
    """Workflow definition from YAML"""
    name: str
    entity_type: str
    statuses: List[str]
    steps: List[dict]

class WorkflowStepDefinition(BaseModel):
    """Workflow step definition"""
    name: str
    status: str
    responsible: dict
    actions: dict

class WorkflowValidationResponse(BaseModel):
    """Workflow validation response"""
    valid: bool
    errors: List[str] = []
    warnings: List[str] = []

class WorkflowConfigurationResponse(BaseModel):
    """Workflow configuration response"""
    workflows: List[WorkflowDefinition]
    version: str
    last_updated: datetime
    is_valid: bool
    validation_errors: List[str] = []

# ===================================================================
# Workflow Metrics & Task Schemas
# ===================================================================

class WorkflowMetrics(BaseModel):
    """Workflow metrics"""
    total_instances: int
    active_instances: int
    completed_instances: int
    cancelled_instances: int
    average_completion_time_days: Optional[float] = None
    steps_distribution: dict = {}

class WorkflowTaskResponse(BaseModel):
    """Workflow task for user"""
    entity_id: int
    entity_type: str
    entity_name: str
    current_step: str
    waiting_since: datetime
    priority: Optional[str] = None
    assigned_roles: List[str] = []
    assigned_departments: List[str] = []
