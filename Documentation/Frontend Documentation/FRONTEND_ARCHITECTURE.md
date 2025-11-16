# DeepTrace Frontend Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Component Hierarchy](#component-hierarchy)
6. [Pages & Components](#pages--components)
7. [State Management](#state-management)
8. [Routing](#routing)
9. [API Integration](#api-integration)
10. [Blockchain Integration](#blockchain-integration)
11. [Styling & Design](#styling--design)
12. [Dependencies](#dependencies)

---

## Overview

DeepTrace's frontend is a modern React application built with **Vite**, styled with **Tailwind CSS**, and integrated with **Ethereum blockchain** for decentralized video verification. The application provides an intuitive interface for users to authenticate, upload videos, and receive deepfake detection results with frame-by-frame analysis.

### Key Features
- 🔐 **Google OAuth Authentication** - Secure user login
- 📹 **Video Upload & Analysis** - Multi-tier analysis options
- 📊 **Interactive Results Dashboard** - Frame-by-frame visualization
- ⛓️ **Blockchain Integration** - Ethereum smart contracts for video verification
- 🎨 **Modern UI/UX** - Dark theme with animated elements
- 📱 **Responsive Design** - Works across devices

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (User)                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT APPLICATION (Vite)                          │
│                     http://localhost:5173                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │                 React Router (SPA)                         │     │
│  │                                                             │     │
│  │  /                    → Landing Page                       │     │
│  │  /signup              → Signup Page                        │     │
│  │  /login               → Login Page                         │     │
│  │  /home                → Homepage (Protected)               │     │
│  │  /upload-video        → Video Upload Page                 │     │
│  │  /result              → Results Page                       │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │                   Component Layer                          │     │
│  │                                                             │     │
│  │  • Navbar               - Global navigation                │     │
│  │  • Landing              - Hero section                     │     │
│  │  • Login/Signup         - Authentication UI                │     │
│  │  • Homepage             - Dashboard                        │     │
│  │  • VideoUpload          - Upload interface                 │     │
│  │  • Result               - Results display                  │     │
│  │  • Chart                - Visualization                    │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │                Integration Layer                           │     │
│  │                                                             │     │
│  │  • APIs/userDetails.js  - User API calls                  │     │
│  │  • contractDeets.jsx    - Blockchain integration          │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                       │
└─────┬────────────────────────┬──────────────────────┬───────────────┘
      │                        │                      │
      │ HTTP/HTTPS             │ HTTP/HTTPS           │ Web3 Provider
      │ Credentials: include   │                      │ MetaMask
      ▼                        ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│  Express     │      │  Flask ML    │      │  Ethereum        │
│  Backend     │      │  Service     │      │  Blockchain      │
│  Port 5000   │      │  Port 8080   │      │  Smart Contract  │
└──────────────┘      └──────────────┘      └──────────────────┘
```

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library |
| **Vite** | 5.4.1 | Build tool & dev server |
| **React Router DOM** | 6.26.1 | Client-side routing |

### Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.10 | Utility-first CSS framework |
| **PostCSS** | 8.4.45 | CSS processing |
| **Autoprefixer** | 10.4.20 | Vendor prefixes |
| **Lucide React** | 0.438.0 | Icon library |
| **React Icons** | 5.3.0 | Additional icons |

### Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Chart.js** | 4.4.4 | Charting library |
| **react-chartjs-2** | 5.2.0 | React wrapper for Chart.js |

### Blockchain Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| **ethers.js** | 5.7.0 | Ethereum library |
| **Hardhat** | 2.22.10 | Ethereum development |

### HTTP & API

| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.7.7 | HTTP client |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.9.0 | Linting |
| **@vitejs/plugin-react-swc** | 3.5.0 | React Fast Refresh |

---

## Project Structure

```
src/
├── APIs/
│   └── userDetails.js              # User authentication API
│
├── assets/
│   ├── deepTrace_dark.png          # Dark logo
│   ├── deeptrace_logo_transparent.png  # Transparent logo
│   └── react.svg                   # React icon
│
├── components/
│   ├── Chart.jsx                   # Line chart component
│   ├── Navbar/
│   │   └── Navbar.jsx              # Global navigation
│   ├── Homepage/
│   │   └── Homepage.jsx            # Dashboard page
│   ├── Login/
│   │   └── Login.jsx               # Login page
│   ├── Signup/
│   │   └── Signup.jsx              # Signup page
│   └── Result.jsx                  # Results display
│
├── artifacts/
│   └── contracts/
│       └── Upload.sol/
│           ├── VideoStorage.json   # Smart contract ABI
│           └── VideoStorage.dbg.json
│
├── App.jsx                         # Main app component
├── App.css                         # App styles
├── index.css                       # Global styles
├── main.jsx                        # Entry point
├── Landing.jsx                     # Landing page
├── predict.jsx                     # Prediction page (legacy)
├── prediction.jsx                  # Video upload page
└── contractDeets.jsx               # Blockchain utilities

Root:
├── index.html                      # HTML entry
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
└── postcss.config.cjs              # PostCSS configuration
```

---

## Component Hierarchy

```
App (Root)
│
├── Router
│   │
│   ├── Route: "/"
│   │   └── Landing
│   │       └── Navbar
│   │
│   ├── Route: "/signup"
│   │   └── Signup
│   │
│   ├── Route: "/login"
│   │   └── Login
│   │
│   ├── Route: "/home"
│   │   └── Homepage (Protected)
│   │
│   ├── Route: "/predict"
│   │   └── Predict (Legacy)
│   │       └── Navbar
│   │
│   ├── Route: "/upload-video"
│   │   └── VideoUpload
│   │
│   └── Route: "/result"
│       └── Result
│           └── Chart
```

---

## Pages & Components

### `main.jsx` - Entry Point

**Purpose**: Application bootstrap and root rendering.

**Code**:
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Key Features**:
- Uses React 18's `createRoot` API
- Wraps app in `StrictMode` for development checks
- Imports global CSS (Tailwind)

---

### `App.jsx` - Main Application

**Purpose**: Root component with routing configuration.

**Routes Configured**:
```javascript
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/login" element={<Login />} />
  <Route path="/home" element={<Home />} />
  <Route path="/predict" element={<Predict />} />
  <Route path="/upload-video" element={<VideoUpload />} />
  <Route path="/result" element={<Result />} />
</Routes>
```

**Routing Strategy**: Client-side routing (SPA)
- No page reloads
- Fast navigation
- State preservation

---

### `Landing.jsx` - Landing Page

**Purpose**: Hero section with animated background and call-to-action.

**Key Features**:

1. **Animated Background**:
   ```javascript
   <div className="circle1 relative w-[75rem] h-[75rem] rounded-full">
     {/* Animated concentric circles */}
   </div>
   <div className="circle2 absolute w-[60rem] h-[60rem]"></div>
   <div className="circle3 absolute w-[40rem] h-[40rem]"></div>
   ```

2. **Hero Content**:
   - Tagline: "Exposing Digital Deception. Frame by Frame."
   - Description of technology (Blockchain + ML)
   - CTA buttons: "Try Now", "How it works?"

3. **Design Elements**:
   - Dark theme (`#1e1e1e` background)
   - Pulsing glow animation (5s, 7s, 9s cycles)
   - Glassmorphism effects
   - Responsive layout

**Navigation Flow**:
```
User clicks "Try Now"
    ↓
Redirect to /login
    ↓
Google OAuth or form login
```

---

### `components/Login/Login.jsx` - Login Page

**Purpose**: User authentication interface.

**Authentication Methods**:

1. **Google OAuth** (Primary):
   ```javascript
   onClick={() => {
     window.location.href = "http://localhost:5000/auth/google";
   }}
   ```
   - Redirects to Express backend
   - Initiates Google OAuth flow
   - Returns to `/home` on success

2. **Email/Password** (UI Only - Not Implemented):
   ```javascript
   <form>
     <input type="email" placeholder="Email Address" />
     <input type="password" placeholder="Password" />
     <button type="submit">Log In</button>
   </form>
   ```

**Design Features**:
- Centered card layout
- Dark glassmorphic card (`#252525`)
- Logo + branding
- Link to signup page
- "Or" divider between auth methods

**User Flow**:
```
/login
  ↓
Click "Log In with Google"
  ↓
Redirect to Express /auth/google
  ↓
Google OAuth consent
  ↓
Callback to Express
  ↓
Redirect to /home
```

---

### `components/Signup/Signup.jsx` - Signup Page

**Purpose**: New user registration interface.

**Features**:
- Nearly identical to Login page
- Google OAuth signup (primary method)
- Form fields (UI only):
  - Full Name
  - Email Address
  - Password
  - Confirm Password
- Link to login page

**Key Difference from Login**:
- Button text: "Sign Up with Google"
- Additional field: Full Name, Confirm Password
- Text: "Already have an account? Log In"

**Note**: Currently, both login and signup use the same OAuth flow. The backend automatically creates a new user if one doesn't exist.

---

### `components/Homepage/Homepage.jsx` - Dashboard

**Purpose**: Protected homepage after authentication.

**Key Features**:

1. **Authentication Check**:
   ```javascript
   useEffect(() => {
     const fetchUserDetails = async () => {
       const userDetails = await getUserDetails();
       if (userDetails) setUser(userDetails);
     };
     fetchUserDetails();
   }, []);
   ```

2. **Loading State**:
   ```javascript
   if (!user) return <div>Loading...</div>;
   ```

3. **User Welcome**:
   ```javascript
   <div>Hello {user.username} 👋</div>
   <div>Welcome to DeepTrace</div>
   ```

4. **Action Buttons**:
   - **Test A Video**: Navigates to `/upload-video`
   - **Chatbot**: External link to Gaia network chatbot
   - **Logout**: Calls backend `/logout` endpoint

**Blockchain Integration (Commented Out)**:
```javascript
// const fetchVideosData = async () => {
//   const videos = await fetchVideos();
// };
```

**Protected Route**:
- Checks authentication on mount
- Redirects to login if not authenticated (handled in `userDetails.js`)

---

### `prediction.jsx` - Video Upload Page

**Purpose**: Main video upload interface with tier selection.

**Key Features**:

#### 1. Tier Selection

```javascript
<input type="radio" value="tier1" onClick={() => setFramesPerVideo(50)} />
<label>Basic - Analyze 50 frames</label>

<input type="radio" value="tier2" onClick={() => setFramesPerVideo(100)} />
<label>Standard - Analyze 100 frames</label>

<input type="radio" value="tier3" onClick={() => setFramesPerVideo(300)} />
<label>Premium - Analyze 300+ frames</label>
```

**Analysis Tiers**:
| Tier | Frames | Speed | Accuracy | Use Case |
|------|--------|-------|----------|----------|
| **Basic** | 50 | Fast | Good | Quick check |
| **Standard** | 100 | Medium | Better | Balanced |
| **Premium** | 300+ | Slow | Best | Thorough analysis |

#### 2. File Upload

```javascript
const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};
```

**Upload UI**:
- Drag & drop area
- File type indicator: "mp4, mov, webm, avi, wmv (max 100MB)"
- Video preview after selection
- "Remove Video" button

#### 3. Video Processing

```javascript
const handleUpload = async () => {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("frames_per_video", framesPerVideo);

  const response = await fetch("http://127.0.0.1:8080/upload-video", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  
  // Upload to blockchain
  if (data.mean_score < 0.5) {
    uploadVideo(file, "Real");
  } else {
    uploadVideo(file, "Deepfake");
  }

  // Navigate to results
  navigate("/result", { state: { result: data, fileName: file.name } });
};
```

**Processing Flow**:
```
User selects file
    ↓
Choose tier (frames)
    ↓
Click Upload
    ↓
Show loader overlay
    ↓
POST to Flask ML service
    ↓
Receive prediction scores
    ↓
Upload hash to blockchain
    ↓
Navigate to /result with data
```

#### 4. Loading State

```javascript
{LoaderActive && (
  <div className="absolute inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
    <Loader size={64} className="animate-spin text-white" />
    <div>Uploading Video...</div>
  </div>
)}
```

**UX Considerations**:
- Fullscreen loader mask
- Prevents interaction during upload
- Spinner animation
- Status text

---

### `components/Result.jsx` - Results Page

**Purpose**: Display deepfake detection results with visualization.

**Data Flow**:
```javascript
const location = useLocation();

React.useEffect(() => {
  setResult(location.state.result);
  setVidname(location.state.fileName);
}, [location.state]);
```

**Result Data Structure**:
```javascript
{
  mean_score: 0.292,           // Overall score
  pred_scores: [0.23, 0.31, ...] // Per-frame scores
}
```

**UI Components**:

1. **Result Header**:
   ```javascript
   <div>Results</div>
   <div>{fileName}</div>
   {result.mean_score < 0.5 ? (
     <div className="text-green-500 border-green-600">Real</div>
   ) : (
     <div className="text-red-500 border-red-600">Deepfake</div>
   )}
   <p>{Number(result.mean_score.toFixed(2) * 100)}% Deepfake</p>
   <p>Stored on Blockchain</p>
   ```

2. **Result Card Layout**:
   - Filename
   - Label badge (Real/Deepfake)
   - Percentage score
   - Blockchain status indicator

3. **Visualization**:
   ```javascript
   <Chart values={result.pred_scores} />
   ```

4. **Action Button**:
   ```javascript
   <button onClick={() => window.location.href = "/upload-video"}>
     Upload Another Video
   </button>
   ```

**Score Interpretation**:
```javascript
mean_score < 0.5  →  Real (Green)
mean_score >= 0.5 →  Deepfake (Red)

Confidence % = mean_score * 100
```

**Visual Design**:
- Dark card with border (`#252525`, `#ffffff10`)
- Color-coded labels (green/red)
- Blockchain confirmation indicator
- Frame-by-frame graph

---

### `components/Chart.jsx` - Line Chart Component

**Purpose**: Visualize per-frame prediction scores.

**Implementation**:

```javascript
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
```

**Data Configuration**:
```javascript
const labels = values.values.map((_, i) => i+1); // 1-based index

const data = {
  labels: labels,
  datasets: [{
    label: 'Values',
    data: values.values,
    fill: false,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    tension: 0.1,
    pointBackgroundColor: 'rgb(255, 255, 255)',
  }],
};
```

**Chart Options**:
```javascript
const options = {
  responsive: true,
  scales: {
    x: {
      type: 'linear',
      title: { display: true, text: '1-Based Index' },
      min: 1,
      max: labels.length,
      ticks: { stepSize: 15 },
    },
    y: {
      title: { display: true, text: 'Values' },
      min: 0,
      max: 1,
    },
  },
};
```

**Visual Features**:
- X-axis: Frame number (1-based)
- Y-axis: Prediction score (0-1)
- White points on semi-transparent line
- Tick marks every 15 frames
- Responsive to container width

**Interpretation**:
- **Low values (close to 0)**: Frame appears real
- **High values (close to 1)**: Frame appears fake
- **Patterns**: Consistency or spikes indicate manipulation

---

### `components/Navbar/Navbar.jsx` - Navigation Bar

**Purpose**: Global navigation component for landing page.

**Features**:

1. **Logo/Brand**:
   ```javascript
   <a href="#">
     <p className='text-3xl font-semibold'>DeepTrace</p>
   </a>
   ```

2. **Navigation Links** (Desktop):
   ```javascript
   <ul className="hidden lg:flex">
     <li><a href="#">How it works?</a></li>
     <li><a href="#">API services</a></li>
     <li><a href="#">Browser Extension</a></li>
   </ul>
   ```

3. **Auth Buttons** (Desktop):
   ```javascript
   <a href="/login">Log In</a>
   <a href="/signup">Sign Up</a>
   ```

4. **Mobile Menu** (Hidden by default):
   ```javascript
   <div className="lg:hidden">
     <button className="navbar-burger">
       {/* Hamburger icon */}
     </button>
   </div>
   ```

**Responsive Design**:
- Desktop: Full navigation
- Mobile: Hamburger menu (implementation pending)

**Positioning**:
- Fixed to top
- Z-index for overlay
- 85% width centered

**Note**: Currently used only on Landing page. Homepage has no navbar (minimal design).

---

## State Management

DeepTrace uses **React Hooks** for state management (no Redux or external state library).

### Local Component State

#### `useState` Usage

**Homepage**:
```javascript
const [user, setUser] = useState(null);
```

**VideoUpload**:
```javascript
const [file, setFile] = useState(null);
const [framesPerVideo, setFramesPerVideo] = useState(50);
const [result, setResult] = useState(null);
const [tier, setTier] = useState("tier1");
const [LoaderActive, setLoaderActive] = useState(false);
```

**Result**:
```javascript
const [result, setResult] = useState(null);
const [vidname, setVidname] = useState(null);
```

### Side Effects with `useEffect`

**Authentication Check**:
```javascript
useEffect(() => {
  const fetchUserDetails = async () => {
    const userDetails = await getUserDetails();
    if (userDetails) setUser(userDetails);
  };
  fetchUserDetails();
}, []);
```

**Result Data Loading**:
```javascript
React.useEffect(() => {
  setResult(location.state.result);
  setVidname(location.state.fileName);
}, [location.state.result, location.state.fileName]);
```

### State Flow Patterns

#### Authentication State
```
App Mount
    ↓
useEffect triggers
    ↓
Call getUserDetails API
    ↓
If authenticated: setUser(data)
    ↓
If not: redirect to /login
```

#### Upload State
```
User selects file
    ↓
setFile(file)
    ↓
User clicks upload
    ↓
setLoaderActive(true)
    ↓
API call
    ↓
setResult(data)
    ↓
Navigate to /result
```

### Props Passing

**Navigation State** (React Router):
```javascript
// Passing data
navigate("/result", { 
  state: { 
    result: data, 
    fileName: file.name 
  } 
});

// Receiving data
const location = useLocation();
const result = location.state.result;
const fileName = location.state.fileName;
```

**Component Props**:
```javascript
// Chart component
<Chart values={result.pred_scores} />

// In Chart.jsx
function Chart(values) {
  const data = values.values;
}
```

---

## Routing

### React Router DOM Configuration

**Browser Router** (in `App.jsx`):
```javascript
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route definitions */}
      </Routes>
    </Router>
  );
}
```

### Route Definitions

| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| `/` | Landing | No | Public landing page |
| `/signup` | Signup | No | User registration |
| `/login` | Login | No | User authentication |
| `/home` | Homepage | Yes | Dashboard after login |
| `/predict` | Predict | No | Legacy upload page |
| `/upload-video` | VideoUpload | Yes* | Video upload interface |
| `/result` | Result | Yes* | Results display |

*Protected by authentication check, not route guard

### Navigation Methods

#### 1. Programmatic Navigation

```javascript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navigate to route
navigate("/upload-video");

// Navigate with state
navigate("/result", { 
  state: { result: data, fileName: file.name } 
});
```

#### 2. Link Navigation

```javascript
<a href="/login">Log In</a>
<a href="/signup">Sign Up</a>
```

#### 3. Window Location (Full Page Redirect)

```javascript
window.location.href = "/upload-video";
window.location.href = "http://localhost:5000/auth/google";
```

**Use Cases**:
- Internal navigation: `navigate()` or `<Link>`
- External links: `window.location.href`
- Backend redirects: `window.location.href`

### Protected Routes Strategy

**Client-Side Check**:
```javascript
// In Homepage component
useEffect(() => {
  const fetchUserDetails = async () => {
    const userDetails = await getUserDetails();
    if (userDetails) setUser(userDetails);
  };
  fetchUserDetails();
}, []);

if (!user) return <div>Loading...</div>;
```

**API-Level Redirect**:
```javascript
// In APIs/userDetails.js
if(response.data === "") {
  window.location.href = "/login";
  return null;
}
```

**Flow**:
```
User visits /home
    ↓
Component mounts
    ↓
Calls getUserDetails
    ↓
If not authenticated: redirect to /login
    ↓
If authenticated: render page
```

---

## API Integration

### `APIs/userDetails.js` - User Authentication API

**Purpose**: Fetch authenticated user details from Express backend.

**Implementation**:

```javascript
import axios from "axios";

export const getUserDetails = async () => {
  try {
    const response = await axios.get("http://localhost:5000/getUserDetails", {
      withCredentials: true,
    });
    
    if(response.data === "") {
      window.location.href = "/login";
      return null;
    }
    
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
```

**Key Features**:

1. **Credentials Included**:
   ```javascript
   withCredentials: true
   ```
   - Sends cookies with request
   - Required for session authentication

2. **Error Handling**:
   - Returns `null` on error
   - Logs error to console
   - Redirects to login if empty response

3. **Response Format**:
   ```javascript
   {
     username: "John Doe",
     email: "john@example.com"
   }
   ```

**Usage**:
```javascript
const userDetails = await getUserDetails();
if (userDetails) {
  console.log(userDetails.username);
  console.log(userDetails.email);
}
```

### ML Service Integration

**Video Upload**:
```javascript
const response = await fetch("http://127.0.0.1:8080/upload-video", {
  method: "POST",
  body: formData, // FormData with video file
});

const data = await response.json();
// { mean_score: 0.292, pred_scores: [...] }
```

**Request Format**:
```javascript
const formData = new FormData();
formData.append("video", file);           // Video file
formData.append("frames_per_video", 100); // Number of frames
```

**Response Processing**:
```javascript
if (data.mean_score < 0.5) {
  // Video is REAL
  uploadVideo(file, "Real");
} else {
  // Video is DEEPFAKE
  uploadVideo(file, "Deepfake");
}
```

### Backend Integration

**Google OAuth**:
```javascript
// Initiate OAuth
window.location.href = "http://localhost:5000/auth/google";

// After callback, user is redirected to /home
```

**Logout**:
```javascript
window.location.href = "http://localhost:5000/logout";
```

### API Endpoints Used

| Endpoint | Method | Purpose | Credentials |
|----------|--------|---------|-------------|
| `http://localhost:5000/getUserDetails` | GET | Get user info | Yes |
| `http://localhost:5000/auth/google` | GET | OAuth redirect | No |
| `http://localhost:5000/logout` | GET | Logout user | Yes |
| `http://127.0.0.1:8080/upload-video` | POST | Video analysis | No |

---

## Blockchain Integration

### `contractDeets.jsx` - Ethereum Integration

**Purpose**: Interact with Ethereum smart contracts for video verification.

#### Smart Contract Configuration

```javascript
import { ethers } from 'ethers';
import VideoStorage from './artifacts/contracts/Upload.sol/VideoStorage.json';

const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
```

**Contract ABI**: Located in `artifacts/contracts/Upload.sol/VideoStorage.json`

#### Provider & Signer Setup

```javascript
async function loadProvider() {
  if (window.ethereum) {
    const newProvider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Request wallet connection
    await newProvider.send('eth_requestAccounts', []);
    
    // Get signer
    const signer = newProvider.getSigner();
    account = await signer.getAddress();
    
    // Load contract
    const newContract = new ethers.Contract(
      contractAddress, 
      VideoStorage.abi, 
      signer
    );
    contractGlobal = newContract;
  } else {
    alert('MetaMask not installed! Please install MetaMask to continue.');
  }
}
```

**Flow**:
```
Page load
    ↓
loadProvider() called
    ↓
Check for window.ethereum (MetaMask)
    ↓
Request account access
    ↓
Get user's Ethereum address
    ↓
Initialize contract instance
```

#### Upload Video to Blockchain

```javascript
const uploadVideo = async (file, result) => {
  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Hash the video
  const videoHash = ethers.utils.keccak256(buffer);
  
  // Call smart contract
  const tx = await contractGlobal.addVideo(videoHash, result);
  await tx.wait();
  
  console.log('Video uploaded successfully');
  alert('Video uploaded successfully');
};
```

**Process**:
```
Video file
    ↓
Convert to ArrayBuffer
    ↓
Create Buffer
    ↓
Hash with keccak256
    ↓
Call contract.addVideo(hash, result)
    ↓
Wait for transaction confirmation
    ↓
Show success message
```

**Smart Contract Call**:
```solidity
// Contract function (Solidity)
function addVideo(bytes32 videoHash, string memory result) public {
  videos[msg.sender].push(Video({
    hash: videoHash,
    result: result,
    timestamp: block.timestamp
  }));
}
```

#### Fetch User Videos

```javascript
const fetchVideos = async () => {
  const newProvider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = newProvider.getSigner();
  const UserAccount = await signer.getAddress();
  
  const videos = await contractGlobal.getUserVideos(UserAccount);
  
  return videos;
};
```

**Usage** (Currently commented out in Homepage):
```javascript
// useEffect(() => {
//   const fetchVideosData = async () => {
//     const videos = await fetchVideos();
//     console.log("Fetched videos:", videos);
//   };
//   fetchVideosData();
// }, []);
```

#### MetaMask Integration

**Requirements**:
- MetaMask browser extension installed
- User must approve connection
- User must approve transactions

**User Flow**:
```
User uploads video
    ↓
Result determined (Real/Deepfake)
    ↓
uploadVideo() called
    ↓
MetaMask popup: "Sign transaction?"
    ↓
User approves
    ↓
Transaction sent to blockchain
    ↓
Wait for confirmation
    ↓
Success alert shown
```

#### Buffer Polyfill

```javascript
import { Buffer } from 'buffer';
window.Buffer = Buffer;
```

**Why Needed**: Vite doesn't automatically polyfill Node.js modules like `Buffer`.

**Vite Config**:
```javascript
resolve: {
  alias: {
    buffer: 'buffer/',
  }
}
```

---

## Styling & Design

### Design System

#### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#1e1e1e` | Main background |
| **Card Background** | `#252525` | Card/modal backgrounds |
| **Text Primary** | `#f1f3f5` | Main text |
| **Text Secondary** | `#787878` | Secondary text |
| **Accent** | `#1473E6` | Links, highlights |
| **Success** | `#00ff00` | Real videos |
| **Error** | `#ff0000` | Deepfake videos |
| **Border** | `#ffffff10` | Subtle borders |

#### Typography

**Font Family**:
```css
font-family: 'Urbanist', sans-serif;
```

**Font Sizes** (Tailwind classes):
- `text-6xl` - Hero headings
- `text-5xl` - Page titles
- `text-3xl` - Section headings
- `text-2xl` - Subheadings
- `text-xl` - Body large
- `text-lg` - Body medium
- `text-sm` - Small text

#### Spacing

**Padding/Margin** (Tailwind):
- `px-4`, `py-2.5` - Button padding
- `px-12`, `py-16` - Card padding
- `gap-4` - Flex gap
- `mt-8` - Section spacing

### Tailwind CSS

**Configuration** (`tailwind.config.js`):
```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './src/**/*.css',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Global Styles** (`index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  background-color: #1e1e1e;
}
```

### Custom Animations

**Pulsing Glow** (`App.css`):
```css
@keyframes pulseGlow {
  0%, 100% {
    border-color: rgba(241, 243, 245, 0.03);
    box-shadow: 0 0 0px 0px rgba(241, 243, 245, 0.05);
  }
  50% {
    border-color: rgba(241, 243, 245, 0.1);
    box-shadow: 0 0 5px 5px rgba(241, 243, 245, 0.05);
  }
}

.circle1 {
  animation: pulseGlow 5s infinite ease-in-out;
}
```

**Usage**:
- Landing page background circles
- Creates breathing effect
- Different durations for layered effect

### UI Components

#### Buttons

**Primary Button**:
```javascript
<button className="py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-gray-900 font-semibold rounded-full">
  Try Now
</button>
```

**Secondary Button**:
```javascript
<button className="py-2.5 px-5 border border-[#787878] hover:bg-[#252525] text-[#f1f3f5] rounded-full">
  How it works?
</button>
```

#### Input Fields

```javascript
<input
  type="email"
  placeholder="Email Address"
  className="w-[360px] px-4 py-2.5 bg-[#1e1e1e] rounded-full border border-[#f1f3f515] hover:border-[#f1f3f550]"
/>
```

#### Cards

```javascript
<div className="bg-[#252525] px-12 py-16 rounded-[20px]">
  {/* Card content */}
</div>
```

#### Badges

```javascript
// Success badge
<div className="px-4 py-1 rounded-full text-green-500 bg-[#00ff0010] border border-green-600">
  Real
</div>

// Error badge
<div className="px-4 py-1 rounded-full text-[#ff0000] bg-[#ff000010] border border-[#ff0000]">
  Deepfake
</div>
```

### Icons

**Lucide React**:
```javascript
import { ArrowRight, ArrowLeft, Loader, InfoIcon } from "lucide-react";

<ArrowRight size={20} />
<Loader size={64} className="animate-spin" />
```

**React Icons**:
```javascript
import { FcGoogle } from "react-icons/fc";

<FcGoogle className='scale-[1.5]'/>
```

### Responsive Design

**Breakpoints** (Tailwind):
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px (primary breakpoint)
- `xl:` - 1280px

**Example**:
```javascript
<button className="hidden lg:inline-block">
  {/* Hidden on mobile, visible on desktop */}
</button>
```

### Dark Theme

**Approach**: Dark-first design
- Background: `#1e1e1e`
- All components designed for dark
- High contrast for readability
- Subtle borders and shadows

---

## Dependencies

### Production Dependencies

```json
{
  "axios": "^1.7.7",
  "buffer": "^6.0.3",
  "chart.js": "^4.4.4",
  "dotenv": "^16.4.5",
  "ethers": "^5.7.0",
  "lucide-react": "^0.438.0",
  "react": "^18.3.1",
  "react-chartjs-2": "^5.2.0",
  "react-dom": "^18.3.1",
  "react-icons": "^5.3.0",
  "react-router-dom": "^6.26.1"
}
```

### Dev Dependencies

```json
{
  "@eslint/js": "^9.9.0",
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "@vitejs/plugin-react-swc": "^3.5.0",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.9.0",
  "eslint-plugin-react": "^7.35.0",
  "eslint-plugin-react-hooks": "^5.1.0-rc.0",
  "eslint-plugin-react-refresh": "^0.4.9",
  "globals": "^15.9.0",
  "postcss": "^8.4.45",
  "tailwindcss": "^3.4.10",
  "vite": "^5.4.1"
}
```

### Key Dependencies Explained

#### Core
- **react**: UI library
- **react-dom**: DOM rendering
- **react-router-dom**: Client-side routing

#### HTTP & API
- **axios**: HTTP client with interceptors and better error handling

#### Blockchain
- **ethers**: Ethereum library for smart contract interaction
- **buffer**: Node.js Buffer polyfill for browser

#### UI & Visualization
- **chart.js**: Powerful charting library
- **react-chartjs-2**: React wrapper for Chart.js
- **lucide-react**: Modern icon library
- **react-icons**: Additional icon sets

#### Styling
- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS transformation tool
- **autoprefixer**: Automatic vendor prefixes

#### Build Tools
- **vite**: Fast build tool and dev server
- **@vitejs/plugin-react-swc**: Fast Refresh with SWC compiler

#### Linting
- **eslint**: JavaScript linter
- **eslint-plugin-react**: React-specific linting rules

---

## Build & Development

### Development Server

```bash
npm run dev
```

**Features**:
- Hot Module Replacement (HMR)
- Fast Refresh for React
- Port: 5173
- Opens in browser automatically

### Production Build

```bash
npm run build
```

**Output**: `dist/` directory

**Optimization**:
- Minification
- Tree shaking
- Code splitting
- Asset optimization

### Preview Production Build

```bash
npm run preview
```

---

## Security Considerations

### Current Implementation

1. **Session Cookies**:
   - HttpOnly cookies from backend
   - Credentials: include in API calls

2. **CORS**:
   - Backend allows `http://localhost:5173`
   - Credentials enabled

3. **MetaMask Integration**:
   - User must approve all transactions
   - Private keys never exposed

### Recommendations

1. **Environment Variables**:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   ```

2. **Input Validation**:
   - File type checking
   - File size limits
   - XSS prevention

3. **HTTPS**:
   - Use HTTPS in production
   - Secure cookies

4. **Rate Limiting**:
   - Client-side upload limits
   - Debounce API calls

---

## Performance Optimization

### Current Optimizations

1. **Vite**:
   - Fast builds
   - Code splitting
   - Tree shaking

2. **SWC Compiler**:
   - Faster than Babel
   - Better performance

3. **React 18**:
   - Concurrent features
   - Automatic batching

### Recommendations

1. **Code Splitting**:
   ```javascript
   const Homepage = lazy(() => import('./components/Homepage/Homepage'));
   ```

2. **Image Optimization**:
   - Compress logo images
   - Use WebP format
   - Lazy load images

3. **Memoization**:
   ```javascript
   const MemoizedChart = React.memo(Chart);
   ```

4. **Bundle Analysis**:
   ```bash
   npm run build -- --analyze
   ```

---

## Future Enhancements

### Planned Features

1. **User Dashboard**:
   - Video history
   - Analysis statistics
   - Blockchain transaction history

2. **Real-time Updates**:
   - WebSocket for upload progress
   - Live processing status

3. **Enhanced Visualization**:
   - Heatmaps showing manipulation regions
   - Attention maps overlay
   - Frame-by-frame comparison

4. **Social Features**:
   - Share results
   - Report deepfakes
   - Community verification

5. **Mobile App**:
   - React Native version
   - Camera integration
   - On-device analysis

---

## Troubleshooting

### Common Issues

#### 1. "Module not found: buffer"

**Solution**:
```bash
npm install buffer
```

Add to `vite.config.js`:
```javascript
resolve: {
  alias: {
    buffer: 'buffer/',
  }
}
```

#### 2. MetaMask not detected

**Solution**:
- Install MetaMask extension
- Reload page
- Check `window.ethereum` exists

#### 3. CORS errors

**Solution**:
- Verify backend CORS config
- Check `withCredentials: true`
- Ensure same origin for cookies

#### 4. Chart not rendering

**Solution**:
```javascript
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
```

---

## Conclusion

DeepTrace's frontend is a modern, performant React application featuring:

✅ **Modern Stack**: React 18 + Vite + Tailwind CSS
✅ **Authentication**: Google OAuth integration
✅ **Video Upload**: Multi-tier analysis options
✅ **Blockchain**: Ethereum smart contract integration
✅ **Visualization**: Frame-by-frame result graphs
✅ **UX**: Loading states, animations, responsive design

### Key Strengths
- Fast development with Vite
- Type-safe blockchain interaction
- Smooth user experience
- Modern, dark-themed UI
- Comprehensive video analysis

### Areas for Improvement
- Add route guards
- Implement error boundaries
- Add loading skeletons
- Improve mobile responsiveness
- Add comprehensive testing

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024
**Author**: AI Code Assistant
**Project**: DeepTrace - Frontend Documentation

