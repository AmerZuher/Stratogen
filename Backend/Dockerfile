# Change this:
# FROM ghcr.io/astral-sh/uv:python3.11-alpine

# To this:
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Install system dependencies (using apt-get instead of apk)
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy the ENTIRE application first
COPY . .

# Now sync the dependencies
RUN uv sync

# Expose FastAPI port
EXPOSE 8000

# Use a startup script to handle migrations and seed data
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]