# app/models/users.py

from sqlalchemy import (
    Boolean, Column, Integer, String, Text, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from . import Base

# Association table for the many-to-many relationship between users and roles
user_roles = Table('user_roles', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)

class Department(Base):
    """
    SQLAlchemy model for the 'departments' table.
    """
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)

    users = relationship("User", back_populates="department")

class Role(Base):
    """
    SQLAlchemy model for the 'roles' table.
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, unique=True, nullable=False)

    users = relationship("User", secondary=user_roles, back_populates="roles")
    team_members = relationship("TeamMember", back_populates="role")


class User(Base):
    """
    SQLAlchemy model for the 'users' table.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    department = relationship("Department", back_populates="users")
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    team_memberships = relationship("TeamMember", back_populates="user")
