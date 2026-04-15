"""
Logging configuration and utilities
"""
import os
import sys
import logging
import logging.handlers
from pathlib import Path
from typing import Optional

from app.core.settings import settings


def setup_logging(
    log_level: Optional[str] = None,
    log_file: Optional[str] = None,
    log_dir: Optional[str] = None
) -> None:
    """
    Setup application logging with file and console handlers
    """
    # Get configuration
    level = log_level or settings.LOG_LEVEL
    log_directory = Path(log_dir or settings.LOG_DIR)
    
    # Create log directory
    log_directory.mkdir(parents=True, exist_ok=True)
    
    # Set log level
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Create detailed formatter for file logs
    detailed_formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler with rotation
    if log_file:
        log_file_path = Path(log_file)
    else:
        log_file_path = log_directory / "app.log"
    
    file_handler = logging.handlers.RotatingFileHandler(
        filename=log_file_path,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(numeric_level)
    file_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(file_handler)
    
    # Error file handler
    error_file_path = log_directory / "error.log"
    error_handler = logging.handlers.RotatingFileHandler(
        filename=error_file_path,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(error_handler)
    
    # Set specific logger levels
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized - Level: {level}, Directory: {log_directory}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name
    """
    return logging.getLogger(name)


class ContextualLogger:
    """
    Logger wrapper that adds contextual information to log messages
    """
    
    def __init__(self, logger_name: str, context: Optional[dict] = None):
        self.logger = logging.getLogger(logger_name)
        self.context = context or {}
    
    def _format_message(self, message: str) -> str:
        """Add context to log message"""
        if self.context:
            context_str = " | ".join([f"{k}={v}" for k, v in self.context.items()])
            return f"[{context_str}] {message}"
        return message
    
    def debug(self, message: str, **kwargs):
        """Log debug message with context"""
        self.logger.debug(self._format_message(message), **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log info message with context"""
        self.logger.info(self._format_message(message), **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message with context"""
        self.logger.warning(self._format_message(message), **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message with context"""
        self.logger.error(self._format_message(message), **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message with context"""
        self.logger.critical(self._format_message(message), **kwargs)
    
    def add_context(self, **kwargs) -> 'ContextualLogger':
        """Create new logger with additional context"""
        new_context = {**self.context, **kwargs}
        return ContextualLogger(self.logger.name, new_context)


def log_function_call(func_name: str, args: Optional[tuple] = None, kwargs: Optional[dict] = None) -> None:
    """
    Log function call with parameters (for debugging)
    """
    logger = logging.getLogger("function_calls")
    
    if logger.isEnabledFor(logging.DEBUG):
        args_str = ", ".join(str(arg) for arg in (args or []))
        kwargs_str = ", ".join(f"{k}={v}" for k, v in (kwargs or {}).items())
        
        params = []
        if args_str:
            params.append(args_str)
        if kwargs_str:
            params.append(kwargs_str)
        
        params_str = ", ".join(params)
        logger.debug(f"Calling {func_name}({params_str})")


def log_performance(operation: str, duration_ms: float, details: Optional[dict] = None) -> None:
    """
    Log performance metrics
    """
    logger = logging.getLogger("performance")
    
    message = f"Operation '{operation}' took {duration_ms:.2f}ms"
    
    if details:
        details_str = " | ".join(f"{k}={v}" for k, v in details.items())
        message += f" | {details_str}"
    
    if duration_ms > 1000:  # Log as warning if over 1 second
        logger.warning(message)
    else:
        logger.info(message)


def log_database_query(query: str, duration_ms: float, row_count:Optional[int] = None) -> None:
    """
    Log database query performance
    """
    logger = logging.getLogger("database")
    
    # Truncate long queries
    display_query = query[:200] + "..." if len(query) > 200 else query
    display_query = " ".join(display_query.split())  # Clean whitespace
    
    message = f"Query took {duration_ms:.2f}ms: {display_query}"
    
    if row_count is not None:
        message += f" | Rows: {row_count}"
    
    if duration_ms > 500:  # Log slow queries as warnings
        logger.warning(f"SLOW QUERY: {message}")
    else:
        logger.debug(message)


def log_api_request(
    method: str, 
    path: str, 
    status_code: int, 
    duration_ms: float,
    user_id:Optional[int] = None,
    ip_address:Optional[str] = None
) -> None:
    """
    Log API request details
    """
    logger = logging.getLogger("api_requests")
    
    message = f"{method} {path} -> {status_code} ({duration_ms:.2f}ms)"
    
    if user_id:
        message += f" | User: {user_id}"
    
    if ip_address:
        message += f" | IP: {ip_address}"
    
    if status_code >= 500:
        logger.error(message)
    elif status_code >= 400:
        logger.warning(message)
    else:
        logger.info(message)


def log_security_event(
    event_type: str,
    description: str,
    user_id:Optional[int] = None,
    ip_address:Optional[str] = None,
    severity: str = "INFO"
) -> None:
    """
    Log security-related events
    """
    logger = logging.getLogger("security")
    
    message = f"SECURITY [{event_type}]: {description}"
    
    if user_id:
        message += f" | User: {user_id}"
    
    if ip_address:
        message += f" | IP: {ip_address}"
    
    log_level = getattr(logging, severity.upper(), logging.INFO)
    logger.log(log_level, message)


class DatabaseQueryLogger:
    """
    Context manager for logging database queries
    """
    
    def __init__(self, operation: str):
        self.operation = operation
        self.start_time = None
        
    def __enter__(self):
        import time
        self.start_time = time.time()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            import time
            duration_ms = (time.time() - self.start_time) * 1000
            
            if exc_type:
                logger = logging.getLogger("database")
                logger.error(f"Database operation '{self.operation}' failed after {duration_ms:.2f}ms: {exc_val}")
            else:
                log_performance(f"DB: {self.operation}", duration_ms)


def configure_uvicorn_logging():
    """
    Configure uvicorn logging to integrate with our logging setup
    """
    # Set uvicorn loggers to use our configuration
    uvicorn_loggers = [
        "uvicorn",
        "uvicorn.access",
        "uvicorn.error"
    ]
    
    for logger_name in uvicorn_loggers:
        logger = logging.getLogger(logger_name)
        logger.handlers.clear()
        # Let them use the root logger handlers
        logger.propagate = True
