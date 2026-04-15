"""
CRUD operations for authentication models
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.auth.security import verify_password
from app.models.auth import User, Department, Role
from app.models.auth import User, UserRole, Role, Department

async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID"""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.department),
            selectinload(User.user_roles).selectinload(UserRole.role)
        )
        .where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID (alias for get_user)"""
    return await get_user(db, user_id)


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.department),
            selectinload(User.user_roles).selectinload(UserRole.role)
        )
        .where(User.email == email)
    )
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username"""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.department),
            selectinload(User.user_roles).selectinload(UserRole.role)
        )
        .where(User.username == username)
    )
    return result.scalar_one_or_none()


async def authenticate_user(
    db: AsyncSession, 
    username: str, 
    password: str
) -> Optional[User]:
    """Authenticate user with username/email and password"""
    # Try to find user by username first, then by email
    user = await get_user_by_username(db, username)
    if not user:
        user = await get_user_by_email(db, username)
    
    if not user:
        return None
        
    if not verify_password(password, user.hashed_password): # type: ignore
        return None
        
    return user


async def get_users(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> list[User]:
    """Get users with pagination"""
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.department),
            selectinload(User.user_roles).selectinload(UserRole.role)
        )
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_department(db: AsyncSession, department_id: int) -> Optional[Department]:
    """Get department by ID"""
    result = await db.execute(select(Department).where(Department.id == department_id)) # type: ignore
    return result.scalar_one_or_none()


async def get_department_by_name(db: AsyncSession, name: str) -> Optional[Department]:
    """Get department by name"""
    result = await db.execute(select(Department).where(Department.name == name))
    return result.scalar_one_or_none()


async def get_departments(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> list[Department]:
    """Get departments with pagination"""
    result = await db.execute(
        select(Department)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_role(db: AsyncSession, role_id: int) -> Optional[Role]:
    """Get role by ID"""
    result = await db.execute(select(Role).where(Role.id == role_id))
    return result.scalar_one_or_none()


async def get_role_by_name(db: AsyncSession, name: str) -> Optional[Role]:
    """Get role by name"""
    result = await db.execute(select(Role).where(Role.name == name))
    return result.scalar_one_or_none()


async def get_roles(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> list[Role]:
    """Get roles with pagination"""
    result = await db.execute(
        select(Role)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def user_has_role(db: AsyncSession, user_id: int, role_name: str) -> bool:
    """Check if user has a specific role"""
    user = await get_user(db, user_id)
    if not user:
        return False
    
    user_roles = [ur.role.name for ur in user.user_roles] # type: ignore
    return role_name in user_roles


async def user_has_any_role(db: AsyncSession, user_id: int, role_names: list[str]) -> bool:
    """Check if user has any of the specified roles"""
    user = await get_user(db, user_id)
    if not user:
        return False
    
    user_roles = [ur.role.name for ur in user.user_roles] # type: ignore
    return any(role in user_roles for role in role_names)
