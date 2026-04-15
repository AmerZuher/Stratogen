"""
Document management router with secure upload/download
"""
import os
import mimetypes # Import the mimetypes module
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.auth.dependencies import get_current_active_user
from app.crud import documents as crud_documents
from app.crud import investments as crud_investments
from app.schemas.investments import DocumentResponse, DocumentCreate
from app.models.auth import User

router = APIRouter()


@router.post("/{investment_id}/upload", response_model=DocumentResponse)
async def upload_document(
    investment_id: int,
    file: UploadFile = File(...),
    name: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a document to an investment"""
    # Check if investment exists and user has access
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser: # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Validate file type
    if not crud_documents.validate_file_type(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed"
        )
    
    # Validate file size
    file_content = await file.read()
    await file.seek(0)  # Reset file pointer
    
    if not crud_documents.validate_file_size(len(file_content)):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed size (50MB)"
        )
    
    try:
        # Save file to disk
        file_location = await crud_documents.save_uploaded_file(file, investment_id)
        
        # Create document record
        document_data = DocumentCreate(
            name=name or file.filename
        )
        
        db_document = await crud_documents.create_document(
            db=db,
            document=document_data,
            investment_id=investment_id,
            uploaded_by_id=current_user.id,
            file_location=file_location
        )
        
        return db_document
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.get("/{investment_id}/documents", response_model=List[DocumentResponse])
async def get_investment_documents(
    investment_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all documents for an investment"""
    # Check if investment exists and user has access
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    documents = await crud_documents.get_documents_by_investment(db, investment_id)
    return documents


@router.get("/document/{document_id}", response_model=DocumentResponse)
async def get_document_info(
    document_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get document information"""
    db_document = await crud_documents.get_document_with_investment(db, document_id)
    
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check access permissions
    if not (current_user.is_superuser or 
            db_document.investment.created_by_id == current_user.id or
            db_document.uploaded_by_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_document


@router.get("/document/{document_id}/download")
async def download_document(
    document_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Download a document"""
    db_document = await crud_documents.get_document_with_investment(db, document_id)
    
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check access permissions
    if not (current_user.is_superuser or 
            db_document.investment.created_by_id == current_user.id or
            db_document.uploaded_by_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if file exists
    file_path = crud_documents.get_file_path(db_document)
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    # FIX: Guess the MIME type from the actual file path for a more accurate Content-Type header
    media_type, _ = mimetypes.guess_type(file_path)
    if media_type is None:
        media_type = 'application/octet-stream' # Fallback to generic binary type
    
    return FileResponse(
        path=str(file_path),
        filename=db_document.name,
        media_type=media_type
    )


@router.delete("/document/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a document"""
    db_document = await crud_documents.get_document_with_investment(db, document_id)
    
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions (only owner or superuser can delete)
    if not (current_user.is_superuser or 
            db_document.investment.created_by_id == current_user.id or
            db_document.uploaded_by_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = await crud_documents.delete_document(db, document_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return {"message": "Document deleted successfully"}


@router.get("/my-documents", response_model=List[DocumentResponse])
async def get_my_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get documents uploaded by the current user"""
    documents = await crud_documents.get_documents_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return documents


@router.get("/stats/storage")
async def get_storage_stats(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get storage statistics for user's documents"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can access storage statistics"
        )
    
    # This would calculate storage usage across all documents
    # For now, return a placeholder
    return {
        "message": "Storage statistics endpoint",
        "total_documents": 0,
        "total_size_bytes": 0,
        "total_size_mb": 0
    }


@router.post("/bulk-upload/{investment_id}")
async def bulk_upload_documents(
    investment_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user)
):
    """Upload multiple documents to an investment"""
    # Check if investment exists and user has access
    if not await crud_investments.check_investment_ownership(db, investment_id, current_user.id) and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if len(files) > 10:  # Limit bulk upload
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per bulk upload"
        )
    
    uploaded_documents = []
    failed_uploads = []
    
    for file in files:
        try:
            if not file.filename:
                failed_uploads.append({"filename": "unknown", "error": "No filename provided"})
                continue
            
            # Validate file type
            if not crud_documents.validate_file_type(file.filename):
                failed_uploads.append({"filename": file.filename, "error": "File type not allowed"})
                continue
            
            # Validate file size
            file_content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            if not crud_documents.validate_file_size(len(file_content)):
                failed_uploads.append({"filename": file.filename, "error": "File size exceeds limit"})
                continue
            
            # Save file and create record
            file_location = await crud_documents.save_uploaded_file(file, investment_id)
            
            document_data = DocumentCreate(name=file.filename)
            
            db_document = await crud_documents.create_document(
                db=db,
                document=document_data,
                investment_id=investment_id,
                uploaded_by_id=current_user.id,
                file_location=file_location
            )
            
            uploaded_documents.append(db_document)
            
        except Exception as e:
            failed_uploads.append({"filename": file.filename, "error": str(e)})
    
    return {
        "uploaded_count": len(uploaded_documents),
        "failed_count": len(failed_uploads),
        "uploaded_documents": uploaded_documents,
        "failed_uploads": failed_uploads
    }
