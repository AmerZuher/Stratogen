"""
LLM_services schemas
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, validator, ConfigDict

# ===================================================================
# Conversation Schemas
# ===================================================================

class ConversationBase(BaseModel):
    """Base conversation schema"""
    title: Optional[str] = None

class ConversationCreate(ConversationBase):
    """Conversation creation schema"""
    pass

class ConversationUpdate(BaseModel):
    """Conversation update schema"""
    title: str

class ConversationResponse(ConversationBase):
    """Conversation response schema"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List["MessageResponse"] = []

    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# Message Schemas
# ===================================================================

class MessageBase(BaseModel):
    """Base message schema"""
    content: str
    role: str

    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['system', 'user', 'assistant', 'summary']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {allowed_roles}')
        return v

class MessageCreate(MessageBase):
    """Message creation schema"""
    pass

class MessageResponse(MessageBase):
    """Message response schema"""
    id: int
    conversation_id: int
    created_at: datetime
    feedback: List["FeedbackResponse"] = []

    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# Feedback Schemas
# ===================================================================

class FeedbackBase(BaseModel):
    """Base feedback schema"""
    rating: Optional[int] = None
    comment: Optional[str] = None

    @validator('rating')
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Rating must be between 1 and 5')
        return v

class FeedbackCreate(FeedbackBase):
    """Feedback creation schema"""
    message_id: Optional[int] = None
    conversation_id: Optional[int] = None

class FeedbackUpdate(BaseModel):
    """Feedback update schema"""
    rating: Optional[int] = None
    comment: Optional[str] = None
    # Note: You have a duplicate validator here, which is fine but redundant.
    # Pydantic models can also inherit validators from a Base model if needed.

class FeedbackResponse(FeedbackBase):
    """Feedback response schema"""
    id: int
    user_id: Optional[int] = None
    message_id: Optional[int] = None
    conversation_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ===================================================================
# LLM & Chat Schemas
# ===================================================================

class ChatRequest(BaseModel):
    """Chat request schema"""
    message: str
    context: Optional[dict] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    # ... validators for temperature and max_tokens ...

class ChatResponse(BaseModel):
    """Chat response schema"""
    user_message: "MessageResponse"
    assistant_message: "MessageResponse"
    conversation_id: int
    processing_time_ms: Optional[int] = None
    model_used: Optional[str] = None

class LLMModelInfo(BaseModel):
    """LLM model information"""
    name: str
    provider: str
    max_tokens: int
    supports_streaming: bool
    is_available: bool

class LLMConfigResponse(BaseModel):
    """LLM configuration response"""
    available_models: List[LLMModelInfo]
    current_model: LLMModelInfo
    default_settings: dict

# ===================================================================
# Report Schemas
# ===================================================================

class ReportGenerationRequest(BaseModel):
    """Request schema for generating a report."""
    investment_id: int
    investment_name: str
    investment_type: str
    conversation_id: int

class ReportGenerationResponse(BaseModel):
    """Response schema after triggering report generation."""
    message: str
    interim_message_id: Optional[int] = None


# ===================================================================
# Final Step: Update Forward References
# This MUST be at the end of the file.
# ===================================================================
ConversationResponse.model_rebuild()
MessageResponse.model_rebuild()
ChatResponse.model_rebuild()
