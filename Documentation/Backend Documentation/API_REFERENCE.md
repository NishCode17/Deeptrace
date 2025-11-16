# DeepTrace API Reference

## Table of Contents
1. [Base URLs](#base-urls)
2. [Authentication](#authentication)
3. [Node.js Express API](#nodejs-express-api)
4. [Python Flask ML API](#python-flask-ml-api)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Code Examples](#code-examples)

---

## Base URLs

| Service | URL | Port |
|---------|-----|------|
| **Express Server** | `http://localhost:5000` | 5000 |
| **Flask ML Service** | `http://localhost:8080` | 8080 |
| **Frontend** | `http://localhost:5173` | 5173 |

---

## Authentication

### Session-Based Authentication

DeepTrace uses session-based authentication with Google OAuth 2.0.

**Flow**:
1. User clicks "Sign in with Google"
2. Redirected to `/auth/google`
3. Google OAuth consent screen
4. Callback to `/auth/google/callback`
5. Session created and stored in MongoDB
6. Session cookie sent to client

**Session Cookie**:
```
Name: connect.sid
HttpOnly: true
Secure: false (true in production)
SameSite: lax
Path: /
```

**Checking Authentication Status**:
```javascript
// Frontend code
fetch('http://localhost:5000/getUserDetails', {
    credentials: 'include'  // Important: Send cookies
})
.then(res => res.json())
.then(data => {
    if (data === null) {
        // User not authenticated
    } else {
        // User authenticated
        console.log(data.username, data.email);
    }
});
```

---

## Node.js Express API

Base URL: `http://localhost:5000`

### Authentication Endpoints

#### 1. Initiate Google OAuth

```
GET /auth/google
```

**Description**: Redirects user to Google OAuth consent screen.

**Parameters**: None

**Response**: HTTP 302 Redirect to Google

**Example**:
```html
<a href="http://localhost:5000/auth/google">
    Sign in with Google
</a>
```

---

#### 2. Google OAuth Callback

```
GET /auth/google/callback
```

**Description**: Handles Google OAuth callback and creates user session.

**Parameters**: 
- `code` (query): Authorization code from Google
- `state` (query): CSRF token

**Response**: HTTP 302 Redirect
- Success: `http://localhost:5173/home`
- Failure: `http://localhost:5173/login`

**Note**: This endpoint is called automatically by Google. Don't call directly.

---

#### 3. Get User Details

```
GET /getUserDetails
```

**Description**: Returns authenticated user's information.

**Authentication**: Required

**Headers**:
```
Cookie: connect.sid=<session_id>
```

**Response**:

Success (200):
```json
{
    "username": "John Doe",
    "email": "john.doe@example.com"
}
```

Not Authenticated (200):
```json
null
```

**JavaScript Example**:
```javascript
fetch('http://localhost:5000/getUserDetails', {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    if (data) {
        console.log(`Welcome, ${data.username}!`);
    } else {
        console.log('Not logged in');
    }
})
.catch(error => console.error('Error:', error));
```

---

#### 4. Logout

```
GET /logout
```

**Description**: Destroys user session and logs out.

**Authentication**: Required

**Response**: HTTP 302 Redirect to `http://localhost:5173/`

**JavaScript Example**:
```javascript
// Simple redirect
window.location.href = 'http://localhost:5000/logout';

// Or with fetch
fetch('http://localhost:5000/logout', {
    credentials: 'include'
})
.then(() => {
    window.location.href = '/';
});
```

---

#### 5. Protected Home Route

```
GET /home
```

**Description**: Example protected route.

**Authentication**: Required

**Response**:

Success (200):
```
Welcome to DeepTrace
```

Unauthorized (302):
Redirect to `/login`

---

### Metadata Endpoint

#### Update Video Metadata

```
POST /metadata-update
```

**Description**: Updates video file metadata using ExifTool.

**Authentication**: Not required (but should be added)

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
    "filename": "video.mp4",
    "result": "REAL",
    "accuracy": "87.5"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | Path to video file |
| `result` | string | Yes | Detection result (REAL/FAKE) |
| `accuracy` | string | Yes | Confidence percentage |

**Response**:

Success (200):
```
Metadata updated successfully! Output: ...
```

Error (500):
```
Error executing ExifTool
```

**JavaScript Example**:
```javascript
fetch('http://localhost:5000/metadata-update', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        filename: 'video.mp4',
        result: 'FAKE',
        accuracy: '92.3'
    })
})
.then(response => response.text())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/metadata-update \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "video.mp4",
    "result": "FAKE",
    "accuracy": "92.3"
  }'
```

---

## Python Flask ML API

Base URL: `http://localhost:8080`

### Video Analysis Endpoint

#### Upload and Analyze Video

```
POST /upload-video
```

**Description**: Analyzes video for deepfake detection using EfficientNet model.

**Authentication**: Not required

**Headers**:
```
Content-Type: multipart/form-data
```

**Request Body (Form Data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | file | Yes | Video file (mp4, avi, mov, etc.) |
| `frames_per_video` | integer | Yes | Number of frames to analyze (recommended: 100) |

**Response**:

Success (200):
```json
{
    "pred_scores": [
        0.23,
        0.31,
        0.19,
        0.45,
        0.28,
        ...
    ],
    "mean_score": 0.292
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `pred_scores` | array | Prediction score for each frame (0-1) |
| `mean_score` | float | Average score across all frames (0-1) |

**Score Interpretation**:
- `0.0 - 0.5`: Likely REAL
- `0.5 - 1.0`: Likely FAKE
- Threshold: `0.5`

**Accuracy Calculation**:
```javascript
const accuracy = mean_score < 0.5 
    ? (1 - mean_score) * 100  // Real
    : mean_score * 100;        // Fake
    
const label = mean_score < 0.5 ? 'REAL' : 'FAKE';
```

Error (400):
```json
{
    "error": "No video uploaded"
}
```

Error (400):
```json
{
    "error": "frames_per_video parameter missing"
}
```

Error (500):
```json
{
    "error": "Error message with details"
}
```

**JavaScript Example**:
```javascript
const formData = new FormData();
formData.append('video', videoFile);  // File object from input
formData.append('frames_per_video', '100');

fetch('http://localhost:8080/upload-video', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    const meanScore = data.mean_score;
    const label = meanScore < 0.5 ? 'REAL' : 'FAKE';
    const accuracy = meanScore < 0.5 
        ? (1 - meanScore) * 100 
        : meanScore * 100;
    
    console.log(`Result: ${label} (${accuracy.toFixed(2)}% confidence)`);
    console.log(`Frame scores:`, data.pred_scores);
})
.catch(error => console.error('Error:', error));
```

**React Example**:
```javascript
import React, { useState } from 'react';

function VideoUpload() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('frames_per_video', '100');

        try {
            const response = await fetch('http://localhost:8080/upload-video', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            const meanScore = data.mean_score;
            const label = meanScore < 0.5 ? 'REAL' : 'FAKE';
            const accuracy = meanScore < 0.5 
                ? (1 - meanScore) * 100 
                : meanScore * 100;
            
            setResult({ label, accuracy, scores: data.pred_scores });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleUpload} />
            {loading && <p>Analyzing video...</p>}
            {result && (
                <div>
                    <h3>Result: {result.label}</h3>
                    <p>Confidence: {result.accuracy.toFixed(2)}%</p>
                </div>
            )}
        </div>
    );
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/upload-video \
  -F "video=@/path/to/video.mp4" \
  -F "frames_per_video=100"
```

**Python Example**:
```python
import requests

url = 'http://localhost:8080/upload-video'
files = {'video': open('video.mp4', 'rb')}
data = {'frames_per_video': '100'}

response = requests.post(url, files=files, data=data)
result = response.json()

mean_score = result['mean_score']
label = 'REAL' if mean_score < 0.5 else 'FAKE'
accuracy = (1 - mean_score) * 100 if mean_score < 0.5 else mean_score * 100

print(f"Result: {label} ({accuracy:.2f}% confidence)")
print(f"Frame scores: {result['pred_scores']}")
```

---

## Error Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 302 | Found | Redirect (authentication) |
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Endpoint not found |
| 500 | Internal Server Error | Server error |

### Application Error Codes

#### Express Server Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `MongoServerError` | Database connection failed | Check MongoDB URI, network, credentials |
| `Session not found` | Session expired or invalid | Re-authenticate user |
| `ExifTool error` | ExifTool execution failed | Verify ExifTool is installed and path is correct |

#### Flask ML Service Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No video uploaded` | Video file missing from request | Include video file in form data |
| `frames_per_video parameter missing` | Parameter not provided | Add frames_per_video to form data |
| `Error opening video` | Video file corrupted or unsupported | Use valid video format (mp4, avi, mov) |
| `No faces detected` | Video contains no faces | Ensure video contains visible faces |
| `Out of memory` | Video too large | Reduce frames_per_video or video resolution |

---

## Rate Limiting

### Current Implementation

❌ **Not implemented**

### Recommended Implementation

```javascript
const rateLimit = require('express-rate-limit');

// API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Video upload rate limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 10,                    // Limit each IP to 10 uploads per hour
    message: 'Too many uploads, please try again later.'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.post('/upload-video', uploadLimiter, (req, res) => { ... });
```

---

## Code Examples

### Complete Frontend Integration

```javascript
// auth.js
class AuthService {
    async checkAuth() {
        try {
            const response = await fetch('http://localhost:5000/getUserDetails', {
                credentials: 'include'
            });
            const data = await response.json();
            return data;  // null if not authenticated
        } catch (error) {
            console.error('Auth check failed:', error);
            return null;
        }
    }

    login() {
        window.location.href = 'http://localhost:5000/auth/google';
    }

    async logout() {
        try {
            await fetch('http://localhost:5000/logout', {
                credentials: 'include'
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

// video-analyzer.js
class VideoAnalyzer {
    async analyzeVideo(videoFile, framesPerVideo = 100) {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('frames_per_video', framesPerVideo);

        try {
            const response = await fetch('http://localhost:8080/upload-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.processResult(data);
        } catch (error) {
            console.error('Video analysis failed:', error);
            throw error;
        }
    }

    processResult(data) {
        const meanScore = data.mean_score;
        const label = meanScore < 0.5 ? 'REAL' : 'FAKE';
        const confidence = meanScore < 0.5 
            ? (1 - meanScore) * 100 
            : meanScore * 100;

        return {
            label,
            confidence: confidence.toFixed(2),
            meanScore,
            frameScores: data.pred_scores,
            totalFrames: data.pred_scores.length
        };
    }
}

// Usage in React
import React, { useState, useEffect } from 'react';

function App() {
    const [user, setUser] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const authService = new AuthService();
    const analyzer = new VideoAnalyzer();

    useEffect(() => {
        // Check authentication on mount
        authService.checkAuth().then(setUser);
    }, []);

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const result = await analyzer.analyzeVideo(file);
            setResult(result);
        } catch (error) {
            alert('Error analyzing video: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <button onClick={() => authService.login()}>
                Sign in with Google
            </button>
        );
    }

    return (
        <div>
            <h1>Welcome, {user.username}!</h1>
            <button onClick={() => authService.logout()}>Logout</button>

            <input 
                type="file" 
                accept="video/*" 
                onChange={handleVideoUpload}
                disabled={loading}
            />

            {loading && <p>Analyzing video...</p>}

            {result && (
                <div>
                    <h2>Result: {result.label}</h2>
                    <p>Confidence: {result.confidence}%</p>
                    <p>Analyzed {result.totalFrames} frames</p>
                </div>
            )}
        </div>
    );
}
```

---

## Testing

### Postman Collection

```json
{
    "info": {
        "name": "DeepTrace API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Get User Details",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "http://localhost:5000/getUserDetails",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "5000",
                    "path": ["getUserDetails"]
                }
            }
        },
        {
            "name": "Upload Video",
            "request": {
                "method": "POST",
                "header": [],
                "body": {
                    "mode": "formdata",
                    "formdata": [
                        {
                            "key": "video",
                            "type": "file",
                            "src": "/path/to/video.mp4"
                        },
                        {
                            "key": "frames_per_video",
                            "value": "100",
                            "type": "text"
                        }
                    ]
                },
                "url": {
                    "raw": "http://localhost:8080/upload-video",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8080",
                    "path": ["upload-video"]
                }
            }
        }
    ]
}
```

### Test with cURL

```bash
# Test authentication (will fail without browser session)
curl -v http://localhost:5000/getUserDetails

# Test video upload
curl -X POST http://localhost:8080/upload-video \
  -F "video=@sample_video.mp4" \
  -F "frames_per_video=50" \
  | jq '.'  # Pretty print JSON

# Test metadata update
curl -X POST http://localhost:5000/metadata-update \
  -H "Content-Type: application/json" \
  -d '{"filename":"video.mp4","result":"FAKE","accuracy":"95.2"}' \
  | cat
```

---

## Best Practices

### Frontend

1. **Always use credentials: 'include'**
   ```javascript
   fetch(url, { credentials: 'include' })
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
       const response = await fetch(url);
       if (!response.ok) throw new Error('Request failed');
       const data = await response.json();
   } catch (error) {
       console.error('Error:', error);
       // Show user-friendly message
   }
   ```

3. **Show loading states**
   ```javascript
   setLoading(true);
   try {
       await apiCall();
   } finally {
       setLoading(false);
   }
   ```

4. **Validate files before upload**
   ```javascript
   const MAX_FILE_SIZE = 100 * 1024 * 1024;  // 100MB
   if (file.size > MAX_FILE_SIZE) {
       alert('File too large');
       return;
   }
   ```

### Backend

1. **Validate all inputs**
2. **Use environment variables for secrets**
3. **Implement rate limiting**
4. **Add request logging**
5. **Return consistent error format**
6. **Use HTTPS in production**

---

## Changelog

### Version 1.0 (November 2024)
- Initial API documentation
- Authentication endpoints
- Video upload endpoint
- Metadata update endpoint

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024

