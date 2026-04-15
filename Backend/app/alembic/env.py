import asyncio
import os
import re
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config # type: ignore

from alembic import context

# --- FIX START ---
# Add the project's root directory ('Backend') to the Python path
# This ensures that imports like 'from app.core...' work correctly
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
# --- FIX END ---

# Import models and settings using absolute paths
from app.models import Base  # Assuming your models are in app/models/__init__.py or similar
from app.core.settings import settings

# Alembic Config object
config = context.config

# Logging configuration
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the SQLAlchemy URL dynamically from settings
# Ensure your alembic.ini does NOT have a sqlalchemy.url set, or this will be ignored.
config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL))

# Metadata for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no DB connection required)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Run migrations synchronously using a given connection."""
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        # Add the parameter here:
        process_revision_directives=process_revision_directives
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations asynchronously with an async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # Alembic runs synchronously inside async context
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using asyncio."""
    asyncio.run(run_async_migrations())

def process_revision_directives(context, revision, directives):
    """
    This function is called whenever a new revision is generated.
    It modifies the revision ID to be a sequential, zero-padded number.
    """
    if hasattr(context, 'get_current_heads'):
        head_revs = context.get_current_heads()
    else:
        # Fallback for older versions if necessary
        head_revs = [context.get_head_revision()]
    # Get the current head revision
    head_rev = context.get_head_revision() if hasattr(context, 'get_head_revision') else None
    if head_rev is None:
        # This is the first revision
        new_rev_id = 1
    else:
        # Check that a match was found before using it
        match = re.match(r'(\d+)', head_rev)
        if not match:
            # This will happen if the latest revision ID is not a number.
            # It's safer to raise an error than to guess.
            raise ValueError(f"Could not determine next revision number from head revision '{head_rev}'")

        # Get the last revision number and increment it
        last_rev_id = int(match.group(1))
        new_rev_id = last_rev_id + 1

    # Format the new ID with 4 leading zeros (e.g., 0001, 0002)
    for directive in directives:
        directive.rev_id = '{:04d}'.format(new_rev_id)

    # Format the new ID with 4 leading zeros (e.g., 0001, 0002)
    for directive in directives:
        directive.rev_id = '{:04d}'.format(new_rev_id)

# Entry point: decide offline vs online
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
