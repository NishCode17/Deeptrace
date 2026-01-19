# DeepTrace: Advanced Deepfake Detection System

**DeepTrace is a Deepfake Detection System designed to investigate video authenticity through rigorous analysis.**

In an era where synthetic media is becoming increasingly realistic, DeepTrace provides a robust, engineered solution to verify video content. We combine a high-performance **Node.js Orchestrator** with a state-of-the-art **Computer Vision Engine** to analyze synthetic media frame-by-frame.

---

## How It Works

DeepTrace is a full-stack distributed system designed for reliability and scale, moving beyond simple model inference to a complete production workflow.

### The Brain: AI & Computer Vision
At the core lies our Python-based Inference Engine, powered by **PyTorch**.
*   **Frame Extraction Logic**: The system intelligently samples frames to capture temporal inconsistencies rather than processing raw video streams blindly.
*   **Ensemble Modeling**:
    *   **EfficientNet-B4**: Acts as the primary feature extractor, deriving deep feature maps from facial regions.
    *   **BlazeFace**: A high-performance face detector ensuring analysis is strictly focused on relevant facial pixels, filtering out background noise.
    *   **Sequence Analysis**: Analyzes the temporal sequence of frames to detect "jitter" or unnatural movement patterns often present in generative media.

### The Backbone: Backend Orchestration
DeepTrace addresses the bottleneck of running deep learning models in a web environment through a decoupled architecture.
*   **Asynchronous Job Queue**: Video uploads trigger a non-blocking workflow. The server issues a **Job ID** and offloads the computational load to a background worker.
*   **State Machine Architecture**: Every job transitions through strict states: `PENDING` → `PROCESSING` → `COMPLETED` (or `FAILED`), ensuring robust tracking of every request.
*   **Cross-Service Communication**: The Node.js backend acts as a central orchestrator, securely managing data pipelines between the User, the Database, and the AI Service.

---

## Features
*   **Deepfake Probability Score**: Provides a granular confidence score (e.g., "98.5% Fake") rather than a simple binary classification.
*   **User History Tracking**: Persists analysis history, allowing users to review past investigations.
*   **Secure Authentication**: Integrated Google OAuth 2.0 for secure user identity management.
*   **Smart Metadata Injection**: Capability to embed authenticity reports directly into video metadata using ExifTool.

---

## Tech Stack
*   **Frontend**: React + Vite
*   **Backend**: Node.js + Express
*   **AI Engine**: Python, PyTorch, EfficientNet, BlazeFace, OpenCV
*   **Database**: MongoDB

---

## Running Local

Follow these steps to run the full stack architecture locally.

### 1. Backend (The Orchestrator)
```bash
cd Backend
npm install
npm run dev
# Server starts on port 5000 (controlling the workflow)
```

### 2. AI Engine (The Worker)
```bash
cd models
pip install -r requirements.txt
python app.py
# AI Service starts on port 8080 (waiting for jobs)
```

### 3. Frontend (The Interface)
```bash
cd Frontend
npm install
npm run dev
# UI starts on port 5173
```