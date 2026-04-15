"""
CRUD operations for document models
"""
import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload 

from app.models.investments import Document, Investment
from app.schemas.investments import DocumentCreate
from app.core.settings import settings


async def create_document(
    db: AsyncSession,
    document: DocumentCreate,
    investment_id: int,
    uploaded_by_id: int,
    file_location: str
) -> Document:
    """Create a new document record"""
    db_document = Document(
        **document.dict(),
        investment_id=investment_id,
        uploaded_by_id=uploaded_by_id,
        location=file_location
    )
    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)
    return db_document


async def get_document(
    db: AsyncSession,
    document_id: int
) -> Optional[Document]:
    """Get document by ID"""
    result = await db.execute(
        select(Document)
        .where(Document.id == document_id)
    )
    return result.scalar_one_or_none()


async def get_documents_by_investment(
    db: AsyncSession,
    investment_id: int
) -> List[Document]:
    """Get all documents for an investment"""
    result = await db.execute(
        select(Document)
        .where(Document.investment_id == investment_id)
        .order_by(Document.uploaded_at.desc())
    )
    return result.scalars().all()


async def get_documents_by_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Document]:
    """Get documents uploaded by user"""
    result = await db.execute(
        select(Document)
        .where(Document.uploaded_by_id == user_id)
        .order_by(Document.uploaded_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def delete_document(
    db: AsyncSession,
    document_id: int
) -> bool:
    """Delete document record and file"""
    result = await db.execute(
        select(Document)
        .where(Document.id == document_id)
    )
    db_document = result.scalar_one_or_none()
    
    if not db_document:
        return False
    
    # Delete physical file
    try:
        file_path = Path(db_document.location)
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Error deleting file {db_document.location}: {str(e)}")
    
    # Delete database record
    await db.delete(db_document)
    await db.commit()
    return True


async def save_uploaded_file(
    file: UploadFile,
    investment_id: int
) -> str:
    """Save uploaded file to disk and return the file path"""
    # Create directory structure
    upload_dir = Path(settings.DATA_DOCUMENTS_DIR) / str(investment_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename to prevent conflicts
    file_extension = Path(file.filename).suffix if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        # Clean up partial file if error occurs
        if file_path.exists():
            file_path.unlink()
        raise e
    
    return str(file_path)


def get_file_path(document: Document) -> Path:
    """Get file path for a document"""
    return Path(document.location) # type: ignore


def validate_file_type(filename: str, allowed_extensions: List[str] = None) -> bool: # type: ignore
    """Validate file type based on extension"""
    if allowed_extensions is None:
        # Default allowed extensions
        allowed_extensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.txt', '.csv', '.json', '.xml', '.zip', '.rar',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
            '.md', 'markdown', 'mdown'
            ]
    
    if not filename:
        return False
    
    file_extension = Path(filename).suffix.lower()
    return file_extension in allowed_extensions


def validate_file_size(file_size: int, max_size_mb: int = 50) -> bool:
    """Validate file size"""
    max_size_bytes = max_size_mb * 1024 * 1024  # Convert MB to bytes
    return file_size <= max_size_bytes


# Document ownership validation
async def check_document_ownership(
    db: AsyncSession,
    document_id: int,
    user_id: int
) -> bool:
    """Check if user has access to document (owns the investment or uploaded the document)"""
    result = await db.execute(
        select(Document)
        .join(Document.investment)
        .where(
            and_(
                Document.id == document_id,
                or_(
                    Document.uploaded_by_id == user_id,
                    Investment.created_by_id == user_id
                )
            )
        )
    )
    return result.scalar_one_or_none() is not None


async def get_document_with_investment(
    db: AsyncSession,
    document_id: int
) -> Optional[Document]:
    """Get document with investment details"""
    result = await db.execute(
        select(Document)
        .options(
            selectinload(Document.investment),
            selectinload(Document.uploaded_by)
        )
        .where(Document.id == document_id)
    )
    return result.scalar_one_or_none()
