"""
Authentication and authorization schemas
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

# ===================================================================
# User Schemas
# ===================================================================

class UserSummary(BaseModel):
    """User summary for token response"""
    id: int
    username: str
    email: EmailStr
    is_superuser: bool
    department: Optional[str] = None
    roles: List[str] = []

class UserResponse(BaseModel):
    """User response schema"""
    id: int
    username: str
    email: EmailStr
    is_active: bool
    is_superuser: bool
    department: Optional[str] = None
    roles: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    """User creation schema (not used in API but for reference)"""
    username: str
    email: EmailStr
    password: str
    department_id: Optional[int] = None
    is_superuser: bool = False

class UserUpdate(BaseModel):
    """User update schema"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    department_id: Optional[int] = None

# ===================================================================
# Token & Auth Schemas
# ===================================================================

class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str
    expires_in: int
    user: "UserSummary"

class LoginRequest(BaseModel):
    """Login request schema"""
    username: str
    password: str
    remember_me: bool = False

class PasswordChangeRequest(BaseModel):
    """Password change request schema"""
    current_password: str
    new_password: str

class TokenValidationResponse(BaseModel):
    """Token validation response"""
    valid: bool
    user_id: Optional[int] = None
    username: Optional[str] = None
    message: Optional[str] = None

# ===================================================================
# Department & Role Schemas
# ===================================================================

class DepartmentResponse(BaseModel):
    """Department response schema"""
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class RoleResponse(BaseModel):
    """Role response schema"""
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# Final Step: Update Forward References
# This MUST be at the end of the file.
# ===================================================================
Token.model_rebuild()
