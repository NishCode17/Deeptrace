# DeepTrace

![DeepTrace Cover](public/deeptrace_cover.png)

## Overview

Deepfakes and synthetic media are becoming increasingly sophisticated, creating a need for reliable detection mechanisms. DeepTrace is a system designed to assess media authenticity using multiple deepfake detection models.

The project centers on a backend-orchestrated architecture that manages long-running ML inference tasks. It explicitly separates the API layer from the compute-intensive detection layer, using a job-based model to ensure responsiveness and reliability during heavy processing loads.

## Architecture

The system is built on a decoupled architecture to handle the discrepancies between rapid user interactions and slow model inference:

*   **Frontend (React)**: Provides the user interface for video uploads and real-time status tracking.
*   **Backend Orchestrator (Node.js + Express)**: Serves as the control plane. It handles API requests, validates inputs, and manages the lifecycle of detection jobs.
*   **ML Worker (Flask + PyTorch)**: A dedicated, stateless worker process that processes jobs when invoked by the backend and executes CPU/GPU-intensive inference models.
*   **MongoDB**: Acts as the single source of truth for job states (lifecycle tracking, processing status, results).
*   **Blockchain (Optional)**: Utilized for anchoring verification results to ensure immutability (NeoX Testnet).

## Request Lifecycle

The request flow ensures non-blocking execution for the main server:

1.  **Upload**: The user uploads a video file via the React frontend.
2.  **Job Creation**: The Node.js orchestrator accepts the upload, stores the file, and creates a `Job` document in MongoDB with a `PENDING` status. A `jobId` is immediately returned to the client to release the connection.
3.  **Job Dispatch**: The backend orchestrator dispatches the job to the ML worker for processing.
4.  **Processing Initialization**: The worker updates the job status to `PROCESSING` to mark the start of execution.
5.  **ML Inference**: The deepfake detection models run on the video content.
6.  **Completion**: Upon success, the worker writes the inference results to MongoDB and updates the status to `COMPLETED`.
7.  **Result Retrieval**: The frontend polls the orchestrator for the job status and renders the classification report once the processing is finished.

## Backend Design Decisions

*   **Async Job Orchestration**: The system uses MongoDB as a persistent job state store. This avoids the operational complexity of a separate message broker for this scale while providing full visibility into job history and state.
*   **Stateless ML Worker**: The Python inference engine is completely decoupled from the Node.js web server. This allows the compute layer to restart or crash without bringing down the API gateway.
*   **Job State Synchronization**: Uses atomic database updates to manage job lifecycle transitions, ensuring consistency across system components.
*   **Failure-Aware Job States**: The state machine explicitly handles `FAILED` states, ensuring the UI can provide feedback during model crashes or corrupt file uploads.

## Tech Stack

*   **Backend**: Node.js, Express
*   **ML**: Python, Flask, PyTorch (Deepfake detection models), OpenCV
*   **Database**: MongoDB (Mongoose)
*   **Frontend**: React, Vite, TailwindCSS
*   **Blockchain**: Hardhat, Solidity (NeoX Testnet)

## Setup

This project is intended primarily for code review and architectural discussion. Local setup is provided for completeness.

### Prerequisites
*   Node.js (v16+)
*   Python (3.8+)
*   MongoDB running locally

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/NishCode17/DeepTrace
    cd DeepTrace
    ```

2.  **Start the Backend Orchestrator**
    ```bash
    cd Backend
    npm install
    npm run dev
    ```

3.  **Start the ML Worker**
    ```bash
    # In a new terminal
    pip install -r requirements.txt
    python models/app.py
    ```

4.  **Run Frontend**
    ```bash
    # In a new terminal
    npm install
    npm run dev
    ```

## Key Engineering Features

*   **Backend Orchestration**: Implements a custom orchestration logic to manage asynchronous workflows.
*   **Async ML Execution**: Handles heavy computational loads without blocking the event loop.
*   **Separation of Concerns**: Strict boundary between the control plane (Node.js) and the compute plane (Python).
*   **Robust State Management**: Tracks strict job states across distributed system components.

