# Use the official uv image for dependency management
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Set the working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies into the virtual environment
RUN uv sync --frozen --no-install-project --no-dev

# --- Final Stage ---
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Ensure the virtual environment is used
ENV PATH="/app/.venv/bin:$PATH"

# Copy the application code
COPY . .

# Railway provides the PORT environment variable
EXPOSE 5000

ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Use gunicorn with the dynamic Railway port
CMD gunicorn --bind 0.0.0.0:${PORT:-5000} app:app
