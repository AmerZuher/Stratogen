# app/crud/risks_issues.py

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Correctly import the model from its existing location
from app.models.investments import RiskIssue 
from app.schemas.risks_issues import RiskIssueCreate, RiskIssueUpdate

async def get_risk_issue(db: AsyncSession, risk_issue_id: int) -> Optional[RiskIssue]:
    """Get a single risk/issue by its ID."""
    result = await db.execute(select(RiskIssue).where(RiskIssue.id == risk_issue_id))
    return result.scalar_one_or_none()

async def get_risks_issues_for_investment(
    db: AsyncSession, investment_id: int, skip: int = 0, limit: int = 100
) -> List[RiskIssue]:
    """Get all risks/issues for a specific investment with pagination."""
    result = await db.execute(
        select(RiskIssue)
        .where(RiskIssue.investment_id == investment_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_risk_issue(
    db: AsyncSession, risk_issue_in: RiskIssueCreate, investment_id: int
) -> RiskIssue:
    """Create a new risk/issue for an investment."""
    db_risk_issue = RiskIssue(**risk_issue_in.model_dump(), investment_id=investment_id)
    db.add(db_risk_issue)
    await db.commit()
    await db.refresh(db_risk_issue)
    return db_risk_issue

async def update_risk_issue(
    db: AsyncSession, db_obj: RiskIssue, risk_issue_in: RiskIssueUpdate
) -> RiskIssue:
    """Update an existing risk/issue."""
    update_data = risk_issue_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_risk_issue(db: AsyncSession, risk_issue_id: int) -> Optional[RiskIssue]:
    """Delete a risk/issue."""
    db_obj = await get_risk_issue(db, risk_issue_id)
    if db_obj:
        await db.delete(db_obj)
        await db.commit()
    return db_obj