# app/routers/risks_issues.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.auth.dependencies import get_current_active_user
from app.models.auth import User
from app.crud import risks_issues as crud
from app.schemas import risks_issues as schemas

# Create an APIRouter instance
router = APIRouter()

@router.post(
    "/investments/{investment_id}",
    response_model=schemas.RiskIssue,
    status_code=status.HTTP_201_CREATED,
    summary="Create Risk or Issue for Investment"
)
async def create_risk_issue_for_investment(
    investment_id: int,
    risk_issue_in: schemas.RiskIssueCreate,
    db: AsyncSession = Depends(get_db_session),
    # Protect the endpoint by requiring an active user
    current_user: User = Depends(get_current_active_user)
):

    return await crud.create_risk_issue(db=db, risk_issue_in=risk_issue_in, investment_id=investment_id)


@router.get(
    "/investments/{investment_id}",
    response_model=List[schemas.RiskIssue],
    summary="Get All Risks & Issues for an Investment"
)
async def read_risks_issues_for_investment(
    investment_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all risks and issues associated with a specific investment, with pagination.
    """
    return await crud.get_risks_issues_for_investment(db=db, investment_id=investment_id, skip=skip, limit=limit)


@router.get(
    "/{risk_issue_id}",
    response_model=schemas.RiskIssue,
    summary="Get a Specific Risk or Issue"
)
async def read_risk_issue(
    risk_issue_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve a specific risk or issue by its unique ID.
    """
    db_risk_issue = await crud.get_risk_issue(db, risk_issue_id=risk_issue_id)
    if db_risk_issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk/Issue not found")
    return db_risk_issue


@router.put(
    "/{risk_issue_id}",
    response_model=schemas.RiskIssue,
    summary="Update a Risk or Issue"
)
async def update_risk_issue(
    risk_issue_id: int,
    risk_issue_in: schemas.RiskIssueUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update the details of a specific risk or issue.
    """
    db_risk_issue = await crud.get_risk_issue(db, risk_issue_id=risk_issue_id)
    if db_risk_issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk/Issue not found")
    return await crud.update_risk_issue(db=db, db_obj=db_risk_issue, risk_issue_in=risk_issue_in)


@router.delete(
    "/{risk_issue_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a Risk or Issue"
)
async def delete_risk_issue(
    risk_issue_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a specific risk or issue from the database.
    """
    db_risk_issue = await crud.delete_risk_issue(db, risk_issue_id=risk_issue_id)
    if db_risk_issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk/Issue not found")
    # A 204 response should not have a body, so we return None.
    return None
