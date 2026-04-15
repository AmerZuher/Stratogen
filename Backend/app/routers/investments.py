"""
Investment management router
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.auth.dependencies import get_current_active_user
from app.crud import investments as crud_investments
from app.schemas.investments import (
    InvestmentResponse, InvestmentCreate, InvestmentUpdate,
    IdeaResponse, IdeaUpdate,
    ProjectResponse, ProjectUpdate,
    KPIResponse, KPIUpdate,
    TaskResponse, TaskCreate, TaskUpdate
)
from app.models.auth import User

router = APIRouter()


# Investment endpoints
@router.post("/", response_model=InvestmentResponse)
async def create_investment(
    investment: InvestmentCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new investment"""
    try:
        db_investment = await crud_investments.create_investment(
            db=db,
            investment=investment,
            created_by_id=current_user.id
        )
        return db_investment
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating investment: {str(e)}"
        )


@router.get("/", response_model=List[InvestmentResponse])
async def get_investments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    investment_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get investments with filtering and pagination"""
    # For regular users, only show their own investments
    created_by_id = None if current_user.is_superuser else current_user.id
    
    investments = await crud_investments.get_investments(
        db=db,
        skip=skip,
        limit=limit,
        investment_type=investment_type,
        created_by_id=created_by_id
    )
    return investments


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get investment by ID"""
    db_investment = await crud_investments.get_investment(db, investment_id)
    
    if not db_investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    # Check ownership (superuser can access all)
    if not current_user.is_superuser and db_investment.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_investment


@router.put("/{investment_id}", response_model=InvestmentResponse)
async def update_investment(
    investment_id: int,
    investment_update: InvestmentUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update investment"""
    # Check ownership first
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_investment = await crud_investments.update_investment(
        db=db,
        investment_id=investment_id,
        investment_update=investment_update
    )
    
    if not db_investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    return db_investment


@router.delete("/{investment_id}")
async def delete_investment(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete investment (superuser only)"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can delete investments"
        )
    
    success = await crud_investments.delete_investment(db, investment_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    return {"message": "Investment deleted successfully"}


# Idea endpoints
@router.get("/{investment_id}/idea", response_model=IdeaResponse)
async def get_idea(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get idea details"""
    # Check ownership
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_idea = await crud_investments.get_idea(db, investment_id)
    
    if not db_idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    
    return db_idea


@router.put("/{investment_id}/idea", response_model=IdeaResponse)
async def update_idea(
    investment_id: int,
    idea_update: IdeaUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update idea"""
    # Check ownership
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_idea = await crud_investments.update_idea(
        db=db,
        idea_id=investment_id,
        idea_update=idea_update
    )
    
    if not db_idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    
    return db_idea


# Project endpoints
@router.get("/{investment_id}/project", response_model=ProjectResponse)
async def get_project(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get project details"""
    # Check ownership or management
    db_project = await crud_investments.get_project(db, investment_id)
    
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Allow access to project owner, manager, or superuser
    if not (current_user.is_superuser or 
            db_project.investment.created_by_id == current_user.id or
            db_project.manager_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_project


@router.put("/{investment_id}/project", response_model=ProjectResponse)
async def update_project(
    investment_id: int,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update project"""
    # Check ownership or management
    db_project = await crud_investments.get_project(db, investment_id)
    
    if not db_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Allow updates by project owner, manager, or superuser
    if not (current_user.is_superuser or 
            db_project.investment.created_by_id == current_user.id or
            db_project.manager_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_project = await crud_investments.update_project(
        db=db,
        project_id=investment_id,
        project_update=project_update
    )
    
    return updated_project


# KPI endpoints
@router.get("/{investment_id}/kpi", response_model=KPIResponse)
async def get_kpi(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get KPI details"""
    # Check ownership
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_kpi = await crud_investments.get_kpi(db, investment_id)
    
    if not db_kpi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI not found"
        )
    
    return db_kpi


@router.put("/{investment_id}/kpi", response_model=KPIResponse)
async def update_kpi(
    investment_id: int,
    kpi_update: KPIUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update KPI"""
    # Check ownership
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_kpi = await crud_investments.update_kpi(
        db=db,
        kpi_id=investment_id,
        kpi_update=kpi_update
    )
    
    if not db_kpi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KPI not found"
        )
    
    return db_kpi


# Task endpoints
@router.post("/{investment_id}/tasks", response_model=TaskResponse)
async def create_task(
    investment_id: int,
    task: TaskCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task"""
    # Check ownership
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_task = await crud_investments.create_task(
        db=db,
        task=task,
        investment_id=investment_id
    )
    return db_task


@router.get("/{investment_id}/tasks", response_model=List[TaskResponse])
async def get_investment_tasks(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get tasks for an investment"""
    # Check ownership
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    tasks = await crud_investments.get_tasks_by_investment(db, investment_id)
    return tasks

# User's tasks endpoint
@router.get("/tasks/my-tasks", response_model=List[TaskResponse])
async def get_my_tasks(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's assigned tasks"""
    tasks = await crud_investments.get_tasks_by_owner(db, current_user.id)
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get task by ID"""
    db_task = await crud_investments.get_task(db, task_id)
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check ownership or assignment
    if not (current_user.is_superuser or 
            db_task.investment.created_by_id == current_user.id or
            db_task.owner_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update task"""
    db_task = await crud_investments.get_task(db, task_id)
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check ownership or assignment
    if not (current_user.is_superuser or 
            db_task.investment.created_by_id == current_user.id or
            db_task.owner_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_task = await crud_investments.update_task(
        db=db,
        task_id=task_id,
        task_update=task_update
    )
    
    return updated_task


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete task"""
    db_task = await crud_investments.get_task(db, task_id)
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check ownership
    if not (current_user.is_superuser or 
            db_task.investment.created_by_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = await crud_investments.delete_task(db, task_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {"message": "Task deleted successfully"}



