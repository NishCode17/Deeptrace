# DeepTrace: Unmasking the Algorithms 🕵️‍♂️✨

**DeepTrace is a Deepfake Detection System that doesn't just "guess" — it investigates.**

In an era where "seeing is believing" is no longer true, DeepTrace provides a robust, engineered solution to verify video authenticity. We combine a high-performance **Node.js Orchestrator** with a state-of-the-art **Computer Vision Engine** to analyze synthetic media frame-by-frame.

---

## ⚡ How It Works (The Engineering Behind the Magic)

DeepTrace isn't just a model in a notebook; it's a full-stack distributed system designed for reliability and scale.

### 🧠 The Brain: AI & Computer Vision
At the core lies our Python-based Inference Engine, powered by **PyTorch**.
*   **Frame Extraction Logic**: We don't just feed raw video. We intelligently sample frames to catch temporal inconsistencies.
*   **Ensemble Modeling**:
    *   **EfficientNet-B4**: Acts as our heavy lifter, extracting deep feature maps from every face.
    *   **BlazeFace**: A lightning-fast face detector ensuring we only analyze relevant pixels, ignoring background noise.
    *   **LSTM / Recurrent Layers**: (Architecture dependent) Analyzes the *sequence* of frames to detect "jitter" or unnatural movement common in deepfakes.

### ⚙️ The Backbone: Backend Orchestration
Running deep learning models on the web is hard. If you just put a model in a API route, your server creates a bottleneck. We fixed that.
*   **Asynchronous Job Queue**: When you upload a video, the server doesn't freeze. It issues a **Job ID** and offloads the heavy lifting to a background worker.
*   **State Machine Architecture**: Every job transitions through strict states: `PENDING` → `PROCESSING` → `COMPLETED` (or `FAILED`), ensuring no upload gets lost in the void.
*   **Cross-Service Communication**: Our Node.js backend acts as the conductor, securely managing data pipelines between the User, the Database, and the AI Service.

---

## 🎨 Features
*   **Deepfake Probability Score**: Not just a binary "Yes/No", but a confidence score (e.g., "98.5% Fake").
*   **User History Tracking**: We persist every analysis. Log in to see your past investigations.
*   **Secure Authentication**: Google OAuth integration keeps your data safe.
*   **Smart Metadata Injection**: (Optional) We can even embed the authenticity report directly into the video's metadata using ExifTool.

---

## 🛠️ Tech Stack
*   **Frontend**: React + Vite (for that snappy, modern UI)
*   **Backend**: Node.js + Express (The high-speed traffic controller)
*   **AI Engine**: Python, PyTorch, EfficientNet, BlazeFace, OpenCV
*   **Database**: MongoDB (Persisting state and user history)

---

## 🚀 Running Local
Want to see the gears turn? Here is how to run the full stack on your machine.

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
*Upload a video, watch the console logs, and see the system come alive!*