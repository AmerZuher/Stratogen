"""
Authentication and authorization models
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship

from . import Base


class Department(Base):
    """Department model"""
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    
    # Relationships
    users = relationship("User", back_populates="department")
    workflow_responsibles = relationship("WorkflowResponsible", back_populates="department")


class Role(Base):
    """Role model"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    
    # Relationships
    user_roles = relationship("UserRole", back_populates="role")
    team_members = relationship("TeamMember", back_populates="role")
    workflow_responsibles = relationship("WorkflowResponsible", back_populates="role")


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_superuser = Column(Boolean, nullable=False, default=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Relationships
    department = relationship("Department", back_populates="users")
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    
    # Investment relationships
    created_investments = relationship("Investment", back_populates="created_by")
    managed_projects = relationship("Project", back_populates="manager")
    owned_tasks = relationship("Task", back_populates="owner")
    uploaded_documents = relationship("Document", back_populates="uploaded_by")
    
    # Team relationships
    team_memberships = relationship("TeamMember", back_populates="user")
    
    # Workflow relationships
    workflow_actions = relationship("WorkflowHistory", back_populates="actor")
    
    # Conversation relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")


class UserRole(Base):
    """User-Role association model"""
    __tablename__ = "user_roles"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    
    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")
