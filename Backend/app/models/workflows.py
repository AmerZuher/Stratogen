"""
Workflow engine models
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, func, CheckConstraint
from sqlalchemy.orm import relationship

from . import Base


class Workflow(Base):
    """Workflow definition model"""
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("entity_type IN ('IDEA','PROJECT','SME','RFP','KPI')", name="check_entity_type"),
    )
    
    # Relationships
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    instances = relationship("WorkflowInstance", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base):
    """Workflow step model"""
    __tablename__ = "workflow_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    demand_status = Column(String, nullable=True)
    is_terminal = Column(Boolean, default=False)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="steps")
    responsibles = relationship("WorkflowResponsible", back_populates="step", cascade="all, delete-orphan")
    
    # --- FIX WAS APPLIED HERE ---
    # This relationship defines actions that ORIGINATE FROM this step.
    actions = relationship(
        "WorkflowAction",
        back_populates="step",
        cascade="all, delete-orphan",
        foreign_keys="[WorkflowAction.step_id]"  # Explicitly define the join condition
    )
    
    # --- (Optional but Recommended) NEW relationship ---
    # This relationship defines actions that TRANSITION TO this step.
    actions_leading_here = relationship(
        "WorkflowAction",
        back_populates="next_step",
        foreign_keys="[WorkflowAction.next_step_id]"
    )
    
    # Workflow instances at this step
    current_instances = relationship("WorkflowInstance", back_populates="current_step", foreign_keys="[WorkflowInstance.current_step_id]")
    history_entries = relationship("WorkflowHistory", back_populates="step", foreign_keys="[WorkflowHistory.step_id]")
    


class WorkflowAction(Base):
    """Workflow action model"""
    __tablename__ = "workflow_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("workflow_steps.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)
    next_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    terminate = Column(Boolean, default=False)
    
    # Relationships
    step = relationship("WorkflowStep", back_populates="actions", foreign_keys=[step_id])
    
    # --- (Optional but Recommended) FIX WAS APPLIED HERE ---
    next_step = relationship(
        "WorkflowStep",
        foreign_keys=[next_step_id],
        back_populates="actions_leading_here"  # Link to the new relationship
    )


class WorkflowResponsible(Base):
    """Workflow responsibility model"""
    __tablename__ = "workflow_responsibles"
    
    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("workflow_steps.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Relationships
    step = relationship("WorkflowStep", back_populates="responsibles")
    role = relationship("Role", back_populates="workflow_responsibles")
    department = relationship("Department", back_populates="workflow_responsibles")


class WorkflowInstance(Base):
    """Workflow instance model"""
    __tablename__ = "workflow_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    current_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    status = Column(String, default="in_progress")
    started_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('in_progress','completed','cancelled')", name="check_instance_status"),
    )
    
    # Relationships
    workflow = relationship("Workflow", back_populates="instances")
    investment = relationship("Investment", back_populates="workflow_instances")
    current_step = relationship("WorkflowStep", back_populates="current_instances")
    history = relationship("WorkflowHistory", back_populates="instance", cascade="all, delete-orphan")


class WorkflowHistory(Base):
    """Workflow history model"""
    __tablename__ = "workflow_history"
    
    id = Column(Integer, primary_key=True, index=True)
    instance_id = Column(Integer, ForeignKey("workflow_instances.id", ondelete="CASCADE"), nullable=False)
    step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    action = Column(String, nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    instance = relationship("WorkflowInstance", back_populates="history")
    step = relationship("WorkflowStep", back_populates="history_entries")
    actor = relationship("User", back_populates="workflow_actions")
