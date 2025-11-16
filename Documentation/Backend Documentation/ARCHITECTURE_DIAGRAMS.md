# DeepTrace Architecture - Visual Diagrams

> Comprehensive visual representations of the DeepTrace backend architecture

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Video Processing Pipeline](#video-processing-pipeline)
5. [Database Architecture](#database-architecture)
6. [Network Architecture](#network-architecture)
7. [ML Model Pipeline](#ml-model-pipeline)
8. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │              React Frontend (Vite)                       │        │
│  │              http://localhost:5173                       │        │
│  │                                                           │        │
│  │  Components:                                             │        │
│  │  • Login/Signup UI                                       │        │
│  │  • Video Upload Interface                                │        │
│  │  • Results Dashboard                                     │        │
│  │  • User Profile                                          │        │
│  └─────────────────────────────────────────────────────────┘        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/HTTPS
                             │ CORS Enabled
                             │ Credentials: include
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│                                                                       │
│  ┌──────────────────────┐              ┌──────────────────────┐     │
│  │  Node.js Express     │              │  Python Flask        │     │
│  │  Backend Server      │              │  ML Service          │     │
│  │  Port: 5000          │              │  Port: 8080          │     │
│  │                      │              │                      │     │
│  │  Features:           │              │  Features:           │     │
│  │  • Authentication    │              │  • Video Processing  │     │
│  │  • Session Mgmt      │              │  • Face Detection    │     │
│  │  • User Management   │              │  • ML Inference      │     │
│  │  • Metadata Ops      │              │  • Result Analysis   │     │
│  └──────────┬───────────┘              └──────────┬───────────┘     │
│             │                                     │                  │
└─────────────┼─────────────────────────────────────┼─────────────────┘
              │                                     │
              │ Mongoose ODM                        │ PyTorch/TF
              ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│                                                                       │
│  ┌──────────────────────────────┐    ┌─────────────────────────┐   │
│  │    MongoDB Atlas              │    │  Pre-trained Models     │   │
│  │    (Cloud Database)           │    │  • EfficientNet-B4      │   │
│  │                               │    │  • BlazeFace            │   │
│  │  Collections:                 │    │  • ConvLSTM             │   │
│  │  • users                      │    │  • LRCN                 │   │
│  │  • sessions                   │    │  • Vision Transformer   │   │
│  └───────────────────────────────┘    └─────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Backend Server (Express.js)

```
┌─────────────────────────────────────────────────────────────┐
│                 Express.js Server (Port 5000)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────┐          │
│  │            Middleware Stack                    │          │
│  │                                                 │          │
│  │  [1] express.json()        - Parse JSON        │          │
│  │          ↓                                      │          │
│  │  [2] express-session       - Session handling  │          │
│  │          ↓                                      │          │
│  │  [3] CORS Headers          - Cross-origin      │          │
│  │          ↓                                      │          │
│  │  [4] CORS Middleware       - CORS config       │          │
│  │          ↓                                      │          │
│  │  [5] passport.initialize() - Init auth         │          │
│  │          ↓                                      │          │
│  │  [6] passport.session()    - Passport session  │          │
│  │          ↓                                      │          │
│  │  [7] Routes                - Application logic │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
│  ┌───────────────────────────────────────────────┐          │
│  │              Route Handlers                    │          │
│  │                                                 │          │
│  │  /auth/google              → Google OAuth      │          │
│  │  /auth/google/callback     → OAuth Callback    │          │
│  │  /getUserDetails           → Get User Info     │          │
│  │  /logout                   → Logout            │          │
│  │  /home                     → Protected Route   │          │
│  │  /metadata-update          → Update Metadata   │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
│  ┌───────────────────────────────────────────────┐          │
│  │          External Dependencies                 │          │
│  │                                                 │          │
│  │  MongoDB Atlas ──┐                             │          │
│  │                  ├→ User Storage               │          │
│  │                  └→ Session Storage            │          │
│  │                                                 │          │
│  │  Google OAuth ───→ User Authentication         │          │
│  │                                                 │          │
│  │  ExifTool ───────→ Video Metadata              │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### ML Service (Flask + PyTorch)

```
┌─────────────────────────────────────────────────────────────┐
│              Flask ML Service (Port 8080)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────┐          │
│  │              Model Loading                     │          │
│  │                                                 │          │
│  │  [1] Load EfficientNetAutoAttB4                │          │
│  │  [2] Load Pre-trained Weights (DFDC)          │          │
│  │  [3] Initialize BlazeFace Detector             │          │
│  │  [4] Load Face Detection Anchors               │          │
│  │  [5] Set Device (CPU/CUDA)                     │          │
│  │  [6] Model → Evaluation Mode                   │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
│  ┌───────────────────────────────────────────────┐          │
│  │          Video Processing Pipeline             │          │
│  │                                                 │          │
│  │  Input: Video File + frames_per_video         │          │
│  │     ↓                                           │          │
│  │  VideoReader: Extract Frames                   │          │
│  │     ↓                                           │          │
│  │  FaceExtractor: Detect & Crop Faces            │          │
│  │     ↓                                           │          │
│  │  Transform: Resize + Normalize                 │          │
│  │     ↓                                           │          │
│  │  Stack to Tensor [N, 3, 224, 224]             │          │
│  │     ↓                                           │          │
│  │  EfficientNet Forward Pass                     │          │
│  │     ↓                                           │          │
│  │  Apply Sigmoid (expit)                         │          │
│  │     ↓                                           │          │
│  │  Calculate Mean Score                          │          │
│  │     ↓                                           │          │
│  │  Output: {pred_scores, mean_score}             │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
│  ┌───────────────────────────────────────────────┐          │
│  │              Utilities                         │          │
│  │                                                 │          │
│  │  blazeface/                                    │          │
│  │  ├─ blazeface.py        - Face detector        │          │
│  │  ├─ face_extract.py     - Face extraction      │          │
│  │  ├─ read_video.py       - Video reader         │          │
│  │  └─ blazeface.pth       - Pre-trained weights  │          │
│  │                                                 │          │
│  │  architectures/                                │          │
│  │  ├─ fornet.py           - Model architectures  │          │
│  │  └─ weights.py          - Weight URLs          │          │
│  │                                                 │          │
│  │  isplutils/                                    │          │
│  │  ├─ utils.py            - Helper functions     │          │
│  │  └─ data.py             - Data processing      │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Google OAuth 2.0 Flow

```
┌─────────────┐
│   Browser   │
│  (User)     │
└──────┬──────┘
       │
       │ (1) Click "Sign in with Google"
       │
       ▼
┌────────────────────────────┐
│   Frontend (React)         │
│   localhost:5173           │
└──────┬─────────────────────┘
       │
       │ (2) Redirect to /auth/google
       │
       ▼
┌────────────────────────────┐
│  Express Backend           │
│  localhost:5000            │
│                            │
│  GET /auth/google          │
│  ├─ passport.authenticate  │
│  └─ scope: profile, email  │
└──────┬─────────────────────┘
       │
       │ (3) Redirect to Google
       │
       ▼
┌────────────────────────────┐
│  Google OAuth Server       │
│  accounts.google.com       │
│                            │
│  • User logs in            │
│  • Reviews permissions     │
│  • Grants access           │
└──────┬─────────────────────┘
       │
       │ (4) Callback with auth code
       │
       ▼
┌────────────────────────────┐
│  Express Backend           │
│  /auth/google/callback     │
│                            │
│  ┌──────────────────────┐ │
│  │ Passport Strategy    │ │
│  │                      │ │
│  │ (5) Exchange code    │ │
│  │     for tokens       │ │
│  │         ↓            │ │
│  │ (6) Get user profile │ │
│  │         ↓            │ │
│  │ (7) Find/Create user │ │
│  │     in MongoDB       │ │
│  │         ↓            │ │
│  │ (8) Serialize user   │ │
│  │     to session       │ │
│  └──────────────────────┘ │
└──────┬─────────────────────┘
       │
       │ (9) Set session cookie
       │
       ▼
┌────────────────────────────┐
│   MongoDB Atlas            │
│                            │
│  sessions collection       │
│  ┌──────────────────────┐ │
│  │ _id: "session_123"   │ │
│  │ expires: Date        │ │
│  │ session: {           │ │
│  │   passport: {        │ │
│  │     user: "user_id"  │ │
│  │   }                  │ │
│  │ }                    │ │
│  └──────────────────────┘ │
└──────┬─────────────────────┘
       │
       │ (10) Redirect to frontend /home
       │
       ▼
┌────────────────────────────┐
│   Frontend (React)         │
│   localhost:5173/home      │
│                            │
│   User logged in!          │
│   Session cookie stored    │
└────────────────────────────┘
```

### Session Validation on Request

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       │ GET /getUserDetails
       │ Cookie: connect.sid=abc123
       │
       ▼
┌──────────────────────────────────────┐
│          Express Backend              │
│                                       │
│  ┌────────────────────────────────┐  │
│  │  express-session Middleware    │  │
│  │                                 │  │
│  │  (1) Read session cookie       │  │
│  │         ↓                       │  │
│  │  (2) Query MongoDB sessions    │  │
│  │         ↓                       │  │
│  │  (3) Deserialize session       │  │
│  │         ↓                       │  │
│  │  (4) Check expiry              │  │
│  └─────────┬───────────────────────┘  │
│            │                          │
│            ▼                          │
│  ┌────────────────────────────────┐  │
│  │  passport.deserializeUser      │  │
│  │                                 │  │
│  │  (5) Get user ID from session  │  │
│  │         ↓                       │  │
│  │  (6) Query users collection    │  │
│  │         ↓                       │  │
│  │  (7) Load full user object     │  │
│  │         ↓                       │  │
│  │  (8) Attach to req.user        │  │
│  └─────────┬───────────────────────┘  │
│            │                          │
│            ▼                          │
│  ┌────────────────────────────────┐  │
│  │  Route Handler                 │  │
│  │                                 │  │
│  │  if (req.isAuthenticated())    │  │
│  │    return user data            │  │
│  │  else                           │  │
│  │    return null                 │  │
│  └────────────────────────────────┘  │
└───────────────────────────────────────┘
```

---

## Video Processing Pipeline

### Complete Processing Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: Video Upload                          │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 │ POST /upload-video
                 │ FormData:
                 │   - video: File (video.mp4)
                 │   - frames_per_video: 100
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│              FLASK ML SERVICE: Video Reception                     │
│                                                                     │
│  (1) Receive video file                                            │
│  (2) Save temporarily as 'input_video.mp4'                         │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                    STAGE 1: Frame Extraction                       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  VideoReader (OpenCV)                                 │         │
│  │                                                        │         │
│  │  • Open video file: cv2.VideoCapture()               │         │
│  │  • Get total frames: CAP_PROP_FRAME_COUNT            │         │
│  │  • Calculate skip interval: total / frames_per_video │         │
│  │  • Extract evenly distributed frames                 │         │
│  │                                                        │         │
│  │  Example for 300 frame video, 100 samples:           │         │
│  │    Frame 0, 3, 6, 9, ..., 297                        │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  Output: List of 100 frame arrays [H, W, 3]                        │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                    STAGE 2: Face Detection                         │
│                                                                     │
│  For each frame:                                                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Step 1: Tile Frame                                  │         │
│  │  ┌──────────┬──────────┬──────────┐                 │         │
│  │  │  Tile 1  │  Tile 2  │  Tile 3  │                 │         │
│  │  ├──────────┼──────────┼──────────┤                 │         │
│  │  │  Tile 4  │  Tile 5  │  Tile 6  │                 │         │
│  │  └──────────┴──────────┴──────────┘                 │         │
│  │  • Resize each tile to 128x128                       │         │
│  │  • Maintain aspect ratio                             │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Step 2: BlazeFace Detection                         │         │
│  │                                                        │         │
│  │  • Run detector on each tile                         │         │
│  │  • Get bounding boxes [x1, y1, x2, y2]              │         │
│  │  • Get confidence scores                             │         │
│  │  • Get facial landmarks (5 points)                   │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Step 3: Combine Detections                          │         │
│  │                                                        │         │
│  │  • Resize detections back to original frame size     │         │
│  │  • Merge detections from all tiles                   │         │
│  │  • Apply Non-Maximum Suppression (NMS)               │         │
│  │    - Remove overlapping detections                   │         │
│  │    - Keep highest confidence                         │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Step 4: Crop Faces                                  │         │
│  │                                                        │         │
│  │  • Add 20% margin around detected face                │         │
│  │  • Crop face region from original frame              │         │
│  │  • Store face array                                  │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  Output: List of face arrays (one per frame)                       │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                STAGE 3: Face Preprocessing                         │
│                                                                     │
│  For each detected face:                                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Transform Pipeline                                   │         │
│  │                                                        │         │
│  │  (1) Resize: face → 224×224 pixels                   │         │
│  │         ↓                                              │         │
│  │  (2) Normalize: RGB values → ImageNet stats          │         │
│  │      • Subtract mean: [0.485, 0.456, 0.406]          │         │
│  │      • Divide by std: [0.229, 0.224, 0.225]          │         │
│  │         ↓                                              │         │
│  │  (3) To Tensor: [H, W, C] → [C, H, W]                │         │
│  │         ↓                                              │         │
│  │  (4) Stack: Create batch tensor                      │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  Output: Tensor [N, 3, 224, 224]                                   │
│          where N = number of frames with detected faces            │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│             STAGE 4: ML Model Inference                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  EfficientNetAutoAttB4 Architecture                   │         │
│  │                                                        │         │
│  │  Input: [N, 3, 224, 224]                             │         │
│  │     ↓                                                  │         │
│  │  ┌──────────────────────────────────────┐            │         │
│  │  │  EfficientNet Backbone                │            │         │
│  │  │  • 9 Convolutional blocks             │            │         │
│  │  │  • Compound scaling (depth, width)    │            │         │
│  │  │  • MBConv with squeeze-excitation     │            │         │
│  │  └────────────┬──────────────────────────┘            │         │
│  │               ↓                                        │         │
│  │  ┌──────────────────────────────────────┐            │         │
│  │  │  Attention Block (at block 9)         │            │         │
│  │  │  • Extract intermediate features      │            │         │
│  │  │  • Generate attention map             │            │         │
│  │  │  • Multiply features × attention      │            │         │
│  │  └────────────┬──────────────────────────┘            │         │
│  │               ↓                                        │         │
│  │  ┌──────────────────────────────────────┐            │         │
│  │  │  Global Average Pooling               │            │         │
│  │  │  • Reduces spatial dimensions         │            │         │
│  │  │  • Output: [N, 1792]                  │            │         │
│  │  └────────────┬──────────────────────────┘            │         │
│  │               ↓                                        │         │
│  │  ┌──────────────────────────────────────┐            │         │
│  │  │  Dropout (p=0.3)                      │            │         │
│  │  └────────────┬──────────────────────────┘            │         │
│  │               ↓                                        │         │
│  │  ┌──────────────────────────────────────┐            │         │
│  │  │  Linear Classifier (1792 → 1)         │            │         │
│  │  │  • Output: Logits [N, 1]             │            │         │
│  │  └────────────────────────────────────────┘            │         │
│  │                                                        │         │
│  │  Output: Raw prediction scores (logits) [N]           │         │
│  └──────────────────────────────────────────────────────┘         │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│              STAGE 5: Post-Processing                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Score Transformation                                 │         │
│  │                                                        │         │
│  │  (1) Apply Sigmoid (expit):                           │         │
│  │      logits → probabilities [0, 1]                    │         │
│  │                                                        │         │
│  │      sigmoid(x) = 1 / (1 + e^(-x))                   │         │
│  │                                                        │         │
│  │      Example:                                         │         │
│  │        logit: -2.3 → probability: 0.09 (Real)        │         │
│  │        logit:  0.0 → probability: 0.50 (Uncertain)   │         │
│  │        logit:  2.3 → probability: 0.91 (Fake)        │         │
│  │                                                        │         │
│  │  (2) Calculate Mean:                                  │         │
│  │      mean_score = sum(probabilities) / N              │         │
│  │                                                        │         │
│  │  (3) Per-frame scores:                                │         │
│  │      Store individual frame probabilities             │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  Output:                                                            │
│    • pred_scores: [0.23, 0.31, 0.19, ...]  (per frame)            │
│    • mean_score: 0.292                      (overall)              │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                  STAGE 6: Cleanup & Response                       │
│                                                                     │
│  (1) Delete temporary video file ('input_video.mp4')               │
│  (2) Format response as JSON                                       │
│  (3) Send to frontend                                              │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                 FRONTEND: Display Results                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │  Result Interpretation                                │         │
│  │                                                        │         │
│  │  mean_score = 0.292 (< 0.5)                          │         │
│  │      ↓                                                 │         │
│  │  Label: REAL                                          │         │
│  │  Confidence: (1 - 0.292) × 100 = 70.8%               │         │
│  │                                                        │         │
│  │  Display:                                             │         │
│  │  • Label: REAL                                        │         │
│  │  • Confidence: 70.8%                                  │         │
│  │  • Frame-by-frame graph                               │         │
│  │  • Total frames analyzed: 100                         │         │
│  └──────────────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────────────┘
```

---

## Database Architecture

### MongoDB Collections Structure

```
┌─────────────────────────────────────────────────────────┐
│              MongoDB Atlas - DeepTrace DB                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │              users Collection                      │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Document Structure                           │  │  │
│  │  │                                               │  │  │
│  │  │ {                                             │  │  │
│  │  │   _id: ObjectId("507f1f77bcf86cd799439011"),│  │  │
│  │  │   googleId: "1234567890",                   │  │  │
│  │  │   username: "John Doe",                     │  │  │
│  │  │   email: "john.doe@example.com",            │  │  │
│  │  │   __v: 0                                     │  │  │
│  │  │ }                                             │  │  │
│  │  │                                               │  │  │
│  │  │ Indexes:                                      │  │  │
│  │  │   • _id: 1 (Primary, Auto)                   │  │  │
│  │  │   • googleId: 1 (Unique)                     │  │  │
│  │  │                                               │  │  │
│  │  │ Relationships:                                │  │  │
│  │  │   → sessions.session.passport.user           │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │            sessions Collection                     │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Document Structure                           │  │  │
│  │  │                                               │  │  │
│  │  │ {                                             │  │  │
│  │  │   _id: "sess_abc123xyz789",                 │  │  │
│  │  │   expires: ISODate("2024-11-17T00:00:00Z"),│  │  │
│  │  │   session: {                                 │  │  │
│  │  │     cookie: {                                │  │  │
│  │  │       originalMaxAge: null,                 │  │  │
│  │  │       expires: null,                        │  │  │
│  │  │       httpOnly: true,                       │  │  │
│  │  │       path: "/",                            │  │  │
│  │  │       secure: false                         │  │  │
│  │  │     },                                       │  │  │
│  │  │     passport: {                              │  │  │
│  │  │       user: "507f1f77bcf86cd799439011"     │  │  │
│  │  │     }                                         │  │  │
│  │  │   }                                           │  │  │
│  │  │ }                                             │  │  │
│  │  │                                               │  │  │
│  │  │ Indexes:                                      │  │  │
│  │  │   • _id: 1 (Primary)                         │  │  │
│  │  │   • expires: 1 (TTL Index)                   │  │  │
│  │  │                                               │  │  │
│  │  │ TTL: Automatically deletes expired sessions  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Data Relationships

```
┌──────────────────┐            ┌──────────────────┐
│  users           │            │  sessions        │
│                  │            │                  │
│  _id ────────────┼───────────►│  session.        │
│  googleId        │  Referenced │  passport.user   │
│  username        │     by      │                  │
│  email           │            │  expires (TTL)   │
└──────────────────┘            └──────────────────┘
         │
         │ One user can have
         │ multiple sessions
         │ (different devices)
         ▼
    [Session 1]
    [Session 2]
    [Session 3]
```

---

## Network Architecture

### Local Development Network

```
┌─────────────────────────────────────────────────────────────┐
│                    localhost Network                         │
│                                                               │
│  ┌───────────────────┐         ┌───────────────────┐        │
│  │  Port 5173        │◄────────┤  Browser          │        │
│  │  React Frontend   │   HTTP  │  (Chrome, etc.)   │        │
│  │  (Vite Dev Server)│────────►│                   │        │
│  └─────────┬─────────┘         └───────────────────┘        │
│            │                                                  │
│            │ CORS Enabled                                    │
│            │ Credentials: include                            │
│            │                                                  │
│            ├──────────────┬──────────────────┐              │
│            │              │                  │              │
│            ▼              ▼                  ▼              │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Port 5000    │  │  Port 8080   │  │  Port 27017  │    │
│  │  Express      │  │  Flask       │  │  MongoDB     │    │
│  │  Backend      │  │  ML Service  │  │  (local)     │    │
│  └───────┬───────┘  └──────────────┘  └──────┬───────┘    │
│          │                                    │             │
│          │                                    │             │
└──────────┼────────────────────────────────────┼─────────────┘
           │                                    │
           │                                    │
           │         Or MongoDB Atlas           │
           │                ▼                   │
           │      ┌──────────────────┐         │
           └─────►│  MongoDB Atlas   │◄────────┘
                  │  (Cloud)         │
                  │  Port 27017      │
                  │  over SSL        │
                  └──────────────────┘
```

### Production Network (AWS Example)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────┐
                  │  CloudFlare CDN  │
                  │  (Optional)      │
                  └─────────┬────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                         AWS VPC                                   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │               Application Load Balancer                   │    │
│  │               Port 443 (HTTPS)                            │    │
│  │               SSL Certificate                             │    │
│  └────┬─────────────────────────────────────────┬───────────┘    │
│       │                                          │                 │
│       │ Target Group: Backend                   │ Target Group: ML│
│       │                                          │                 │
│       ▼                                          ▼                 │
│  ┌─────────────────┐                    ┌──────────────────┐     │
│  │  EC2 Instance   │                    │  EC2 Instance    │     │
│  │  Backend Servers│                    │  ML Servers      │     │
│  │  (Auto Scaling) │                    │  (Auto Scaling)  │     │
│  │                 │                    │                  │     │
│  │  • Node.js      │                    │  • Python/Flask  │     │
│  │  • PM2          │                    │  • PyTorch       │     │
│  │  • Port 5000    │                    │  • GPU Enabled   │     │
│  │                 │                    │  • Port 8080     │     │
│  └────────┬────────┘                    └──────────────────┘     │
│           │                                                        │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────────────────┐                                 │
│  │  MongoDB Atlas              │                                 │
│  │  (External to VPC)          │                                 │
│  │  Connection over SSL/TLS    │                                 │
│  └─────────────────────────────┘                                 │
│                                                                     │
│  ┌─────────────────────────────┐                                 │
│  │  S3 Bucket                  │                                 │
│  │  • Video storage            │                                 │
│  │  • Static assets            │                                 │
│  │  • Model weights            │                                 │
│  └─────────────────────────────┘                                 │
│                                                                     │
│  ┌─────────────────────────────┐                                 │
│  │  CloudWatch                 │                                 │
│  │  • Logging                  │                                 │
│  │  • Metrics                  │                                 │
│  │  • Alarms                   │                                 │
│  └─────────────────────────────┘                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ML Model Pipeline

### Model Architecture Comparison

```
┌──────────────────────────────────────────────────────────────────────┐
│                    EfficientNetAutoAttB4                              │
│                  (Production Inference Model)                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Input: [batch, 3, 224, 224]                                         │
│     ↓                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Stem: Conv2D + BatchNorm + Swish                             │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MBConv Blocks 1-9 (EfficientNet Backbone)                   │   │
│  │  • Mobile Inverted Bottleneck                                │   │
│  │  • Squeeze-and-Excitation                                    │   │
│  │  • Skip connections                                          │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│                         [At Block 9: 56 channels]                     │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Attention Module                                             │   │
│  │  ┌─────────────────────────┐                                 │   │
│  │  │  Conv2D 3x3             │                                 │   │
│  │  │        ↓                 │                                 │   │
│  │  │  ReLU                   │                                 │   │
│  │  │        ↓                 │                                 │   │
│  │  │  Conv2D 1x1 → 1 channel │                                 │   │
│  │  │        ↓                 │                                 │   │
│  │  │  Sigmoid                │                                 │   │
│  │  │        ↓                 │                                 │   │
│  │  │  Attention Map [1, H, W]│                                 │   │
│  │  └─────────┬───────────────┘                                 │   │
│  │            │                                                  │   │
│  │            │  Multiply                                        │   │
│  │            ▼                                                  │   │
│  │  Features × Attention Map                                    │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Remaining MBConv Blocks                                      │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Global Average Pooling → [batch, 1792]                      │   │
│  └────────────────────────────┬───────────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dropout(0.3) + Linear(1792 → 1)                             │   │
│  └────────────────────────────┬───────────────────────────────────┘   │
│                                   ↓                                    │
│  Output: [batch, 1] (Fake probability logit)                         │
│                                                                        │
│  Parameters: ~19M                                                     │
│  FLOPs: ~4.5B                                                         │
└────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         ConvLSTM Model                                │
│                   (Temporal Sequence Analysis)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Input: [batch, 80, 64, 64, 3]                                       │
│     ↓                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ConvLSTM2D(4 filters, 3x3)                                  │   │
│  │  • Processes spatial + temporal                              │   │
│  │  • LSTM gates: forget, input, cell, output                  │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MaxPooling3D + Dropout(0.2)                                 │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ConvLSTM2D(8 filters, 3x3)                                  │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MaxPooling3D + Dropout(0.2)                                 │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ConvLSTM2D(14 filters, 3x3)                                 │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MaxPooling3D + Dropout(0.2)                                 │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ConvLSTM2D(16 filters, 3x3)                                 │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Flatten + Dense(2, softmax)                                 │   │
│  └────────────────────────────────┬───────────────────────────────┘   │
│                                   ↓                                    │
│  Output: [batch, 2] (Real/Fake probabilities)                        │
│                                                                        │
│  Parameters: ~200K                                                    │
│  Best for: Detecting temporal inconsistencies                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Docker Compose Deployment

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Docker Host Machine                             │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  Docker Network (bridge)                    │    │
│  │                                                              │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐│    │
│  │  │  Container 1    │  │  Container 2    │  │ Container 3││    │
│  │  │  MongoDB        │  │  Backend        │  │ ML Service ││    │
│  │  │                 │  │                 │  │            ││    │
│  │  │  • Port 27017   │  │  • Port 5000    │  │ • Port 8080││    │
│  │  │  • Volume       │  │  • Depends on   │  │ • GPU      ││    │
│  │  │    mongodb_data │  │    MongoDB      │  │   support  ││    │
│  │  └────────┬────────┘  └────────┬────────┘  └──────┬─────┘│    │
│  │           │                    │                   │      │    │
│  │           └────────────────────┴───────────────────┘      │    │
│  │                          Internal Network                  │    │
│  └───────────────────────────────┬────────────────────────────┘    │
│                                  │                                  │
│  ┌──────────────────────────────┴───────────────────────────┐     │
│  │                  Container 4: Nginx                       │     │
│  │                  • Port 80:80                             │     │
│  │                  • Port 443:443                           │     │
│  │                  • Reverse proxy                          │     │
│  │                  • SSL termination                        │     │
│  │                  • Serves frontend static files           │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
                                   ▼
                              Public Internet
```

---

## Summary

This document provides comprehensive visual diagrams of:
- ✅ Complete system architecture
- ✅ Component-level details
- ✅ Authentication flows
- ✅ Video processing pipeline
- ✅ Database structure
- ✅ Network architecture
- ✅ ML model architectures
- ✅ Deployment configurations

For more details, refer to:
- [Backend Architecture Documentation](BACKEND_ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024

