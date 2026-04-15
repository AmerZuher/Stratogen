"""
Exception handling utilities and custom exceptions
"""
import logging
from typing import Any, Dict, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from pydantic import ValidationError

logger = logging.getLogger(__name__)


class BaseAppException(Exception):
    """Base exception for application-specific errors"""
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,

        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)


class ValidationException(BaseAppException):
    """Exception for validation errors"""
    
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details={"field": field, **(details or {})},
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )


class AuthenticationException(BaseAppException):
    """Exception for authentication errors"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AuthorizationException(BaseAppException):
    """Exception for authorization errors"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=status.HTTP_403_FORBIDDEN
        )


class ResourceNotFoundException(BaseAppException):
    """Exception for resource not found errors"""
    
    def __init__(self, resource_type: str, resource_id: Any = None):
        message = f"{resource_type} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
        
        super().__init__(
            message=message,
            error_code="RESOURCE_NOT_FOUND",
            details={"resource_type": resource_type, "resource_id": str(resource_id) if resource_id else None},
            status_code=status.HTTP_404_NOT_FOUND
        )


class ResourceConflictException(BaseAppException):
    """Exception for resource conflict errors"""
    
    def __init__(self, message: str, resource_type:Optional[str] = None):
        super().__init__(
            message=message,
            error_code="RESOURCE_CONFLICT",
            details={"resource_type": resource_type},
            status_code=status.HTTP_409_CONFLICT
        )


class DatabaseException(BaseAppException):
    """Exception for database-related errors"""
    
    def __init__(self, message: str, operation:Optional[str] = None, details:  Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            details={"operation": operation, **(details or {})},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class WorkflowException(BaseAppException):
    """Exception for workflow-related errors"""
    
    def __init__(self, message: str, workflow_step:Optional[str] = None, action:Optional[str] = None):
        super().__init__(
            message=message,
            error_code="WORKFLOW_ERROR",
            details={"workflow_step": workflow_step, "action": action},
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ExternalServiceException(BaseAppException):
    """Exception for external service errors"""
    
    def __init__(self, service_name: str, message:Optional[str] = None):
        message = message or f"{service_name} service unavailable"
        super().__init__(
            message=message,
            error_code="EXTERNAL_SERVICE_ERROR",
            details={"service": service_name},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )


class FileOperationException(BaseAppException):
    """Exception for file operation errors"""
    
    def __init__(self, operation: str, filename:Optional[str] = None, message:Optional[str] = None):
        if not message:
            message = f"File {operation} failed"
            if filename:
                message += f" for {filename}"
        
        super().__init__(
            message=message,
            error_code="FILE_OPERATION_ERROR",
            details={"operation": operation, "filename": filename},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ConfigurationException(BaseAppException):
    """Exception for configuration errors"""
    
    def __init__(self, config_key: str, message:Optional[str] = None):
        message = message or f"Configuration error for {config_key}"
        super().__init__(
            message=message,
            error_code="CONFIGURATION_ERROR",
            details={"config_key": config_key},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for the FastAPI application
    """
    # Handle custom application exceptions
    if isinstance(exc, BaseAppException):
        logger.warning(
            f"Application exception: {exc.error_code} - {exc.message}",
            extra={
                "error_code": exc.error_code,
                "details": exc.details,
                "path": str(request.url),
                "method": request.method
            }
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )
    
    # Handle HTTP exceptions
    if isinstance(exc, HTTPException):
        logger.warning(
            f"HTTP exception: {exc.status_code} - {exc.detail}",
            extra={
                "status_code": exc.status_code,
                "path": str(request.url),
                "method": request.method
            }
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": "HTTP_ERROR",
                    "message": exc.detail,
                    "details": {"status_code": exc.status_code}
                }
            }
        )
    
    # Handle validation errors
    if isinstance(exc, ValidationError):
        logger.warning(
            f"Validation error: {exc}",
            extra={
                "path": str(request.url),
                "method": request.method,
                "validation_errors": exc.errors()
            }
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed",
                    "details": {"validation_errors": exc.errors()}
                }
            }
        )
    
    # Handle database errors
    if isinstance(exc, SQLAlchemyError):
        # Log the full error for debugging, but don't expose to client
        logger.error(
            f"Database error: {str(exc)}",
            extra={
                "path": str(request.url),
                "method": request.method,
                "exception_type": type(exc).__name__
            },
            exc_info=True
        )
        
        # Check for specific database errors
        if isinstance(exc, IntegrityError):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "error": {
                        "code": "INTEGRITY_ERROR",
                        "message": "Database integrity constraint violation",
                        "details": {"type": "constraint_violation"}
                    }
                }
            )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "DATABASE_ERROR",
                    "message": "A database error occurred",
                    "details": {"type": type(exc).__name__}
                }
            }
        )
    
    # Handle all other exceptions
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": str(request.url),
            "method": request.method,
            "exception_type": type(exc).__name__
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred",
                "details": {"type": type(exc).__name__}
            }
        }
    )


def handle_database_error(operation: str):
    """
    Decorator to handle database errors in CRUD operations
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except IntegrityError as e:
                logger.error(f"Database integrity error in {operation}: {str(e)}")
                raise ResourceConflictException(
                    f"Resource conflict during {operation}",
                    resource_type="database_record"
                )
            except SQLAlchemyError as e:
                logger.error(f"Database error in {operation}: {str(e)}")
                raise DatabaseException(
                    f"Database error during {operation}",
                    operation=operation
                )
            except Exception as e:
                logger.error(f"Unexpected error in {operation}: {str(e)}")
                raise
        
        return wrapper
    return decorator


def validate_required_fields(data: Dict[str, Any], required_fields: list[str]) -> None:
    """
    Validate that required fields are present in data
    """
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    
    if missing_fields:
        raise ValidationException(
            f"Missing required fields: {', '.join(missing_fields)}",
            details={"missing_fields": missing_fields}
        )


def validate_business_rule(condition: bool, message: str, details:  Optional[Dict[str, Any]] = None):
    """
    Validate business rules and raise appropriate exceptions
    """
    if not condition:
        raise ValidationException(message, details=details)


class ErrorResponse:
    """
    Standard error response format
    """
    
    @staticmethod
    def create(
        error_code: str,
        message: str,
        details:  Optional[Dict[str, Any]] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST
    ) -> JSONResponse:
        """Create a standard error response"""
        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "code": error_code,
                    "message": message,
                    "details": details or {}
                }
            }
        )
    
    @staticmethod
    def validation_error(message: str, field:Optional[str] = None) -> JSONResponse:
        """Create a validation error response"""
        return ErrorResponse.create(
            error_code="VALIDATION_ERROR",
            message=message,
            details={"field": field} if field else {},
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    
    @staticmethod
    def not_found(resource_type: str, resource_id: Any = None) -> JSONResponse:
        """Create a not found error response"""
        message = f"{resource_type} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
        
        return ErrorResponse.create(
            error_code="RESOURCE_NOT_FOUND",
            message=message,
            details={"resource_type": resource_type, "resource_id": str(resource_id) if resource_id else None},
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def forbidden(message: str = "Access denied") -> JSONResponse:
        """Create a forbidden error response"""
        return ErrorResponse.create(
            error_code="ACCESS_DENIED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def unauthorized(message: str = "Authentication required") -> JSONResponse:
        """Create an unauthorized error response"""
        return ErrorResponse.create(
            error_code="AUTHENTICATION_REQUIRED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
