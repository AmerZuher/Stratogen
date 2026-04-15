"""
CRUD operations for workflow models
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.workflows import (
    Workflow, WorkflowStep, WorkflowAction, WorkflowResponsible,
    WorkflowInstance, WorkflowHistory
)


# Workflow CRUD
async def get_workflow_by_entity_type(
    db: AsyncSession,
    entity_type: str
) -> Optional[Workflow]:
    """Get active workflow by entity type"""
    result = await db.execute(
        select(Workflow)
        .options(
            selectinload(Workflow.steps)
            .selectinload(WorkflowStep.actions),
            selectinload(Workflow.steps)
            .selectinload(WorkflowStep.responsibles)
            .selectinload(WorkflowResponsible.role),
            selectinload(Workflow.steps)
            .selectinload(WorkflowStep.responsibles)
            .selectinload(WorkflowResponsible.department)
        )
        .where(
            and_(
                Workflow.entity_type == entity_type,
                Workflow.is_active == True
            )
        )
    )
    return result.scalar_one_or_none()


async def get_workflow_step_by_status(
    db: AsyncSession,
    workflow_id: int,
    status: str
) -> Optional[WorkflowStep]:
    """Get workflow step by demand status"""
    result = await db.execute(
        select(WorkflowStep)
        .options(
            selectinload(WorkflowStep.actions),
            selectinload(WorkflowStep.responsibles)
            .selectinload(WorkflowResponsible.role),
            selectinload(WorkflowStep.responsibles)
            .selectinload(WorkflowResponsible.department)
        )
        .where(
            and_(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.demand_status == status
            )
        )
    )
    return result.scalar_one_or_none()


# Workflow Instance CRUD
async def create_workflow_instance(
    db: AsyncSession,
    workflow_id: int,
    investment_id: int,
    initial_step_id: Optional[int] = None
) -> WorkflowInstance:
    """Create a new workflow instance"""
    db_instance = WorkflowInstance(
        workflow_id=workflow_id,
        investment_id=investment_id,
        current_step_id=initial_step_id
    )
    db.add(db_instance)
    await db.commit()
    await db.refresh(db_instance)
    return db_instance


async def get_workflow_instance_by_investment(
    db: AsyncSession,
    investment_id: int
) -> Optional[WorkflowInstance]:
    """Get active workflow instance by investment"""
    result = await db.execute(
        select(WorkflowInstance)
        .options(
            selectinload(WorkflowInstance.workflow),
            selectinload(WorkflowInstance.current_step)
            .selectinload(WorkflowStep.actions),
            selectinload(WorkflowInstance.current_step)
            .selectinload(WorkflowStep.responsibles)
            .selectinload(WorkflowResponsible.role),
            selectinload(WorkflowInstance.current_step)
            .selectinload(WorkflowStep.responsibles)
            .selectinload(WorkflowResponsible.department)
        )
        .where(
            and_(
                WorkflowInstance.investment_id == investment_id,
                WorkflowInstance.status == "in_progress"
            )
        )
    )
    return result.scalar_one_or_none()


async def update_workflow_instance_step(
    db: AsyncSession,
    instance_id: int,
    new_step_id: Optional[int],
    status: str = "in_progress"
) -> Optional[WorkflowInstance]:
    """Update workflow instance current step"""
    result = await db.execute(
        select(WorkflowInstance)
        .where(WorkflowInstance.id == instance_id)
    )
    db_instance = result.scalar_one_or_none()
    
    if not db_instance:
        return None
    
    db_instance.current_step_id = new_step_id
    db_instance.status = status
    
    await db.commit()
    await db.refresh(db_instance)
    return db_instance


# Workflow History CRUD
async def create_workflow_history_entry(
    db: AsyncSession,
    instance_id: int,
    step_id: Optional[int],
    action: str,
    actor_id: int,
    notes: Optional[str] = None
) -> WorkflowHistory:
    """Create a workflow history entry"""
    db_history = WorkflowHistory(
        instance_id=instance_id,
        step_id=step_id,
        action=action,
        actor_id=actor_id,
        notes=notes
    )
    db.add(db_history)
    await db.commit()
    await db.refresh(db_history)
    return db_history


async def get_workflow_history(
    db: AsyncSession,
    instance_id: int
) -> List[WorkflowHistory]:
    """Get workflow history for an instance"""
    result = await db.execute(
        select(WorkflowHistory)
        .options(
            selectinload(WorkflowHistory.step),
            selectinload(WorkflowHistory.actor)
        )
        .where(WorkflowHistory.instance_id == instance_id)
        .order_by(WorkflowHistory.created_at.desc())
    )
    return result.scalars().all()


# Workflow Action Validation
async def get_workflow_action(
    db: AsyncSession,
    step_id: int,
    action_name: str
) -> Optional[WorkflowAction]:
    """Get specific workflow action"""
    result = await db.execute(
        select(WorkflowAction)
        .options(selectinload(WorkflowAction.next_step))
        .where(
            and_(
                WorkflowAction.step_id == step_id,
                WorkflowAction.action == action_name
            )
        )
    )
    return result.scalar_one_or_none()


async def get_available_actions(
    db: AsyncSession,
    step_id: int
) -> List[WorkflowAction]:
    """Get all available actions for a workflow step"""
    result = await db.execute(
        select(WorkflowAction)
        .options(selectinload(WorkflowAction.next_step))
        .where(WorkflowAction.step_id == step_id)
    )
    return result.scalars().all()


# Permission Checking
async def check_workflow_permission(
    db: AsyncSession,
    step_id: int,
    user_id: int,
    user_roles: List[str],
    user_department_id: Optional[int] = None
) -> bool:
    """Check if user has permission to perform actions on a workflow step"""
    result = await db.execute(
        select(WorkflowResponsible)
        .options(
            selectinload(WorkflowResponsible.role),
            selectinload(WorkflowResponsible.department)
        )
        .where(WorkflowResponsible.step_id == step_id)
    )
    
    responsibles = result.scalars().all()
    
    for responsible in responsibles:
        # Check role-based permission
        if responsible.role and responsible.role.name in user_roles:
            return True
        
        # Check department-based permission
        if (responsible.department and 
            user_department_id and 
            responsible.department.id == user_department_id):
            return True
    
    return False
