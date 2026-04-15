"""
CRUD operations for LLM_services models
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload

# Use an alias for the model to prevent name conflicts with the schema
from app.models.llm_services import (
    Conversation, Message, Feedback, GeneratedReport as GeneratedReportModel
)
from app.schemas.llm_services import (
    ConversationCreate, MessageCreate, FeedbackCreate
)


async def create_conversation(
    db: AsyncSession,
    conversation: ConversationCreate,
    user_id: int
) -> Conversation:
    """Create a new conversation"""
    db_conversation = Conversation(
        **conversation.dict(),
        user_id=user_id
    )
    db.add(db_conversation)
    await db.commit()
    await db.refresh(db_conversation)
    return await get_conversation(db, db_conversation.id, user_id) # type: ignore


async def get_conversation(
    db: AsyncSession,
    conversation_id: int,
    user_id: Optional[int] = None
) -> Optional[Conversation]:
    """Get conversation by ID, optionally filtered by user"""
    query = select(Conversation).options(
        selectinload(Conversation.messages).selectinload(Message.feedback),
        selectinload(Conversation.user)
    ).where(Conversation.id == conversation_id)

    if user_id is not None:
        query = query.where(Conversation.user_id == user_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_conversations(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 50
) -> List[Conversation]:
    """Get conversations for a user with pagination"""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.user_id == user_id)
        .order_by(desc(Conversation.updated_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def update_conversation_title(
    db: AsyncSession,
    conversation_id: int,
    title: str,
    user_id: int
) -> Optional[Conversation]:
    """Update conversation title"""
    result = await db.execute(
        select(Conversation)
        .where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
    )
    db_conversation = result.scalar_one_or_none()
    
    if not db_conversation:
        return None
    
    db_conversation.title = title
    await db.commit()
    await db.refresh(db_conversation)
    return db_conversation


async def delete_conversation(
    db: AsyncSession,
    conversation_id: int,
    user_id: int
) -> bool:
    """Delete conversation"""
    result = await db.execute(
        select(Conversation)
        .where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
    )
    db_conversation = result.scalar_one_or_none()
    
    if not db_conversation:
        return False
    
    await db.delete(db_conversation)
    await db.commit()
    return True


async def create_message(
    db: AsyncSession,
    message: MessageCreate,
    conversation_id: int
) -> Message:
    """Create a new message"""
    db_message = Message(
        **message.dict(),
        conversation_id=conversation_id
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)

    # NOTE: This line doesn't update the conversation's timestamp.
    # It just selects the conversation without doing anything with it.
    # It's safe to remove. The timestamp is likely updated by your DB schema.
    #
    # await db.execute(
    #     select(Conversation)
    #     .where(Conversation.id == conversation_id)
    # )

    # FIX: Re-fetch the message using get_message, which correctly
    # eager-loads the 'feedback' relationship.
    new_message = await get_message(db, db_message.id) # type: ignore
    return new_message


async def get_messages(
    db: AsyncSession,
    conversation_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Message]:
    result = await db.execute(
        select(Message)
        .options(selectinload(Message.feedback))
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_message(
    db: AsyncSession,
    message_id: int
) -> Optional[Message]:
    """Get message by ID"""
    result = await db.execute(
        select(Message)
        .options(
            selectinload(Message.conversation),
            selectinload(Message.feedback)
        )
        .where(Message.id == message_id)
    )
    return result.scalar_one_or_none()


async def get_conversation_message_count(
    db: AsyncSession,
    conversation_id: int
) -> int:
    """Get message count for a conversation"""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
    )
    messages = result.scalars().all()
    return len(messages)


async def get_recent_messages(
    db: AsyncSession,
    conversation_id: int,
    limit: int = 10
) -> List[Message]:
    """Get recent messages for context"""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))  # Return in chronological order


async def create_feedback(
    db: AsyncSession,
    feedback: FeedbackCreate,
    user_id: int
) -> Feedback:
    """Create feedback for a message"""
    db_feedback = Feedback(
        **feedback.dict(),
        user_id=user_id
    )
    db.add(db_feedback)
    await db.commit()
    await db.refresh(db_feedback)
    return db_feedback


async def get_feedback(
    db: AsyncSession,
    feedback_id: int
) -> Optional[Feedback]:
    """Get feedback by ID"""
    result = await db.execute(
        select(Feedback)
        .options(
            selectinload(Feedback.user),
            selectinload(Feedback.message),
            selectinload(Feedback.conversation)
        )
        .where(Feedback.id == feedback_id)
    )
    return result.scalar_one_or_none()


async def get_message_feedback(
    db: AsyncSession,
    message_id: int
) -> List[Feedback]:
    """Get all feedback for a message"""
    result = await db.execute(
        select(Feedback)
        .options(selectinload(Feedback.user))
        .where(Feedback.message_id == message_id)
        .order_by(desc(Feedback.created_at))
    )
    return result.scalars().all()


async def update_feedback(
    db: AsyncSession,
    feedback_id: int,
    rating: Optional[int] = None,
    comment: Optional[str] = None,
    user_id: Optional[int] = None
) -> Optional[Feedback]:
    """Update feedback"""
    query = select(Feedback).where(Feedback.id == feedback_id)
    
    if user_id is not None:
        query = query.where(Feedback.user_id == user_id)
    
    result = await db.execute(query)
    db_feedback = result.scalar_one_or_none()
    
    if not db_feedback:
        return None
    
    if rating is not None:
        db_feedback.rating = rating
    if comment is not None:
        db_feedback.comment = comment
    
    await db.commit()
    await db.refresh(db_feedback)
    return db_feedback


async def check_conversation_ownership(
    db: AsyncSession,
    conversation_id: int,
    user_id: int
) -> bool:
    """Check if user owns the conversation"""
    result = await db.execute(
        select(Conversation) # type: ignore
        .where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
    )
    return result.scalar_one_or_none() is not None


    """Create a new generated report record."""
    # Explicitly use the aliased GeneratedReportModel for instantiation
    db_report = GeneratedReportModel(**report.dict())
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report