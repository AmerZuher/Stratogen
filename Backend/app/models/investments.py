"""
Investment-related models (Ideas, Projects, KPIs, Tasks, etc.)
"""
from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Numeric, Text,
    CheckConstraint, UniqueConstraint, func
)
from sqlalchemy.orm import relationship

from . import Base


class Investment(Base):
    """Main investment model - parent for Ideas, Projects, KPIs"""
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_date = Column(Date, default=func.current_date())
    last_modified = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint("type IN ('IDEA', 'PROJECT', 'SME', 'RFP', 'KPI')", name="check_investment_type"),
        UniqueConstraint("type", "name", name="unique_name_per_type"),
    )
    
    # Relationships
    created_by = relationship("User", back_populates="created_investments")
    
    # Subtype relationships (one-to-one)
    idea = relationship("Idea", back_populates="investment", uselist=False, cascade="all, delete-orphan")
    project = relationship("Project", back_populates="investment", uselist=False, cascade="all, delete-orphan")
    kpi = relationship("KPI", back_populates="investment", uselist=False, cascade="all, delete-orphan")
    
    # Related entities
    tasks = relationship("Task", back_populates="investment", cascade="all, delete-orphan")
    teams = relationship("Team", back_populates="investment", cascade="all, delete-orphan")
    risks_issues = relationship("RiskIssue", back_populates="investment", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="investment", cascade="all, delete-orphan")
    workflow_instances = relationship("WorkflowInstance", back_populates="investment", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="investment")



class Idea(Base):
    """Idea model - extends Investment"""
    __tablename__ = "ideas"
    
    id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), primary_key=True)
    status = Column(String, nullable=True)
    demand_type = Column(String, nullable=True)
    fast_track = Column(Boolean, nullable=True)
    fast_track_reason = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    responsible_unit = Column(String, nullable=True)
    assessment_notes = Column(Text, nullable=True)
    owner_department = Column(String, nullable=True)
    document_path = Column(String, nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('DMNDSBMSN','LINEMNGAPPR','ASSESMENT','PROJMNGAPR','REVISION','CONVERTEDRFP','CONVERTEDPRJ','CONVERTEDSME','CANCELLED')",
            name="check_idea_status"
        ),
        CheckConstraint("demand_type IN ('SME', 'RFP', 'PROJECT')", name="check_demand_type"),
    )
    
    # Relationships
    investment = relationship("Investment", back_populates="idea")


class Project(Base):
    """Project model - extends Investment"""
    __tablename__ = "projects"
    
    id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), primary_key=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    objective = Column(Text, nullable=True)
    status = Column(String, nullable=True)
    planned_cost = Column(Numeric, nullable=True)
    actual_cost = Column(Numeric, nullable=True)
    planned_effort = Column(Numeric, nullable=True)
    actual_effort = Column(Numeric, nullable=True)
    baseline_start = Column(Date, nullable=True)
    baseline_finish = Column(Date, nullable=True)
    progress = Column(Integer, default=0)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('Active', 'On Hold', 'Completed', 'Cancelled')", name="check_project_status"),
        CheckConstraint("progress >= 0 AND progress <= 100", name="check_progress_range"),
    )
    
    # Relationships
    investment = relationship("Investment", back_populates="project")
    manager = relationship("User", back_populates="managed_projects")


class KPI(Base):
    """KPI model - extends Investment"""
    __tablename__ = "kpi"
    
    id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String, nullable=False)
    target_value = Column(Numeric, nullable=False)
    actual_value = Column(Numeric, nullable=True)
    unit = Column(String, nullable=True)
    measured_at = Column(Date, default=func.current_date())
    status = Column(String, default="Draft")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('Draft', 'Active', 'Achieved', 'Cancelled')", name="check_kpi_status"),
    )
    
    # Relationships
    investment = relationship("Investment", back_populates="kpi")


class Task(Base):
    """Task model"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="Not Started")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('Not Started', 'In Progress', 'Completed', 'On Hold')", name="check_task_status"),
    )
    
    # Relationships
    investment = relationship("Investment", back_populates="tasks")
    owner = relationship("User", back_populates="owned_tasks")


class Team(Base):
    """Team model"""
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("investment_id", "name", name="unique_team_per_investment"),
    )
    
    # Relationships
    investment = relationship("Investment", back_populates="teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    """Team member model"""
    __tablename__ = "team_members"
    
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    allocation_percent = Column(Integer, nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("allocation_percent >= 0 AND allocation_percent <= 100", name="check_allocation_range"),
    )
    
    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")
    role = relationship("Role", back_populates="team_members")


class RiskIssue(Base):
    """Risk/Issue model"""
    __tablename__ = "risks_issues"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    impact = Column(Integer, nullable=True)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint("type IN ('RISK', 'ISSUE')", name="check_risk_issue_type"),
        CheckConstraint("priority IN ('High', 'Medium', 'Low')", name="check_priority"),
        CheckConstraint("impact BETWEEN 1 AND 5", name="check_impact_range"),
        CheckConstraint("score >= 0", name="check_score_positive"),
    )
    
    # Relationships
    investment = relationship("Investment", back_populates="risks_issues")


class Document(Base):
    """Document model"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    investment = relationship("Investment", back_populates="documents")
    uploaded_by = relationship("User", back_populates="uploaded_documents")
