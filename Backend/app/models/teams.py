# app/models/teams.py

from sqlalchemy import (
    Column, Integer, Text, ForeignKey, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship
from . import Base

class Team(Base):
    """
    SQLAlchemy model for the 'teams' table.
    """
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)

    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    investment = relationship("Investment", back_populates="teams")

    __table_args__ = (
        UniqueConstraint('investment_id', 'name', name='unique_team_per_investment'),
    )


class TeamMember(Base):
    """
    SQLAlchemy model for the 'team_members' table.
    """
    __tablename__ = "team_members"

    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    allocation_percent = Column(Integer, nullable=True)

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")
    role = relationship("Role", back_populates="team_members")

    __table_args__ = (
        CheckConstraint('allocation_percent >= 0 AND allocation_percent <= 100', name='check_allocation_range'),
    )
