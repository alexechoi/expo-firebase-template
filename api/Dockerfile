# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install curl (required for fetching uv) and clean up apt cache
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv and make sure it is on PATH
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

# Copy dependency manifests first to leverage Docker layer caching
COPY pyproject.toml uv.lock* ./

# Install the dependencies defined in the lockfile
RUN uv sync --frozen

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
