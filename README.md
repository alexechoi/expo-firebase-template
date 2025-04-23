# Expo Firebase Template

Base template for an Expo, React Native, FastAPI, and Firebase project.

## Features

- User authentication with Firebase
- Firestore database integration
- Image storage with Firebase Storage
- Profile management
- Responsive design for mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- Python (version 3.11 or later)
- Expo CLI
- Docker (optional, for running the API in a container)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd expo-firebase-template
   ```

2. Install the Expo app dependencies:

   ```bash
   cd expo-app
   npm install
   ```

3. Set up the FastAPI backend:

   ```bash
   cd api
   pip install -r requirements.txt
   ```

### Running the API

You can run the FastAPI backend either directly or using Docker.

#### Option 1: Running Directly

1. Navigate to the `api` directory:

   ```bash
   cd api
   ```

2. Run the FastAPI application:

   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Access the API at `http://localhost:8000`.

#### Option 2: Running with Docker

1. Build the Docker image:

   ```bash
   docker build -t my-fastapi-app .
   ```

2. Run the Docker container:

   ```bash
   docker run -d -p 8000:8000 my-fastapi-app
   ```

3. Access the API at `http://localhost:8000`.

### Environment Variables

Create a `.env` file in the `expo-app` directory and add your Firebase configuration:
