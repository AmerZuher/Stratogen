"""
Workflow management router
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.auth.dependencies import get_current_active_user
from app.crud import workflows as crud_workflows
from app.crud import investments as crud_investments
from app.workflows.engine import WorkflowEngine
from app.schemas.workflows import (
    WorkflowStateResponse, WorkflowActionRequest, WorkflowActionResponse,
    WorkflowHistoryResponse
)
from app.models.auth import User

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/idea/{idea_id}", response_model=WorkflowStateResponse)
async def get_idea_workflow_state(
    idea_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current workflow state for an idea
    Returns current step, allowed actions, responsible roles/teams
    """
    # Check if idea exists and user has access
    db_idea = await crud_investments.get_idea(db, idea_id)
    if not db_idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    
    # Check ownership or permissions
    if not (current_user.is_superuser or 
            db_idea.investment.created_by_id == current_user.id):
        # Check if user has role-based access to this workflow step
        workflow_engine = WorkflowEngine()
        user_roles = [ur.role.name for ur in current_user.user_roles]
        user_department_id = current_user.department_id
        
        # Get current workflow instance to check permissions
        instance = await crud_workflows.get_workflow_instance_by_investment(db, idea_id)
        if instance and instance.current_step_id:
            has_permission = await crud_workflows.check_workflow_permission(
                db=db,
                step_id=instance.current_step_id,
                user_id=current_user.id,
                user_roles=user_roles,
                user_department_id=user_department_id
            )
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions to access this workflow"
                )
        else:
            # No workflow instance or current step, check basic ownership
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    try:
        workflow_engine = WorkflowEngine()
        workflow_state = await workflow_engine.get_workflow_state(db, idea_id, "IDEA")
        return workflow_state
        
    except Exception as e:
        logger.error(f"Error getting workflow state for idea {idea_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflow state: {str(e)}"
        )


@router.post("/idea/{idea_id}/action", response_model=WorkflowActionResponse)
async def perform_idea_workflow_action(
    idea_id: int,
    action_request: WorkflowActionRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Perform a workflow action on an idea
    Validates permissions, updates idea status, workflow instance, and logs history
    """
    # Check if idea exists
    db_idea = await crud_investments.get_idea(db, idea_id)
    if not db_idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    
    # Get current workflow state
    workflow_engine = WorkflowEngine()
    
    try:
        # Check if user has permission to perform this action
        user_roles = [ur.role.name for ur in current_user.user_roles]
        user_department_id = current_user.department_id
        
        # Validate action and permissions
        can_perform = await workflow_engine.can_user_perform_action(
            db=db,
            investment_id=idea_id,
            entity_type="IDEA",
            action=action_request.action,
            user_id=current_user.id,
            user_roles=user_roles,
            user_department_id=user_department_id
        )
        
        if not can_perform:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have permission to perform action '{action_request.action}'"
            )
        
        # Perform the workflow action
        result = await workflow_engine.perform_action(
            db=db,
            investment_id=idea_id,
            entity_type="IDEA",
            action=action_request.action,
            actor_id=current_user.id,
            notes=action_request.notes
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing workflow action for idea {idea_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing workflow action: {str(e)}"
        )


@router.get("/idea/{idea_id}/history", response_model=List[WorkflowHistoryResponse])
async def get_idea_workflow_history(
    idea_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get workflow history for an idea"""
    # Check if idea exists and user has access
    db_idea = await crud_investments.get_idea(db, idea_id)
    if not db_idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    
    # Check ownership or permissions
    if not (current_user.is_superuser or 
            db_idea.investment.created_by_id == current_user.id):
        # Additional permission checks could be added here
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # Get workflow instance
        instance = await crud_workflows.get_workflow_instance_by_investment(db, idea_id)
        if not instance:
            return []  # No workflow history yet
        
        # Get workflow history
        history = await crud_workflows.get_workflow_history(db, instance.id)
        
        # Convert to response format
        history_response = []
        for entry in history:
            history_response.append(WorkflowHistoryResponse(
                id=entry.id,
                step_name=entry.step.name if entry.step else "Unknown",
                action=entry.action,
                actor_name=entry.actor.username,
                notes=entry.notes,
                created_at=entry.created_at
            ))
        
        return history_response
        
    except Exception as e:
        logger.error(f"Error getting workflow history for idea {idea_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflow history: {str(e)}"
        )


@router.get("/available-actions/{entity_type}/{entity_id}")
async def get_available_workflow_actions(
    entity_type: str,
    entity_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get available workflow actions for a user on a specific entity"""
    if entity_type not in ["IDEA", "PROJECT", "KPI"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid entity type"
        )
    
    try:
        workflow_engine = WorkflowEngine()
        user_roles = [ur.role.name for ur in current_user.user_roles]
        user_department_id = current_user.department_id
        
        # Get workflow state
        workflow_state = await workflow_engine.get_workflow_state(db, entity_id, entity_type)
        
        # Filter actions based on user permissions
        available_actions = []
        for action in workflow_state.available_actions:
            can_perform = await workflow_engine.can_user_perform_action(
                db=db,
                investment_id=entity_id,
                entity_type=entity_type,
                action=action.name,
                user_id=current_user.id,
                user_roles=user_roles,
                user_department_id=user_department_id
            )
            if can_perform:
                available_actions.append(action)
        
        return {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "current_step": workflow_state.current_step,
            "available_actions": available_actions,
            "user_permissions": {
                "roles": user_roles,
                "department": current_user.department.name if current_user.department else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting available actions for {entity_type} {entity_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving available actions: {str(e)}"
        )


@router.get("/my-tasks")
async def get_workflow_tasks_for_user(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get workflow tasks assigned to the current user"""
    try:
        user_roles = [ur.role.name for ur in current_user.user_roles]
        user_department_id = current_user.department_id
        
        # This would be implemented to find all workflow instances
        # where the current step is assigned to the user's roles or department
        # For now, return a placeholder
        
        return {
            "message": "Workflow tasks endpoint - to be implemented",
            "user_roles": user_roles,
            "department_id": user_department_id
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow tasks for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving workflow tasks: {str(e)}"
        )
