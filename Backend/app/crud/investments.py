"""
CRUD operations for investment-related models
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.investments import (
    Investment, Idea, Project, KPI, Task, Team, TeamMember,
    RiskIssue, Document
)
from app.schemas.investments import (
    InvestmentCreate, InvestmentUpdate,
    IdeaCreate, IdeaUpdate,
    ProjectCreate, ProjectUpdate,
    KPICreate, KPIUpdate,
    TaskCreate, TaskUpdate
)

# --- Helper function to re-fetch an investment with all relations ---
async def _get_investment_with_relations(db: AsyncSession, investment_id: int) -> Optional[Investment]:
    query = (
        select(Investment)
        .where(Investment.id == investment_id)
        .options(
            selectinload(Investment.created_by),
            selectinload(Investment.idea),
            selectinload(Investment.project).selectinload(Project.manager),
            selectinload(Investment.kpi),
            selectinload(Investment.tasks),
            selectinload(Investment.teams).selectinload(Team.members),
            selectinload(Investment.risks_issues),
            selectinload(Investment.documents)
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


# Investment CRUD
async def create_investment(
    db: AsyncSession,
    investment: InvestmentCreate,
    created_by_id: int
) -> Investment:
    """Create a new investment"""
    db_investment = Investment(
        **investment.dict(),
        created_by_id=created_by_id
    )
    db.add(db_investment)
    await db.commit()
    # Re-fetch with relations to ensure response model is populated
    return await _get_investment_with_relations(db, db_investment.id) # type: ignore


async def get_investment(db: AsyncSession, investment_id: int) -> Optional[Investment]:
    """Get investment by ID"""
    return await _get_investment_with_relations(db, investment_id)

async def get_investments(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    investment_type: Optional[str] = None,
    created_by_id: Optional[int] = None
) -> List[Investment]:
    """Get investments with filtering and pagination"""
    query = select(Investment).options(
        selectinload(Investment.created_by),
        selectinload(Investment.idea),
        selectinload(Investment.project),
        selectinload(Investment.kpi),
        selectinload(Investment.tasks),
        selectinload(Investment.documents)
    )
    
    conditions = []
    if investment_type:
        conditions.append(Investment.type == investment_type)
    if created_by_id:
        conditions.append(Investment.created_by_id == created_by_id)
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def update_investment(
    db: AsyncSession,
    investment_id: int,
    investment_update: InvestmentUpdate
) -> Optional[Investment]:
    """Update investment"""
    result = await db.execute(select(Investment).where(Investment.id == investment_id))
    db_investment = result.scalar_one_or_none()
    
    if not db_investment:
        return None
    
    update_data = investment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_investment, field, value)
    
    await db.commit()
    # Re-fetch with relations to avoid lazy loading errors on response
    return await _get_investment_with_relations(db, investment_id)



async def delete_investment(db: AsyncSession, investment_id: int) -> bool:
    """Delete investment"""
    result = await db.execute(select(Investment).where(Investment.id == investment_id))
    db_investment = result.scalar_one_or_none()
    
    if not db_investment:
        return False
    
    await db.delete(db_investment)
    await db.commit()
    return True


# Idea CRUD
async def get_idea(db: AsyncSession, idea_id: int) -> Optional[Idea]:
    """Get idea by ID"""
    result = await db.execute(
        select(Idea)
        .options(selectinload(Idea.investment).selectinload(Investment.created_by))
        .where(Idea.id == idea_id)
    )
    return result.scalar_one_or_none()


async def update_idea(
    db: AsyncSession,
    idea_id: int,
    idea_update: IdeaUpdate
) -> Optional[Idea]:
    """Update idea"""
    result = await db.execute(select(Idea).where(Idea.id == idea_id))
    db_idea = result.scalar_one_or_none()
    
    if not db_idea:
        return None
    
    update_data = idea_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_idea, field, value)
    
    await db.commit()
    # Re-fetch with relations
    return await get_idea(db, idea_id)


async def get_ideas_by_status(db: AsyncSession, status: str) -> List[Idea]:
    """Get ideas by status"""
    result = await db.execute(
        select(Idea)
        .options(selectinload(Idea.investment).selectinload(Investment.created_by))
        .where(Idea.status == status)
    )
    return result.scalars().all()


# Project CRUD
async def get_project(db: AsyncSession, project_id: int) -> Optional[Project]:
    """Get project by ID"""
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.investment).selectinload(Investment.created_by),
            selectinload(Project.manager)
        )
        .where(Project.id == project_id)
    )
    return result.scalar_one_or_none()


async def update_project(
    db: AsyncSession,
    project_id: int,
    project_update: ProjectUpdate
) -> Optional[Project]:
    """Update project"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    db_project = result.scalar_one_or_none()
    
    if not db_project:
        return None
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    await db.commit()
    # Re-fetch with relations
    return await get_project(db, project_id)

async def get_projects_by_manager(db: AsyncSession, manager_id: int) -> List[Project]:
    """Get projects by manager"""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.investment))
        .where(Project.manager_id == manager_id)
    )
    return result.scalars().all()


# KPI CRUD
async def get_kpi(db: AsyncSession, kpi_id: int) -> Optional[KPI]:
    """Get KPI by ID"""
    result = await db.execute(
        select(KPI)
        .options(selectinload(KPI.investment).selectinload(Investment.created_by))
        .where(KPI.id == kpi_id)
    )
    return result.scalar_one_or_none()


async def update_kpi(
    db: AsyncSession,
    kpi_id: int,
    kpi_update: KPIUpdate
) -> Optional[KPI]:
    """Update KPI"""
    result = await db.execute(select(KPI).where(KPI.id == kpi_id))
    db_kpi = result.scalar_one_or_none()
    
    if not db_kpi:
        return None
    
    update_data = kpi_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_kpi, field, value)
    
    await db.commit()
    # Re-fetch with relations
    return await get_kpi(db, kpi_id)

# Task CRUD
async def create_task(
    db: AsyncSession,
    task: TaskCreate,
    investment_id: int
) -> Task:
    """Create a new task"""
    db_task = Task(
        **task.dict(),
        investment_id=investment_id
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task


async def get_task(db: AsyncSession, task_id: int) -> Optional[Task]:
    """Get task by ID"""
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.investment),
            selectinload(Task.owner)
        )
        .where(Task.id == task_id)
    )
    return result.scalar_one_or_none()


async def get_tasks_by_investment(
    db: AsyncSession,
    investment_id: int
) -> List[Task]:
    """Get tasks by investment"""
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.owner))
        .where(Task.investment_id == investment_id)
    )
    return result.scalars().all()


async def get_tasks_by_owner(db: AsyncSession, owner_id: int) -> List[Task]:
    """Get tasks by owner"""
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.investment))
        .where(Task.owner_id == owner_id)
    )
    return result.scalars().all()


async def update_task(
    db: AsyncSession,
    task_id: int,
    task_update: TaskUpdate
) -> Optional[Task]:
    """Update task"""
    result = await db.execute(select(Task).where(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    
    if not db_task:
        return None
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    await db.commit()
    # Re-fetch with relations
    return await get_task(db, task_id)
    

async def delete_task(db: AsyncSession, task_id: int) -> bool:
    """Delete task"""
    result = await db.execute(select(Task).where(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    
    if not db_task:
        return False
    
    await db.delete(db_task)
    await db.commit()
    return True


# Team CRUD
async def get_teams_by_investment(
    db: AsyncSession,
    investment_id: int
) -> List[Team]:
    """Get teams by investment"""
    result = await db.execute(
        select(Team)
        .options(
            selectinload(Team.members)
            .selectinload(TeamMember.user),
            selectinload(Team.members)
            .selectinload(TeamMember.role)
        )
        .where(Team.investment_id == investment_id)
    )
    return result.scalars().all()


# Risk/Issue CRUD
async def get_risks_issues_by_investment(
    db: AsyncSession,
    investment_id: int
) -> List[RiskIssue]:
    """Get risks/issues by investment"""
    result = await db.execute(
        select(RiskIssue)
        .where(RiskIssue.investment_id == investment_id)
    )
    return result.scalars().all()


# Ownership validation
async def check_investment_ownership(
    db: AsyncSession,
    investment_id: int,
    user_id: int
) -> bool:
    """Check if user owns or has access to investment"""
    result = await db.execute(
        select(Investment)
        .where(
            and_(
                Investment.id == investment_id,
                Investment.created_by_id == user_id
            )
        )
    )
    return result.scalar_one_or_none() is not None
