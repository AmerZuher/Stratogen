# app/schemas/users.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional

class DepartmentInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class RoleInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserInfo(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    users: List[UserInfo] = []

    class Config:
        from_attributes = True

# --- Role Schemas ---
class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    department: Optional[DepartmentInfo] = None
    roles: List[RoleInfo] = []

    class Config:
        from_attributes = True

# --- Schema for Superuser to update user assignments ---
class UserAssignmentsUpdate(BaseModel):
    department_id: Optional[int] = None
    role_ids: Optional[List[int]] = None
    # Note: Team assignments are handled separately via team membership
