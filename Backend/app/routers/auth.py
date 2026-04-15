"""
Authentication router
"""
from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.auth.security import create_access_token
from app.auth.dependencies import get_current_active_user
from app.crud.auth import authenticate_user, get_user
from app.schemas.auth import Token, UserResponse
from app.models.auth import User

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_for_access_token(
    db: AsyncSession = Depends(get_db_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
    remember_me: Optional[bool] = Form(False)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    
    # Create access token
    access_token_expires = timedelta(minutes=30)  # Default
    if remember_me:
        access_token_expires = timedelta(days=7)  # Extended for remember me
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
        remember_me=bool(remember_me)
    )

    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds()),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "department": user.department.name if user.department else None,
            "roles": [ur.role.name for ur in user.user_roles] # type: ignore
        }
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_active_user)
):
    """
    Refresh access token
    """
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds()),
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "is_superuser": current_user.is_superuser,
            "department": current_user.department.name if current_user.department else None,
            "roles": [ur.role.name for ur in current_user.user_roles] # type: ignore
        }
    }


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "department": current_user.department.name if current_user.department else None,
        "roles": [ur.role.name for ur in current_user.user_roles] # type: ignore
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout endpoint (client should delete token)
    """
    return {"message": "Successfully logged out"}


@router.get("/validate")
async def validate_token(
    current_user: User = Depends(get_current_active_user)
):
    """
    Validate token endpoint
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "username": current_user.username
    }
