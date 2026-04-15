"""
LLM_services and feedback models
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, SmallInteger, func, CheckConstraint
from sqlalchemy.orm import relationship

from . import Base


class Conversation(Base):
    """Conversation model for LLM interactions"""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Message model for conversation content"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    
    # Constraints
    __table_args__ = (
        CheckConstraint("role IN ('system', 'user', 'assistant', 'summary')", name="check_message_role"),
    )
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", back_populates="message", cascade="all, delete-orphan")


class Feedback(Base):
    """Feedback model for message rating and comments"""
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
    rating = Column(SmallInteger, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Constraints
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="check_rating_range"),
    )
    
    # Relationships
    user = relationship("User", back_populates="feedback")
    conversation = relationship("Conversation", back_populates="feedback")
    message = relationship("Message", back_populates="feedback")

class GeneratedReport(Base):
    """Model for storing generated reports."""
    __tablename__ = "generated_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # Relationships
    user = relationship("User")
    investment = relationship("Investment")
