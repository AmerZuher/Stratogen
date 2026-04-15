"""
LLM_services and LLM integration router
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import llm_services as crud_conversations
from app.core.database import get_db_session
from app.auth.dependencies import get_current_active_user
from app.crud import llm_services as crud_llm_services
from app.llm.llm_manager import LLMManager
from app.schemas.llm_services import (
    ConversationResponse, ConversationCreate, ConversationUpdate,
    MessageResponse, MessageCreate,
    FeedbackResponse, FeedbackCreate, FeedbackUpdate,
    ChatRequest, ChatResponse, ReportGenerationRequest, ReportGenerationResponse
)
from app.models.auth import User

router = APIRouter()


@router.post("/", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new conversation"""
    db_conversation = await crud_conversations.create_conversation(
        db=db,
        conversation=conversation,
        user_id=current_user.id
    )
    return db_conversation


@router.get("/", response_model=List[ConversationResponse])
async def get_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's conversations with pagination"""
    conversations = await crud_conversations.get_conversations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return conversations


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get conversation by ID"""
    db_conversation = await crud_conversations.get_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )
    
    if not db_conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return db_conversation


@router.put("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation_title(
    conversation_id: int,
    conversation_update: ConversationUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update conversation title"""
    db_conversation = await crud_conversations.update_conversation_title(
        db=db,
        conversation_id=conversation_id,
        title=conversation_update.title,
        user_id=current_user.id
    )
    
    if not db_conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return db_conversation


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete conversation"""
    success = await crud_conversations.delete_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return {"message": "Conversation deleted successfully"}


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get messages for a conversation"""
    # Check conversation ownership
    if not await crud_conversations.check_conversation_ownership(db, conversation_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    messages = await crud_conversations.get_messages(
        db=db,
        conversation_id=conversation_id,
        skip=skip,
        limit=limit
    )
    return messages


@router.post("/{conversation_id}/chat", response_model=ChatResponse)
async def chat(
    conversation_id: int,
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Send a message and get AI response"""
    # Check conversation ownership
    if not await crud_conversations.check_conversation_ownership(db, conversation_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # Create user message
        user_message = MessageCreate(
            role="user",
            content=chat_request.message
        )
        
        db_user_message = await crud_conversations.create_message(
            db=db,
            message=user_message,
            conversation_id=conversation_id
        )
        
        # Get LLM response
        llm_manager = LLMManager(db=db)
        
        # Get conversation context
        recent_messages = await crud_conversations.get_recent_messages(
            db=db,
            conversation_id=conversation_id,
            limit=10
        )
        
        # Generate AI response
        ai_response = await llm_manager.generate_chat_response(
            messages=[{"role": msg.role, "content": msg.content} for msg in recent_messages],
            conversation_id=conversation_id
        )
        
        # Create assistant message
        assistant_message = MessageCreate(
            role="assistant",
            content=ai_response
        )
        
        db_assistant_message = await crud_conversations.create_message(
            db=db,
            message=assistant_message,
            conversation_id=conversation_id
        )
        
        return ChatResponse(
            user_message=db_user_message,
            assistant_message=db_assistant_message,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )


@router.post("/reports/generate", response_model=ReportGenerationResponse)
async def generate_report_endpoint(
    report_request: ReportGenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """
    Triggers the generation of a report for a given investment.
    """
    # Check conversation ownership
    if not await crud_llm_services.check_conversation_ownership(db, report_request.conversation_id, current_user.id): # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this conversation."
        )


    llm_manager = LLMManager(db=db)
    background_tasks.add_task(
        llm_manager.trigger_report_generation,
        investment_id=report_request.investment_id,
        investment_name=report_request.investment_name,
        investment_type=report_request.investment_type,
        conversation_id=report_request.conversation_id
    )

    return ReportGenerationResponse(
        message="Report generation has been initiated."
    )


@router.post("/messages/{message_id}/feedback", response_model=FeedbackResponse)
async def create_message_feedback(
    message_id: int,
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create feedback for a message"""
    # Check if message exists and user has access
    db_message = await crud_conversations.get_message(db, message_id)
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check conversation ownership
    if not await crud_conversations.check_conversation_ownership(
        db, db_message.conversation_id, current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Set the message_id and conversation_id
    feedback.message_id = message_id
    feedback.conversation_id = db_message.conversation_id
    
    db_feedback = await crud_conversations.create_feedback(
        db=db,
        feedback=feedback,
        user_id=current_user.id
    )
    return db_feedback


@router.get("/messages/{message_id}/feedback", response_model=List[FeedbackResponse])
async def get_message_feedback(
    message_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get feedback for a message"""
    # Check if message exists and user has access
    db_message = await crud_conversations.get_message(db, message_id)
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check conversation ownership
    if not await crud_conversations.check_conversation_ownership(
        db, db_message.conversation_id, current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    feedback = await crud_conversations.get_message_feedback(db, message_id)
    return feedback


@router.put("/feedback/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(
    feedback_id: int,
    feedback_update: FeedbackUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update feedback"""
    db_feedback = await crud_conversations.update_feedback(
        db=db,
        feedback_id=feedback_id,
        rating=feedback_update.rating,
        comment=feedback_update.comment,
        user_id=current_user.id
    )
    
    if not db_feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    return db_feedback


@router.get("/stats/summary")
async def get_conversation_stats(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get conversation statistics for the user"""
    conversations = await crud_conversations.get_conversations(
        db=db,
        user_id=current_user.id,
        skip=0,
        limit=1000  # Get all for stats
    )
    
    total_conversations = len(conversations)
    total_messages = 0
    
    for conversation in conversations:
        message_count = await crud_conversations.get_conversation_message_count(
            db=db,
            conversation_id=conversation.id
        )
        total_messages += message_count
    
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "average_messages_per_conversation": total_messages / total_conversations if total_conversations > 0 else 0
    }
