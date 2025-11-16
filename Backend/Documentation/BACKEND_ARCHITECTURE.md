# DeepTrace Backend Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Backend Components](#backend-components)
5. [Node.js Express Server](#nodejs-express-server)
6. [Machine Learning Models](#machine-learning-models)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Data Flow](#data-flow)
10. [Dependencies](#dependencies)

---

## Overview

DeepTrace is a deepfake detection system that uses multiple machine learning models to analyze video content and determine authenticity. The backend architecture consists of two main components:

1. **Node.js Express Server**: Handles user authentication, session management, and metadata operations
2. **Python Flask ML Service**: Processes video files using advanced deep learning models for deepfake detection

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                     http://localhost:5173                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 ├───────────────────┬────────────────────────┐
                 │                   │                        │
                 ▼                   ▼                        ▼
    ┌────────────────────┐  ┌──────────────────┐  ┌─────────────────┐
    │  Node.js Express   │  │  Python Flask    │  │   MongoDB       │
    │     Server         │  │   ML Service     │  │   Database      │
    │  localhost:5000    │  │  localhost:8080  │  │   Atlas Cloud   │
    └──────┬─────────────┘  └────────┬─────────┘  └─────────────────┘
           │                         │
           │                         │
           ▼                         ▼
    ┌─────────────────┐      ┌──────────────────────────┐
    │  Passport.js    │      │  ML Model Pipeline       │
    │  (OAuth 2.0)    │      │  - EfficientNet          │
    │  Google Auth    │      │  - ConvLSTM              │
    └─────────────────┘      │  - LRCN                  │
                             │  - Vision Transformer    │
                             │  - BlazeFace Detector    │
                             └──────────────────────────┘
```

---

## Technology Stack

### Backend Services

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Web Server** | Node.js + Express | 4.21.0 | REST API server |
| **ML Service** | Python + Flask | - | Video processing & ML inference |
| **Database** | MongoDB Atlas | 6.9.0 | User data storage |
| **Session Store** | connect-mongo | 5.1.0 | Session persistence |
| **Authentication** | Passport.js + OAuth 2.0 | - | Google authentication |
| **CORS** | cors | 2.8.5 | Cross-origin requests |

### Machine Learning Stack

| Framework | Version | Purpose |
|-----------|---------|---------|
| **PyTorch** | Latest | EfficientNet model inference |
| **TensorFlow** | 2.x | ConvLSTM, LRCN, ViT models |
| **OpenCV** | cv2 | Video processing & frame extraction |
| **NumPy** | Latest | Array operations |
| **SciPy** | Latest | Statistical operations |

---

## Backend Components

### 1. Node.js Express Server (`Backend/`)

The Express server manages user sessions, authentication, and metadata operations.

#### File Structure
```
Backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── Models/
│   └── user.js           # User schema
└── Routes/
    └── userRoutes.js     # User-related routes
```

---

## Node.js Express Server

### `server.js` - Main Server File

**Purpose**: Central hub for the Node.js backend, handling authentication, sessions, and routing.

**Port**: `5000`

#### Key Features

1. **Database Connection**
   - Connects to MongoDB Atlas cluster
   - Database name: `DeepTrace`
   - Connection URI includes retry logic and write concerns

2. **Session Management**
   - Uses `express-session` with MongoDB store
   - Session secret from environment variables
   - Sessions stored in `sessions` collection
   - Cookie configuration:
     - `httpOnly: true` - Prevents XSS attacks
     - `secure: false` - Allows HTTP (set to true in production)
     - `sameSite: 'lax'` - CSRF protection

3. **CORS Configuration**
   - Allows requests from `http://localhost:5173` (frontend)
   - Credentials enabled for cookie-based auth
   - Custom headers for methods: GET, POST, PUT, DELETE

4. **Authentication Flow**
   ```
   User clicks "Sign in with Google"
         ↓
   Redirected to /auth/google
         ↓
   Google OAuth consent screen
         ↓
   Callback to /auth/google/callback
         ↓
   User profile extracted
         ↓
   Check if user exists in DB
         ↓
   If not, create new user
         ↓
   Serialize user to session
         ↓
   Redirect to frontend /home
   ```

#### Environment Variables Required
```env
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Middleware Chain
```javascript
app.use(express.json())                    // Parse JSON bodies
  → session middleware                      // Session management
  → CORS headers                           // Cross-origin config
  → CORS middleware                        // CORS handler
  → passport.initialize()                  // Initialize Passport
  → passport.session()                     // Passport session handling
  → Routes                                 // Application routes
```

#### Passport.js Configuration

**Serialization**:
- Stores only user ID in session (lightweight)
- Called when user logs in

**Deserialization**:
- Retrieves full user object from database using stored ID
- Called on every authenticated request

**Google Strategy**:
- Client ID and Secret from environment
- Callback URL: `/auth/google/callback`
- Scopes requested: `profile`, `email`
- On success: Finds or creates user in database

#### Authentication Middleware

```javascript
function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
```

Used to protect routes that require authentication.

---

### `Models/user.js` - User Schema

**Purpose**: Defines the MongoDB schema for user documents.

#### Schema Structure

```javascript
{
    googleId: {
        type: String,
        required: true,
        unique: true      // Ensures one account per Google ID
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}
```

#### Collection Name
- `users` (auto-pluralized by Mongoose from 'User')

#### Indexes
- Automatically indexed on `googleId` for fast lookups
- `_id` field auto-generated by MongoDB

#### Notes
- No password field (OAuth-only authentication)
- No timestamps (can be added with `{ timestamps: true }`)
- Minimal schema for MVP - can be extended with:
  - `createdAt` / `updatedAt`
  - `role` (admin/user)
  - `videoHistory` (array of analyzed videos)
  - `lastLogin`

---

### `Routes/userRoutes.js` - User Routes

**Purpose**: Handles user-specific API endpoints.

#### Route: `GET /getUserDetails`

**Description**: Returns authenticated user's information.

**Authentication**: Session-based (checks `req.isAuthenticated()`)

**Response**:

Success (200):
```json
{
    "username": "John Doe",
    "email": "john@example.com"
}
```

Not Authenticated:
```json
null
```

**Use Case**: Frontend calls this on page load to check if user is logged in and display user info.

**Flow**:
```
Frontend → GET /getUserDetails
     ↓
Server checks session
     ↓
If authenticated: Extract username, email from req.user
     ↓
Return JSON
```

---

## Machine Learning Models

### Python Flask ML Service (`models/`)

The ML service processes videos using state-of-the-art deepfake detection models.

#### File Structure
```
models/
├── app.py                          # Main Flask server (EfficientNet)
├── EnsembleLearning/
│   └── app.py                      # Ensemble model training
├── ConvLSTM/
│   └── main.py                     # ConvLSTM training
├── LRCN/
│   └── main.py                     # LRCN training
├── VisionTransformer/
│   └── main.py                     # Vision Transformer training
└── icpr2020dfdc/                   # Face extraction utilities
    ├── architectures/
    │   ├── fornet.py               # EfficientNet architectures
    │   ├── weights.py              # Pre-trained weights
    │   └── externals/
    │       └── xception.py         # Xception backbone
    ├── blazeface/
    │   ├── blazeface.py            # Face detection model
    │   ├── face_extract.py         # Face extraction logic
    │   ├── read_video.py           # Video reader
    │   └── blazeface.pth           # Pre-trained weights
    └── isplutils/
        ├── utils.py                # Utility functions
        └── data.py                 # Data processing
```

---

### `models/app.py` - EfficientNet Flask Service

**Purpose**: Main ML inference endpoint using EfficientNet architecture.

**Port**: `8080`

#### Model Configuration

```python
net_model = 'EfficientNetAutoAttB4'
train_db = 'DFDC'
face_policy = 'scale'
face_size = 224
frames_per_video = 100
device = 'cpu'
```

**Available Models**:
- `EfficientNetB4` - Base EfficientNet-B4
- `EfficientNetB4ST` - With spatial transformations
- `EfficientNetAutoAttB4` - With attention mechanism (used)
- `EfficientNetAutoAttB4ST` - Attention + spatial transforms
- `Xception` - Xception backbone

**Training Datasets**:
- `DFDC` - Facebook Deepfake Detection Challenge (used)
- `FFPP` - FaceForensics++

#### Model Loading Process

```python
# 1. Get pre-trained weights URL
model_url = weights.weight_url['{:s}_{:s}'.format(net_model, train_db)]

# 2. Initialize model architecture
net = getattr(fornet, net_model)().eval().to(device)

# 3. Load pre-trained weights
net.load_state_dict(load_url(model_url, map_location=device, check_hash=True))

# 4. Set to evaluation mode
net.eval()
```

#### Face Detection Setup

```python
# BlazeFace detector (Google's lightweight face detector)
facedet = BlazeFace().to(device)
facedet.load_weights("../blazeface/blazeface.pth")
facedet.load_anchors("../blazeface/anchors.npy")
```

**BlazeFace**:
- Lightweight face detection model by Google
- Designed for mobile devices
- Detects faces in real-time
- Provides face bounding boxes and landmarks

#### Endpoint: `POST /upload-video`

**Description**: Analyzes video for deepfake detection.

**Request**:
- Content-Type: `multipart/form-data`
- Fields:
  - `video`: Video file (mp4, avi, etc.)
  - `frames_per_video`: Number of frames to sample (integer)

**Processing Pipeline**:

```
1. Receive video file
    ↓
2. Save temporarily as 'input_video.mp4'
    ↓
3. Extract N frames evenly distributed
    ↓
4. For each frame:
    ├─ Detect faces using BlazeFace
    ├─ Crop face regions
    ├─ Resize to 224x224
    └─ Apply normalization
    ↓
5. Stack frames into tensor [N, 3, 224, 224]
    ↓
6. Feed through EfficientNet
    ↓
7. Get prediction scores (logits)
    ↓
8. Apply sigmoid (expit) to convert to probabilities
    ↓
9. Calculate mean score across all frames
    ↓
10. Delete temporary video file
    ↓
11. Return scores
```

**Response**:

Success (200):
```json
{
    "pred_scores": [0.23, 0.31, 0.19, ...],  // Score per frame
    "mean_score": 0.24                        // Average score
}
```

**Score Interpretation**:
- `0.0 - 0.5`: Likely Real
- `0.5 - 1.0`: Likely Fake
- Threshold: `0.5`

Error (400):
```json
{
    "error": "No video uploaded"
}
```

Error (500):
```json
{
    "error": "Error message details"
}
```

#### Transformations Applied

```python
transf = utils.get_transformer(face_policy, face_size, net.get_normalizer(), train=False)
```

- **Scaling**: Resize to 224x224
- **Normalization**: Mean=[0.485, 0.456, 0.406], Std=[0.229, 0.224, 0.225] (ImageNet stats)
- **Format**: Convert to PyTorch tensor

---

### `models/icpr2020dfdc/architectures/fornet.py` - Model Architectures

**Purpose**: Defines neural network architectures for deepfake detection.

**Source**: Research paper implementation from Politecnico di Milano

#### Base Class: `FeatureExtractor`

Abstract class providing:
- Standard normalization (ImageNet stats)
- Feature extraction interface
- Trainable parameter access

#### Architecture 1: `EfficientNetB4`

```python
class EfficientNetB4(EfficientNetGen):
    def __init__(self):
        super().__init__(model='efficientnet-b4')
```

**Architecture Details**:
- Pre-trained on ImageNet
- Compound scaling (depth, width, resolution)
- Efficient use of parameters
- Output: 1792 feature dimensions

**Forward Pass**:
```
Input [batch, 3, 224, 224]
    ↓
EfficientNet backbone
    ↓
Global average pooling
    ↓
Flatten
    ↓
Dropout
    ↓
Linear classifier (1792 → 1)
    ↓
Output [batch, 1] (fake probability)
```

#### Architecture 2: `EfficientNetAutoAttB4`

**Purpose**: EfficientNet with attention mechanism to focus on manipulation artifacts.

**Key Features**:
1. **Attention Block**: 
   - Inserted at block 9 (56 channels)
   - Generates spatial attention map
   - Highlights regions with manipulation artifacts

2. **Attention Computation**:
```python
# Extract intermediate features
features = efficientnet.blocks[att_block_idx](x)

# Generate attention map
att_map = attconv(features)  # [batch, 1, H, W]
att_map = sigmoid(att_map)   # Normalize to [0, 1]

# Apply attention
attended_features = features * att_map
```

3. **Attention Width**:
   - Width 0: Single 1x1 convolution
   - Width > 0: Multiple 3x3 convolutions with ReLU

**Benefits**:
- Focuses on tampering regions
- Improves interpretability
- Better generalization to unseen manipulations

#### Architecture 3: `Xception`

**Purpose**: Alternative backbone using depthwise separable convolutions.

**Key Features**:
- 71 layers deep
- Efficient parameter usage
- Strong performance on manipulation detection

---

### `models/icpr2020dfdc/blazeface/face_extract.py` - Face Extraction

**Purpose**: Extract and preprocess faces from video frames.

#### Class: `FaceExtractor`

**Initialization**:
```python
def __init__(self, video_read_fn=None, facedet=None):
    self.video_read_fn = video_read_fn  # Custom video reader
    self.facedet = facedet              # BlazeFace detector
```

#### Method: `process_image()`

**Purpose**: Extract faces from a single image.

**Process**:
```
1. Load image (from path or array)
    ↓
2. Tile image into 128x128 patches
    ↓
3. Run BlazeFace on each tile
    ↓
4. Resize detections back to original scale
    ↓
5. Combine detections from all tiles
    ↓
6. Apply Non-Maximum Suppression (NMS)
    ↓
7. Add margin around face bounding boxes (20%)
    ↓
8. Crop faces from original image
    ↓
9. Return faces + metadata
```

**Output Format**:
```python
{
    "frame_w": 1920,
    "frame_h": 1080,
    "faces": [np.array(...), ...],      # Cropped face images
    "scores": [0.99, 0.97, ...],        # Detection confidence
    "boxes": [[x1, y1, x2, y2], ...]    # Bounding boxes
}
```

#### Method: `process_video()`

**Purpose**: Extract faces from all frames in a video.

**Process**:
```
1. Read video using video_read_fn
    ↓
2. For each frame:
    ├─ Tile into patches
    ├─ Detect faces
    ├─ Apply NMS
    └─ Crop faces
    ↓
3. Track face IDs across frames
    ↓
4. Return list of frame dictionaries
```

**Face Tracking**:
- Uses IoU (Intersection over Union) to match faces across frames
- Maintains consistent face IDs throughout video

---

### `models/ConvLSTM/main.py` - ConvLSTM Model

**Purpose**: Train a Convolutional LSTM model for spatiotemporal deepfake detection.

#### Model Architecture

```python
def create_convlstm_model():
    model = Sequential([
        # Layer 1: ConvLSTM2D
        ConvLSTM2D(filters=4, kernel_size=(3,3), activation='tanh',
                   return_sequences=True, input_shape=(80, 64, 64, 3)),
        MaxPooling3D(pool_size=(1, 2, 2)),
        TimeDistributed(Dropout(0.2)),
        
        # Layer 2: ConvLSTM2D
        ConvLSTM2D(filters=8, kernel_size=(3,3), activation='tanh',
                   return_sequences=True),
        MaxPooling3D(pool_size=(1, 2, 2)),
        TimeDistributed(Dropout(0.2)),
        
        # Layer 3: ConvLSTM2D
        ConvLSTM2D(filters=14, kernel_size=(3,3), activation='tanh',
                   return_sequences=True),
        MaxPooling3D(pool_size=(1, 2, 2)),
        TimeDistributed(Dropout(0.2)),
        
        # Layer 4: ConvLSTM2D
        ConvLSTM2D(filters=16, kernel_size=(3,3), activation='tanh',
                   return_sequences=True),
        MaxPooling3D(pool_size=(1, 2, 2)),
        
        # Classification
        Flatten(),
        Dense(2, activation='softmax')
    ])
```

**Input Shape**: `(batch, 80, 64, 64, 3)`
- 80 frames per video
- 64x64 frame resolution
- 3 color channels

**Output**: `(batch, 2)` - [Real probability, Fake probability]

#### Why ConvLSTM?

1. **Spatial Processing**: CNN component extracts spatial features
2. **Temporal Processing**: LSTM component captures temporal inconsistencies
3. **Combined**: Detects both spatial artifacts and temporal anomalies

**Temporal Artifacts**:
- Inconsistent lighting across frames
- Unnatural facial movements
- Temporal jitter in facial features

#### Hyperparameters

```python
IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64
SEQUENCE_LENGTH = 80
BATCH_SIZE = 4
EPOCHS = 50
```

#### Training Configuration

```python
optimizer = 'adam'
loss = 'categorical_crossentropy'
metrics = ['accuracy']
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)
```

#### Frame Extraction

```python
def frames_extractor(video_path):
    # 1. Open video
    video_reader = cv2.VideoCapture(video_path)
    
    # 2. Get total frames
    total_frames = int(video_reader.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # 3. Calculate skip interval
    skip = max(total_frames // SEQUENCE_LENGTH, 1)
    
    # 4. Extract evenly spaced frames
    for i in range(SEQUENCE_LENGTH):
        video_reader.set(cv2.CAP_PROP_POS_FRAMES, i * skip)
        success, frame = video_reader.read()
        
        # 5. Resize and normalize
        resized = cv2.resize(frame, (64, 64))
        normalized = resized / 255.0
        frames_list.append(normalized)
    
    return frames_list
```

**Normalization**: Divides by 255 to scale pixels to [0, 1]

#### Dataset Structure

```
Celeb-DF-v2/
├── RealVid/
│   ├── video1.mp4
│   ├── video2.mp4
│   └── ...
└── SyntheticVid/
    ├── fake1.mp4
    ├── fake2.mp4
    └── ...
```

---

### `models/LRCN/main.py` - LRCN Model

**Purpose**: Long-term Recurrent Convolutional Network for video classification.

#### Model Architecture

```python
def create_LRCN_model():
    model = Sequential([
        # CNN Branch 1
        TimeDistributed(Conv2D(16, (3,3), activation='relu', padding='same'),
                       input_shape=(40, 64, 64, 3)),
        TimeDistributed(MaxPooling2D(4, 4)),
        TimeDistributed(Dropout(0.25)),
        
        # CNN Branch 2
        TimeDistributed(Conv2D(32, (3,3), activation='relu', padding='same')),
        TimeDistributed(MaxPooling2D(4, 4)),
        TimeDistributed(Dropout(0.25)),
        
        # CNN Branch 3
        TimeDistributed(Conv2D(64, (3,3), activation='relu', padding='same')),
        TimeDistributed(MaxPooling2D(2, 2)),
        TimeDistributed(Dropout(0.25)),
        
        # CNN Branch 4
        TimeDistributed(Conv2D(64, (3,3), activation='relu', padding='same')),
        TimeDistributed(MaxPooling2D(2, 2)),
        
        # LSTM Layer
        TimeDistributed(Flatten()),
        LSTM(32),
        
        # Classification
        Dense(2, activation='softmax')
    ])
```

**Input Shape**: `(batch, 40, 64, 64, 3)`
- 40 frames per video
- 64x64 resolution
- 3 channels

**Output**: `(batch, 2)` - [Real, Fake]

#### Architecture Explanation

**TimeDistributed Wrapper**:
- Applies the same CNN to each frame independently
- Shares weights across all frames
- Extracts spatial features per frame

**Flow**:
```
Frame 1 ─┐
Frame 2 ─┤
Frame 3 ─┼─> CNN (shared weights) ─> Feature vectors ─> LSTM ─> Classification
  ...    │
Frame 40─┘
```

**LSTM Component**:
- Receives sequence of CNN feature vectors
- Learns temporal dependencies
- Captures motion patterns and inconsistencies

#### Hyperparameters

```python
IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64
SEQUENCE_LENGTH = 40  # Shorter than ConvLSTM
BATCH_SIZE = 4
EPOCHS = 100
VALIDATION_SPLIT = 0.2
```

#### Training Configuration

```python
optimizer = 'adam'
loss = 'categorical_crossentropy'
metrics = ['accuracy']
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=15,  # More patience than ConvLSTM
    restore_best_weights=True
)
```

---

### `models/VisionTransformer/main.py` - Vision Transformer

**Purpose**: Transformer-based architecture for video deepfake detection.

#### Model Architecture

```python
def create_video_classification_model(sequence_length):
    inputs = Input(shape=(sequence_length, 64, 64, 3))
    
    # Apply ViT to each frame
    x = TimeDistributed(vit_model)(inputs)
    x = TimeDistributed(Flatten())(x)
    
    # LSTM for temporal modeling
    x = LSTM(128, return_sequences=False)(x)
    x = BatchNormalization()(x)
    
    # Dense layers
    x = Dense(128, activation=gelu)(x)
    x = BatchNormalization()(x)
    x = Dense(64, activation=gelu)(x)
    x = Dense(32, activation=gelu)(x)
    
    # Output
    outputs = Dense(2, activation='softmax')(x)
    
    return Model(inputs, outputs)
```

#### ViT Configuration

```python
vit_model = vit.vit_b16(
    image_size=64,
    activation='softmax',
    pretrained=True,          # Uses ImageNet pre-trained weights
    include_top=False,        # Remove classification head
    pretrained_top=False,
    classes=2
)
```

**ViT-B16**:
- Patch size: 16x16
- 12 transformer layers
- 768 hidden dimensions
- 12 attention heads

#### How Vision Transformers Work

```
1. Split image into patches (16x16)
    ↓
2. Flatten patches to 1D vectors
    ↓
3. Add positional embeddings
    ↓
4. Pass through transformer encoder
    ↓
5. Extract [CLS] token representation
    ↓
6. Feed to classification head
```

**Advantages over CNNs**:
- Global receptive field from first layer
- Better at capturing long-range dependencies
- Strong transfer learning from ImageNet

#### Temporal Processing

```
Frame 1 ─┐
Frame 2 ─┤
Frame 3 ─┼─> ViT ─> Embeddings ─> LSTM ─> Dense Layers ─> Classification
  ...    │
Frame 80─┘
```

**LSTM Role**:
- Aggregates ViT embeddings across time
- Learns temporal patterns in latent space

#### Training Configuration

```python
optimizer = 'adam'
loss = 'binary_crossentropy'
metrics = ['accuracy']
batch_size = 32  # Larger than LRCN/ConvLSTM
epochs = 10      # Faster convergence due to pre-training
```

#### Hyperparameters

```python
IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64
SEQUENCE_LENGTH = 80
BATCH_SIZE = 32
```

---

### `models/EnsembleLearning/app.py` - Ensemble Model

**Purpose**: Combine multiple LRCN models for improved accuracy.

#### Ensemble Architecture

```python
# Load two identical LRCN models
model1 = tf.keras.models.load_model("LRCN_DF_40SL_100ep_2.h5")
model2 = tf.keras.models.load_model("LRCN_DF_40SL_100ep_2.h5")

# Extract features (remove classification head)
model1_features = Model(inputs=model1.input, outputs=model1.layers[-2].output)
model2_features = Model(inputs=model2.input, outputs=model2.layers[-2].output)

# Create ensemble
input_layer = Input(shape=(40, 64, 64, 3))
features1 = model1_features(input_layer)
features2 = model2_features(input_layer)

# Concatenate features
concatenated = Concatenate(axis=-1)([features1, features2])

# Small CNN on concatenated features
x = Conv2D(64, (3, 3), activation='relu')(concatenated)
x = MaxPooling2D(pool_size=(2, 2))(x)
x = Flatten()(x)

# Output
output = Dense(2, activation='softmax')(x)
```

#### Ensemble Strategy

**Feature-Level Fusion**:
1. Extract high-level features from each model
2. Concatenate features
3. Train small network on concatenated features

**Benefits**:
- Combines strengths of multiple models
- Reduces overfitting through diversity
- Improves generalization

**Alternative Ensemble Methods** (not implemented):
- **Score-Level Fusion**: Average predictions
- **Decision-Level Fusion**: Majority voting
- **Stacking**: Train meta-learner on predictions

#### Training Process

```python
# Data generator for batches
def data_generator(video_paths, labels, batch_size=16):
    while True:
        for i in range(0, len(video_paths), batch_size):
            batch_videos = video_paths[i:i + batch_size]
            batch_labels = labels[i:i + batch_size]
            
            X = [preprocess_video(v) for v in batch_videos]
            y = to_categorical(batch_labels, num_classes=2)
            
            yield np.array(X), y

# Training
ensemble_model.fit(
    train_gen,
    steps_per_epoch=len(video_paths) // 16,
    epochs=10
)
```

---

## Database Schema

### MongoDB Atlas Configuration

**Cluster**: `DeepTrace`
**Connection URI**: `mongodb+srv://bindrakartik64:***@deeptrace.km0n1.mongodb.net/`

### Collections

#### 1. `users` Collection

**Purpose**: Store user accounts

```javascript
{
    _id: ObjectId("..."),           // Auto-generated
    googleId: "1234567890",         // Google OAuth ID
    username: "John Doe",           // Display name from Google
    email: "john@example.com",      // Email from Google profile
    __v: 0                          // Version key (Mongoose)
}
```

**Indexes**:
- `_id`: Primary key (auto-indexed)
- `googleId`: Unique index for fast lookups

**Relationships**: None (no video history stored yet)

#### 2. `sessions` Collection

**Purpose**: Store user sessions (managed by `connect-mongo`)

```javascript
{
    _id: "session_id_string",
    expires: ISODate("2024-11-17T00:00:00Z"),
    session: {
        cookie: {
            originalMaxAge: null,
            expires: null,
            httpOnly: true,
            path: "/"
        },
        passport: {
            user: "user_id_string"  // References users._id
        }
    }
}
```

**TTL Index**: Automatically removes expired sessions

---

## API Endpoints

### Node.js Express Server (Port 5000)

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/google` | Redirect to Google OAuth | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |
| GET | `/logout` | Logout and destroy session | Yes |
| GET | `/home` | Protected home route | Yes |

#### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/getUserDetails` | Get current user info | Yes |

#### Metadata Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/metadata-update` | Update video metadata with ExifTool | No |

**Request Body**:
```json
{
    "filename": "video.mp4",
    "result": "REAL",
    "accuracy": "87.5"
}
```

**Process**:
```
1. Receive filename, result, accuracy
    ↓
2. Construct ExifTool command
    ↓
3. Execute: exiftool -Title="..." -Description="..." filename
    ↓
4. Return success/error
```

---

### Python Flask ML Service (Port 8080)

| Method | Endpoint | Description | Returns |
|--------|----------|-------------|---------|
| POST | `/upload-video` | Analyze video for deepfakes | Prediction scores |

---

## Data Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. User visits frontend                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │  GET /getUserDetails   │
                │  (Check if logged in)  │
                └───────────┬────────────┘
                            │
                  ┌─────────┴──────────┐
                  │                    │
                  ▼                    ▼
            Not Logged In         Logged In
                  │                    │
                  ▼                    ▼
     ┌─────────────────────┐   ┌──────────────────┐
     │ Show Login Button   │   │  Show Dashboard   │
     └──────────┬──────────┘   └──────────────────┘
                │
                ▼
     ┌────────────────────────┐
     │ Click "Sign in with    │
     │      Google"           │
     └──────────┬─────────────┘
                │
                ▼
     ┌────────────────────────┐
     │  GET /auth/google      │
     │  (Redirect to Google)  │
     └──────────┬─────────────┘
                │
                ▼
     ┌────────────────────────┐
     │  Google OAuth Consent  │
     │      Screen            │
     └──────────┬─────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │ GET /auth/google/callback  │
     │ (Process OAuth response)   │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │  Find/Create User in DB    │
     │  Create Session            │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │  Redirect to /home         │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │  User uploads video        │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │ POST /upload-video         │
     │ (To Flask ML Service)      │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │ ML Processing Pipeline     │
     │ 1. Extract frames          │
     │ 2. Detect faces            │
     │ 3. Run EfficientNet        │
     │ 4. Calculate scores        │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │ Return prediction scores   │
     └──────────┬─────────────────┘
                │
                ▼
     ┌────────────────────────────┐
     │ Frontend displays result   │
     │ - Real/Fake label          │
     │ - Confidence score         │
     │ - Frame-by-frame graph     │
     └────────────────────────────┘
```

### Video Processing Pipeline

```
┌──────────────────┐
│  Upload Video    │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ Flask receives video file   │
│ Save as 'input_video.mp4'   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ VideoReader extracts frames │
│ - Read video with OpenCV    │
│ - Extract 100 frames        │
│ - Evenly distributed        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ FaceExtractor processes     │
│ each frame:                 │
│ 1. Tile frame into patches  │
│ 2. Run BlazeFace detector   │
│ 3. Resize detections        │
│ 4. Combine from all tiles   │
│ 5. Apply NMS                │
│ 6. Crop face regions        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Transform faces:            │
│ - Resize to 224x224         │
│ - Normalize (ImageNet)      │
│ - Convert to tensor         │
│ - Stack: [N, 3, 224, 224]  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ EfficientNet Inference:     │
│ 1. Extract features         │
│ 2. Pass through classifier  │
│ 3. Get logits               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Post-processing:            │
│ - Apply sigmoid (expit)     │
│ - Convert to probabilities  │
│ - Calculate mean score      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Cleanup & Return:           │
│ - Delete temporary file     │
│ - Return scores as JSON     │
└─────────────────────────────┘
```

---

## Dependencies

### Node.js Backend Dependencies (`Backend/package.json`)

```json
{
  "dependencies": {
    "connect-mongo": "^5.1.0",    // MongoDB session store
    "cors": "^2.8.5",             // Cross-Origin Resource Sharing
    "express": "^4.21.0",         // Web framework
    "mongodb": "^6.9.0",          // MongoDB driver
    "mongoose": "^8.6.2",         // MongoDB ODM
    "nodemon": "^3.1.5"           // Development auto-reload
  }
}
```

#### Additional Dependencies (installed but not in package.json)

- `express-session` - Session management
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `dotenv` - Environment variable management

### Python ML Dependencies

#### Core ML Frameworks

```
torch                    # PyTorch for EfficientNet
tensorflow               # TensorFlow for LRCN/ConvLSTM/ViT
tensorflow-addons        # Additional TF ops (GELU activation)
efficientnet-pytorch     # Pre-trained EfficientNet models
keras-vit                # Vision Transformer implementation
```

#### Computer Vision

```
opencv-python (cv2)      # Video processing, frame extraction
PIL (Pillow)            # Image processing
```

#### Web Framework

```
flask                    # Web server
flask-cors              # CORS support
```

#### Scientific Computing

```
numpy                    # Array operations
scipy                    # Scientific functions (expit/sigmoid)
matplotlib              # Plotting (for training scripts)
```

#### Machine Learning Utils

```
scikit-learn            # train_test_split, metrics
```

---

## Security Considerations

### Current Implementation

1. **Authentication**
   - OAuth 2.0 via Google
   - No password storage
   - Session-based authentication

2. **Session Security**
   - httpOnly cookies (prevents XSS)
   - sameSite: 'lax' (CSRF protection)
   - Session secret from environment
   - Sessions stored in database (not memory)

3. **CORS**
   - Restricted to localhost:5173
   - Credentials enabled for cookies

### Production Recommendations

1. **HTTPS**
   - Set `cookie.secure: true`
   - Use SSL certificates
   - Force HTTPS redirect

2. **Environment Variables**
   - Move MongoDB URI to .env
   - Rotate secrets regularly
   - Use secret management service (AWS Secrets Manager, etc.)

3. **Rate Limiting**
   - Add express-rate-limit
   - Prevent brute force attacks
   - Limit video uploads per user

4. **Input Validation**
   - Validate video file types
   - Check file size limits
   - Sanitize filenames

5. **Error Handling**
   - Don't expose stack traces in production
   - Generic error messages
   - Proper logging

6. **Database Security**
   - Use separate DB users with minimal permissions
   - Enable MongoDB authentication
   - Regular backups
   - Encrypt data at rest

---

## Scalability Considerations

### Current Limitations

1. **Video Processing**
   - Synchronous processing blocks request
   - No queue system
   - Single worker

2. **File Storage**
   - Temporary files on local disk
   - No cloud storage integration
   - No CDN for video delivery

3. **ML Inference**
   - CPU-only inference (slow)
   - No model caching
   - No batch processing

### Recommended Improvements

1. **Asynchronous Processing**
```
User uploads video
    ↓
Store in S3/Cloud Storage
    ↓
Add job to Redis Queue
    ↓
Return job ID to user
    ↓
Worker processes video asynchronously
    ↓
Update job status in DB
    ↓
User polls for completion
```

2. **Distributed System**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Load        │────▶│  Express     │────▶│  Redis       │
│  Balancer    │     │  Instances   │     │  Queue       │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  ML Worker   │
                                          │  (GPU)       │
                                          └──────────────┘
```

3. **Caching**
   - Redis cache for user sessions
   - Model result caching (hash-based)
   - CDN for static assets

4. **GPU Acceleration**
   - Deploy on GPU instances
   - Use NVIDIA TensorRT for optimization
   - Batch multiple requests

5. **Monitoring**
   - Prometheus + Grafana
   - Log aggregation (ELK stack)
   - Error tracking (Sentry)

---

## Model Performance Comparison

| Model | Params | Input Size | FPS | Accuracy (Est.) | Use Case |
|-------|--------|------------|-----|-----------------|----------|
| **EfficientNet-B4** | 19M | 224x224x3 | ~10 | High | Production (fast) |
| **ConvLSTM** | ~200K | 80x64x64x3 | ~5 | Medium | Temporal analysis |
| **LRCN** | ~150K | 40x64x64x3 | ~8 | Medium-High | Balanced |
| **ViT** | 86M | 80x64x64x3 | ~3 | High | Research |
| **Ensemble** | ~300K | 40x64x64x3 | ~4 | Highest | Best accuracy |

**Notes**:
- FPS: Frames processed per second (CPU inference)
- Accuracy: Relative comparison
- Use Case: Recommended deployment scenario

---

## Future Enhancements

### Backend Improvements

1. **Video History**
   - Store analyzed videos per user
   - Track accuracy over time
   - Export reports (PDF/CSV)

2. **Batch Processing**
   - Upload multiple videos
   - Process in parallel
   - Download results as ZIP

3. **Webhook Notifications**
   - Email when processing complete
   - Slack/Discord integration
   - SMS alerts

4. **API Keys**
   - Allow programmatic access
   - Rate limiting per key
   - Usage analytics

### ML Enhancements

1. **Model Ensemble in Production**
   - Combine multiple models
   - Weighted voting
   - Confidence calibration

2. **Explainability**
   - Grad-CAM visualizations
   - Highlight manipulated regions
   - Frame-level annotations

3. **Additional Models**
   - Face X-ray
   - Capsule Networks
   - Frequency analysis

4. **Fine-tuning**
   - Train on custom datasets
   - Domain adaptation
   - Active learning

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongoServerError: Authentication failed`

**Solution**:
- Check MongoDB URI credentials
- Whitelist IP in MongoDB Atlas
- Verify network connectivity

#### 2. CORS Errors

**Error**: `Access-Control-Allow-Origin header is missing`

**Solution**:
- Verify frontend URL in CORS config
- Check credentials: true is set
- Ensure both origin and credentials match

#### 3. Session Not Persisting

**Error**: User logged out after refresh

**Solution**:
- Check cookie settings (httpOnly, sameSite)
- Verify session store is MongoDB (not memory)
- Check session secret is set

#### 4. ML Model Not Loading

**Error**: `FileNotFoundError: blazeface.pth`

**Solution**:
- Verify model weights are downloaded
- Check file paths are correct
- Run from correct directory

#### 5. Video Processing Timeout

**Error**: Request timeout

**Solution**:
- Reduce frames_per_video parameter
- Use smaller resolution video
- Increase server timeout
- Consider async processing

---

## Conclusion

DeepTrace's backend architecture is a robust, multi-layered system combining:

1. **Node.js Express Server**: Handles authentication, sessions, and metadata
2. **Python Flask ML Service**: Processes videos using state-of-the-art deepfake detection models
3. **MongoDB Atlas**: Stores user data and sessions
4. **Multiple ML Models**: EfficientNet, ConvLSTM, LRCN, ViT for comprehensive detection

The system is designed for:
- **Accuracy**: Multiple model approaches
- **Security**: OAuth 2.0 authentication
- **Scalability**: Modular architecture ready for distributed deployment
- **Maintainability**: Clear separation of concerns

### Key Strengths

✅ Multiple ML models for diverse detection strategies
✅ Secure authentication with Google OAuth
✅ Session persistence with MongoDB
✅ Face detection with BlazeFace
✅ Attention mechanisms for interpretability

### Areas for Improvement

🔧 Asynchronous video processing
🔧 GPU acceleration for ML inference
🔧 Cloud storage integration
🔧 Comprehensive logging and monitoring
🔧 Rate limiting and input validation

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024
**Author**: AI Code Assistant
**Project**: DeepTrace - Deepfake Detection System

