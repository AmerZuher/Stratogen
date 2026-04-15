"""
Database configuration and connection management
"""
import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker # type: ignore
from sqlalchemy.exc import OperationalError
from sqlalchemy import text, create_engine
import asyncpg

from app.core.settings import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20
)

# Create session maker
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db_session() -> AsyncSession: 
    """
    Dependency to get database session
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            await session.close()


async def create_database_if_not_exists():
    """
    Create database if it doesn't exist
    """
    try:
        # Extract database name from URL
        db_name = settings.DB_NAME
        
        # Create connection to postgres database to create our target database
        postgres_url = f"postgresql://{settings.DATABASE_URL}/postgres"
        
        try:
            conn = await asyncpg.connect(postgres_url)
            
            # Check if database exists
            exists = await conn.fetchval(
                "SELECT 1 FROM pg_database WHERE datname = $1", db_name
            )
            
            if not exists:
                # Create database
                await conn.execute(f'CREATE DATABASE "{db_name}"')
                logger.info(f"Created database: {db_name}")
            else:
                logger.info(f"Database already exists: {db_name}")
                
            await conn.close()
            
        except asyncpg.exceptions.PostgresError as e:
            logger.error(f"PostgreSQL error: {str(e)}")
            # Database might already exist or we don't have permission
            pass
            
    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        # Continue anyway - the database might already exist


async def test_database_connection():
    """
    Test database connection
    """
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False


async def execute_sql_file(file_path: str):
    """
    Execute SQL file for database setup
    """
    try:
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        async with engine.begin() as conn:
            # Split by semicolon and execute each statement
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            
            for statement in statements:
                if statement:
                    await conn.execute(text(statement))
        
        logger.info(f"Successfully executed SQL file: {file_path}")
        
    except Exception as e:
        logger.error(f"Error executing SQL file {file_path}: {str(e)}")
        raise
