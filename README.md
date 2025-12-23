# DeepTrace

## Overview

DeepTrace is an application designed to analyze video content and detect whether it has been manipulated using deepfake techniques. The project explores how machine learning models can be applied to video analysis while providing a usable system for uploading media, tracking processing progress, and viewing detection results.

The focus of DeepTrace is to demonstrate an end-to-end workflow for deepfake detection, combining machine learning inference with a web-based application.

---

## Problem Context

With the increasing realism of deepfakes and synthetic media, verifying the authenticity of video content has become more challenging. Deepfake detection models can help identify manipulated content, but running such models on large video files is computationally expensive.

DeepTrace addresses this by:
- allowing users to submit videos for analysis,
- running deepfake detection models in the background,
- returning structured detection results once processing is complete.

---

## System Overview

DeepTrace is implemented as a web-based system with clearly separated components:

- **Frontend (React)**  
  Provides the user interface for uploading videos and checking analysis status.

- **Backend (Node.js + Express)**  
  Handles API requests, input validation, file handling, and tracking the status of analysis jobs.

- **ML Service (Python + Flask)**  
  Runs the deepfake detection models and performs video analysis.

- **Database (MongoDB)**  
  Stores job information, processing status, and detection results.

An optional blockchain component was explored to store verification results immutably, but it is not required for the core functionality of the system.

---

## Workflow

1. A user uploads a video through the web interface.
2. The backend creates a job entry and returns a unique identifier.
3. The video is processed by the ML service in the background.
4. Detection results are saved once processing completes.
5. The user can retrieve and view the results using the job identifier.

This approach ensures that video analysis does not block user interactions.

---

## Machine Learning Components

The ML component of DeepTrace focuses on video-based deepfake detection:

- **Video Processing**  
  Frames are extracted from the uploaded video and prepared for analysis.

- **Deepfake Detection Models**  
  Predefined deep learning models are used to analyze facial and visual features to classify videos as real or fake.

- **Result Aggregation**  
  Model outputs are aggregated into a final prediction that is returned to the application.

The emphasis of the project is on applying existing deepfake detection models within a complete application workflow rather than developing new detection algorithms.

---

## Key Learnings

- Integrating ML-based video analysis into a web application
- Handling long-running video processing tasks without blocking APIs
- Managing application state and results using a database
- Coordinating communication between backend services and ML components

---

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **ML**: Python, Flask, PyTorch, OpenCV
- **Database**: MongoDB
- **Optional**: Blockchain-based result anchoring (experimented)

---

## Setup

This repository contains the full implementation of the system and can be run locally for experimentation and code review.

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- MongoDB

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NishCode17/DeepTrace
   cd DeepTrace

2. **Start the Backend Orchestrator**
    ```bash
    cd Backend
    # Copy example environment variables
    cp .env.example .env
    # Edit .env to add your Google Auth credentials if needed
    
    npm install
    npm run dev
    ```

3.  **Start the ML Worker**
    ```bash
    # In a new terminal
    cd models
    pip install -r requirements.txt
    python app.py
    ```

4.  **Run Frontend**
    ```bash
    # In a new terminal
    cd Frontend
    npm install
    npm run dev
    ```

## Key Engineering Features

*   **Backend Orchestration**: Implements a custom orchestration logic to manage asynchronous workflows.
*   **Async ML Execution**: Handles heavy computational loads without blocking the event loop.
*   **Separation of Concerns**: Strict boundary between the control plane (Node.js) and the compute plane (Python).
*   **Robust State Management**: Tracks strict job states across distributed system components.