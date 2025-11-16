# DeepTrace Component Reference

> Detailed documentation for all React components in DeepTrace

---

## Table of Contents
1. [Component Overview](#component-overview)
2. [Pages](#pages)
3. [Reusable Components](#reusable-components)
4. [Utilities](#utilities)
5. [Props & State Reference](#props--state-reference)
6. [Component Patterns](#component-patterns)

---

## Component Overview

### Component Classification

| Type | Count | Examples |
|------|-------|----------|
| **Pages** | 6 | Landing, Login, Signup, Homepage, VideoUpload, Result |
| **Reusable Components** | 2 | Navbar, Chart |
| **Utilities** | 2 | userDetails, contractDeets |

---

## Pages

### Landing.jsx

**Path**: `/src/Landing.jsx`
**Route**: `/`
**Protected**: No

#### Purpose
Hero landing page with animated background and call-to-action buttons.

#### Props
None (uses no props)

#### State
None (stateless component)

#### Key Features

1. **Animated Background**
```javascript
<div className="circle1"></div> // 5s pulse
<div className="circle2"></div> // 7s pulse
<div className="circle3"></div> // 9s pulse
```

2. **Hero Content**
```javascript
<h1>Exposing Digital Deception. Frame by Frame.</h1>
<p>Leveraging Blockchain and Machine Learning...</p>
```

3. **CTA Buttons**
```javascript
<button onClick={() => window.location.href = '/login'}>
  Try Now
</button>
<button>How it works?</button>
```

#### CSS Classes Used
- `bg-[#1e1e1e]` - Dark background
- `circle1`, `circle2`, `circle3` - Custom animated circles
- `rounded-full` - Fully rounded corners
- `text-6xl` - Large hero text

#### Navigation Flow
```
Landing → "Try Now" → /login
Landing → "Get Started" → /login
```

#### Code Example
```javascript
import Navbar from './components/Navbar/Navbar'
import {ArrowRight} from 'lucide-react'

function Landing() {
  return (
    <div className='w-full h-screen flex justify-center items-center bg-[#1e1e1e]'>
      <div className="background">
        {/* Animated circles */}
      </div>
      <Navbar />
      <div className='z-10 text-center'>
        <h1>Exposing Digital Deception...</h1>
        {/* CTAs */}
      </div>
    </div>
  )
}
```

---

### Login.jsx

**Path**: `/src/components/Login/Login.jsx`
**Route**: `/login`
**Protected**: No

#### Purpose
User authentication interface with Google OAuth and email/password options.

#### Props
None

#### State
None (authentication handled by backend)

#### Key Features

1. **Google OAuth Button**
```javascript
<button onClick={() => {
  window.location.href = "http://localhost:5000/auth/google";
}}>
  <FcGoogle /> Log In with Google
</button>
```

2. **Email/Password Form** (UI only)
```javascript
<form>
  <input type="email" placeholder="Email Address" />
  <input type="password" placeholder="Password" />
  <button type="submit">Log In</button>
</form>
```

3. **Link to Signup**
```javascript
<div>
  New User? <a href='/signup'>Sign Up</a>
</div>
```

#### Assets Used
- Logo: `/src/assets/deeptrace_logo_transparent.png`
- Google Icon: `react-icons/fc` (FcGoogle)

#### Styling
- Card: `bg-[#252525] px-12 py-16 rounded-[20px]`
- Inputs: `bg-[#1e1e1e] rounded-full border`
- Button: `bg-[#f1f3f5] text-gray-900 rounded-full`

#### Authentication Flow
```
User clicks "Log In with Google"
    ↓
Redirect to Express backend /auth/google
    ↓
Google OAuth flow
    ↓
Callback to backend
    ↓
Backend redirects to /home
```

#### Code Structure
```javascript
import logo from '/src/assets/deeptrace_logo_transparent.png'
import { FcGoogle } from "react-icons/fc";

function Login() {
  return (
    <div className='h-screen flex justify-center items-center gap-36'>
      {/* Logo section */}
      <div>
        <img src={logo} />
        <div>DeepTrace</div>
      </div>
      
      {/* Login card */}
      <div className='bg-[#252525]'>
        <div>Log In / Welcome Back!</div>
        <button onClick={/* OAuth redirect */}>
          Log In with Google
        </button>
        <form>{/* Email/password */}</form>
      </div>
    </div>
  )
}
```

---

### Signup.jsx

**Path**: `/src/components/Signup/Signup.jsx`
**Route**: `/signup`
**Protected**: No

#### Purpose
New user registration interface.

#### Props
None

#### State
None

#### Key Features

1. **Google OAuth Signup**
```javascript
<button onClick={() => {
  window.location.href = "http://localhost:5000/auth/google";
}}>
  Sign Up with Google
</button>
```

2. **Registration Form** (UI only)
```javascript
<form>
  <input type="text" placeholder="Full Name" />
  <input type="email" placeholder="Email Address" />
  <input type="password" placeholder="Password" />
  <input type="password" placeholder="Confirm Password" />
  <button type="submit">Sign Up</button>
</form>
```

3. **Link to Login**
```javascript
<div>
  Already have an account? <a href="/login">Log In</a>
</div>
```

#### Differences from Login
- Additional field: Full Name
- Additional field: Confirm Password
- Different heading: "Create an account"
- Different link text: "Already have an account?"

#### Note
Currently, both login and signup use the same OAuth flow. The backend automatically creates a new user if not exists.

---

### Homepage.jsx

**Path**: `/src/components/Homepage/Homepage.jsx`
**Route**: `/home`
**Protected**: Yes (authentication check)

#### Purpose
Protected dashboard after successful authentication.

#### Props
None

#### State
```javascript
const [user, setUser] = useState(null);
```

#### Hooks

**useEffect - Fetch User Details**:
```javascript
useEffect(() => {
  const fetchUserDetails = async () => {
    const userDetails = await getUserDetails();
    if (userDetails) setUser(userDetails);
  };
  fetchUserDetails();
}, []);
```

#### Key Features

1. **Loading State**
```javascript
if (!user) return <div>Loading...</div>;
```

2. **Welcome Message**
```javascript
<div>Hello {user.username} 👋</div>
<div>Welcome to DeepTrace</div>
```

3. **Action Buttons**
```javascript
// Test a video
<button onClick={() => window.location.href = "/upload-video"}>
  Test A Video
</button>

// Chatbot (external link)
<button onClick={() => window.location.href = "https://..."}>
  Chatbot
</button>

// Logout
<button onClick={() => window.location.href = "http://localhost:5000/logout"}>
  Logout
</button>
```

#### Authentication Check Flow
```
Component mounts
    ↓
useEffect triggers
    ↓
Call getUserDetails()
    ↓
If authenticated:
  - Set user state
  - Render dashboard
If not authenticated:
  - Redirect to /login (handled in API)
```

#### User Object Structure
```javascript
{
  username: "John Doe",
  email: "john@example.com"
}
```

#### Code Example
```javascript
import { useState, useEffect } from "react";
import { getUserDetails } from "../../APIs/userDetails";

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);
    };
    fetchUserDetails();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div>Hello {user.username} 👋</div>
      <button onClick={() => window.location.href = "/upload-video"}>
        Test A Video
      </button>
      <button onClick={() => window.location.href = "http://localhost:5000/logout"}>
        Logout
      </button>
    </div>
  );
}
```

---

### VideoUpload.jsx (prediction.jsx)

**Path**: `/src/prediction.jsx`
**Route**: `/upload-video`
**Protected**: Yes (implicit)

#### Purpose
Video upload interface with tier selection and processing.

#### Props
None

#### State
```javascript
const [file, setFile] = useState(null);                  // Selected video file
const [framesPerVideo, setFramesPerVideo] = useState(50); // Number of frames to analyze
const [result, setResult] = useState(null);               // Analysis result
const [tier, setTier] = useState("tier1");                // Selected tier
const [LoaderActive, setLoaderActive] = useState(false);  // Loading state
```

#### Hooks

**useNavigate**:
```javascript
const navigate = useNavigate();
```

#### Key Features

1. **Tier Selection**
```javascript
<input 
  type="radio" 
  name="tier" 
  value="tier1" 
  onClick={() => setFramesPerVideo(50)}
/>
<label>Basic - Analyze 50 frames</label>
```

**Tier Options**:
| Tier | Frames | Description |
|------|--------|-------------|
| Basic | 50 | Quick analysis |
| Standard | 100 | Balanced |
| Premium | 300+ | Thorough |

2. **File Upload**
```javascript
const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};

<input type="file" onChange={handleFileChange} />
```

3. **Video Preview**
```javascript
{file && (
  <video width="400" controls>
    <source src={URL.createObjectURL(file)} type={file.type} />
  </video>
)}
```

4. **Upload Handler**
```javascript
const handleUpload = async () => {
  if (!file) {
    alert("Please upload a video file.");
    return;
  }

  const formData = new FormData();
  formData.append("video", file);
  formData.append("frames_per_video", framesPerVideo);

  setLoaderActive(true);

  try {
    const response = await fetch("http://127.0.0.1:8080/upload-video", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);

    // Upload to blockchain
    if (data.mean_score < 0.5) {
      uploadVideo(file, "Real");
    } else {
      uploadVideo(file, "Deepfake");
    }

    // Navigate to results
    navigate("/result", { 
      state: { result: data, fileName: file.name } 
    });
  } catch (error) {
    console.error(error);
    alert("An error occurred while uploading the video.");
  } finally {
    setLoaderActive(false);
  }
};
```

5. **Loading Overlay**
```javascript
{LoaderActive && (
  <div className="absolute inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
    <Loader size={64} className="animate-spin" />
    <div>Uploading Video...</div>
  </div>
)}
```

#### Upload Flow
```
User selects file
    ↓
File preview shown
    ↓
User selects tier
    ↓
Click "Upload"
    ↓
Show loader
    ↓
Create FormData
    ↓
POST to Flask ML service
    ↓
Receive result
    ↓
Upload hash to blockchain
    ↓
Navigate to /result with data
```

#### Icons Used
- `ArrowLeft` - Return button
- `Loader` - Loading spinner

#### Blockchain Integration
```javascript
import { uploadVideo } from "./contractDeets.jsx";

// After result
if (data.mean_score < 0.5) {
  uploadVideo(file, "Real");
} else {
  uploadVideo(file, "Deepfake");
}
```

#### Code Structure
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "./contractDeets.jsx";

function VideoUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [framesPerVideo, setFramesPerVideo] = useState(50);
  const [LoaderActive, setLoaderActive] = useState(false);

  const handleUpload = async () => {
    // Upload logic
  };

  return (
    <div>
      {LoaderActive && <LoaderOverlay />}
      
      <div>
        {/* Tier selection */}
        {/* File upload */}
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
}
```

---

### Result.jsx

**Path**: `/src/components/Result.jsx`
**Route**: `/result`
**Protected**: Yes (requires navigation state)

#### Purpose
Display deepfake detection results with visualization.

#### Props
None (receives data via React Router state)

#### State
```javascript
const [result, setResult] = useState(null);
const [vidname, setVidname] = useState(null);
```

#### Hooks

**useLocation**:
```javascript
const location = useLocation();
```

**useEffect - Load Result Data**:
```javascript
React.useEffect(() => {
  setResult(location.state.result);
  setVidname(location.state.fileName);
}, [location.state.result, location.state.fileName]);
```

#### Navigation State Structure
```javascript
{
  result: {
    mean_score: 0.292,
    pred_scores: [0.23, 0.31, 0.19, ...]
  },
  fileName: "video.mp4"
}
```

#### Key Features

1. **Result Header**
```javascript
<div className="text-5xl font-semibold">Results</div>
```

2. **Result Card**
```javascript
<div className="flex gap-32 justify-evenly items-center bg-[#252525]">
  {/* File name */}
  <div>{location.state.fileName}</div>
  
  {/* Label badge */}
  {result.mean_score < 0.5 ? (
    <div className="text-green-500 border-green-600">Real</div>
  ) : (
    <div className="text-[#ff0000] border-[#ff0000]">Deepfake</div>
  )}
  
  {/* Score */}
  <p>{Number(result.mean_score.toFixed(2) * 100)}% Deepfake</p>
  
  {/* Blockchain status */}
  <p>
    <div className="h-2 w-2 bg-green-600 rounded-full"></div> 
    Stored on Blockchain
  </p>
</div>
```

3. **Chart Visualization**
```javascript
<div className="w-[600px]">
  <Chart values={result.pred_scores} />
</div>
```

4. **Action Button**
```javascript
<button onClick={() => window.location.href = "/upload-video"}>
  Upload Another Video
</button>
```

#### Score Interpretation Logic
```javascript
const isReal = result.mean_score < 0.5;
const label = isReal ? "Real" : "Deepfake";
const percentage = Number(result.mean_score.toFixed(2) * 100);
```

#### Visual States

**Real Video**:
- Badge: Green background, green border
- Text: "Real"
- Interpretation: mean_score < 0.5

**Deepfake Video**:
- Badge: Red background, red border
- Text: "Deepfake"
- Interpretation: mean_score >= 0.5

#### Icons Used
- `ArrowRight` - Upload another button
- `InfoIcon` - Info tooltip (commented out)

#### Code Example
```javascript
import React from "react";
import { useLocation } from "react-router-dom";
import Chart from "./Chart";

function Result() {
  const [result, setResult] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    setResult(location.state.result);
  }, [location.state.result]);

  return (
    <div className="h-screen flex justify-center items-center">
      {result && (
        <div>
          <div>Results</div>
          <div>
            {result.mean_score < 0.5 ? (
              <div className="text-green-500">Real</div>
            ) : (
              <div className="text-red-500">Deepfake</div>
            )}
          </div>
          <Chart values={result.pred_scores} />
        </div>
      )}
    </div>
  );
}
```

---

## Reusable Components

### Navbar.jsx

**Path**: `/src/components/Navbar/Navbar.jsx`
**Used In**: Landing page

#### Purpose
Global navigation bar for landing page.

#### Props
None

#### State
None (stateless component)

#### Key Features

1. **Logo/Brand**
```javascript
<a href="#">
  <p className='text-3xl font-semibold'>DeepTrace</p>
</a>
```

2. **Navigation Links** (Desktop only)
```javascript
<ul className="hidden lg:flex">
  <li><a href="#">How it works?</a></li>
  <li><a href="#">API services</a></li>
  <li><a href="#">Browser Extension</a></li>
</ul>
```

3. **Auth Buttons** (Desktop only)
```javascript
<a href="/login">Log In</a>
<a href="/signup">Sign Up</a>
```

4. **Mobile Menu Button** (Not implemented)
```javascript
<div className="lg:hidden">
  <button className="navbar-burger">
    {/* Hamburger SVG */}
  </button>
</div>
```

#### Styling
- Fixed position: `fixed top-0`
- Width: `w-[85%]`
- Flex layout: `flex justify-between items-center`
- High z-index: `z-100`

#### Responsive Behavior
- Mobile: Hidden navigation, hamburger menu
- Desktop: Full navigation, auth buttons

#### Code Structure
```javascript
const Navbar = () => {
  return (
    <nav className="fixed top-0 px-4 py-4 flex justify-between items-center w-[85%]">
      <a href="#">DeepTrace</a>
      
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button className="navbar-burger"></button>
      </div>
      
      {/* Desktop navigation */}
      <ul className="hidden lg:flex">
        <li><a href="#">How it works?</a></li>
        <li><a href="#">API services</a></li>
        <li><a href="#">Browser Extension</a></li>
      </ul>
      
      {/* Auth buttons */}
      <a href="/login">Log In</a>
      <a href="/signup">Sign Up</a>
    </nav>
  )
}
```

---

### Chart.jsx

**Path**: `/src/components/Chart.jsx`
**Used In**: Result page

#### Purpose
Visualize per-frame prediction scores as a line chart.

#### Props
```javascript
{
  values: number[]  // Array of prediction scores (0-1)
}
```

**Example**:
```javascript
<Chart values={[0.23, 0.31, 0.19, 0.45, ...]} />
```

#### State
None (stateless component)

#### Key Features

1. **Chart.js Registration**
```javascript
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

2. **Data Preparation**
```javascript
const labels = values.values.map((_, i) => i+1); // 1-based index
```

3. **Chart Configuration**
```javascript
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

4. **Chart Options**
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

#### Visualization Details

**X-Axis**:
- Represents frame number
- 1-based indexing
- Tick marks every 15 frames

**Y-Axis**:
- Represents prediction score
- Range: 0 (Real) to 1 (Fake)
- Fixed scale for consistency

**Line Style**:
- Color: Semi-transparent white
- Tension: 0.1 (slight curve)
- Points: White circles
- No fill under line

#### Interpretation

**Low values (0-0.3)**: Frame likely real
**Medium values (0.3-0.7)**: Uncertain
**High values (0.7-1.0)**: Frame likely fake

#### Code Example
```javascript
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, ... } from 'chart.js';

ChartJS.register(...);

function Chart(values) {
  const labels = values.values.map((_, i) => i+1);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Values',
      data: values.values,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      pointBackgroundColor: 'rgb(255, 255, 255)',
    }],
  };

  const options = {
    responsive: true,
    scales: {
      x: { min: 1, max: labels.length },
      y: { min: 0, max: 1 },
    },
  };

  return <Line data={data} options={options}/>;
}
```

---

## Utilities

### userDetails.js

**Path**: `/src/APIs/userDetails.js`

#### Purpose
Fetch authenticated user details from backend.

#### Exports
```javascript
export const getUserDetails = async () => { ... }
```

#### Function: getUserDetails()

**Returns**: `Promise<UserDetails | null>`

**UserDetails Type**:
```typescript
{
  username: string;
  email: string;
}
```

#### Implementation
```javascript
import axios from "axios";

export const getUserDetails = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/getUserDetails", 
      { withCredentials: true }
    );
    
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

#### Key Features

1. **Credentials Included**
```javascript
{ withCredentials: true }
```
- Sends session cookies
- Required for authentication

2. **Auto-Redirect**
```javascript
if(response.data === "") {
  window.location.href = "/login";
  return null;
}
```

3. **Error Handling**
```javascript
catch (err) {
  console.error(err);
  return null;
}
```

#### Usage Example
```javascript
const userDetails = await getUserDetails();

if (userDetails) {
  console.log(userDetails.username);
  console.log(userDetails.email);
} else {
  // User not authenticated
}
```

---

### contractDeets.jsx

**Path**: `/src/contractDeets.jsx`

#### Purpose
Ethereum blockchain integration utilities.

#### Exports
```javascript
export { uploadVideo, fetchVideos, loadProvider };
```

#### Global Variables
```javascript
let account = '';           // Connected Ethereum address
let contractGlobal = null;  // Contract instance
```

#### Function: loadProvider()

**Purpose**: Initialize Web3 provider and contract.

```javascript
async function loadProvider() {
  if (window.ethereum) {
    const newProvider = new ethers.providers.Web3Provider(window.ethereum);
    await newProvider.send('eth_requestAccounts', []);
    const signer = newProvider.getSigner();
    account = await signer.getAddress();
    
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const newContract = new ethers.Contract(
      contractAddress, 
      VideoStorage.abi, 
      signer
    );
    contractGlobal = newContract;
  } else {
    alert('MetaMask not installed!');
  }
}
```

**Auto-Called**: Runs on module load
```javascript
await loadProvider();
```

#### Function: uploadVideo()

**Purpose**: Upload video hash to blockchain.

**Signature**:
```javascript
uploadVideo(file: File, result: string) => Promise<void>
```

**Parameters**:
- `file`: Video file object
- `result`: "Real" or "Deepfake"

**Implementation**:
```javascript
const uploadVideo = async (file, result) => {
  if (!contractGlobal || !file) {
    console.error('Contract not loaded');
    return;
  }
  
  // Hash video
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const videoHash = ethers.utils.keccak256(buffer);
  
  // Call contract
  const tx = await contractGlobal.addVideo(videoHash, result);
  await tx.wait();
  
  console.log('Video uploaded successfully');
  alert('Video uploaded successfully');
}
```

**Flow**:
```
File → ArrayBuffer → Buffer → Hash (keccak256) → Contract call → Wait for confirmation
```

#### Function: fetchVideos()

**Purpose**: Retrieve user's uploaded videos from blockchain.

**Signature**:
```javascript
fetchVideos() => Promise<Video[]>
```

**Implementation**:
```javascript
const fetchVideos = async () => {
  await loadProvider();
  
  if (!contractGlobal) {
    console.error('Contract not loaded');
    return;
  }
  
  const newProvider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = newProvider.getSigner();
  const UserAccount = await signer.getAddress();
  
  const videos = await contractGlobal.getUserVideos(UserAccount);
  
  return videos;
};
```

**Usage** (Currently commented out):
```javascript
const videos = await fetchVideos();
console.log("Fetched videos:", videos);
```

#### Smart Contract ABI
```javascript
import VideoStorage from './artifacts/contracts/Upload.sol/VideoStorage.json';
```

**ABI Location**: `src/artifacts/contracts/Upload.sol/VideoStorage.json`

#### Buffer Polyfill
```javascript
import { Buffer } from 'buffer';
window.Buffer = Buffer;
```

Required for browser compatibility with Node.js `Buffer`.

---

## Props & State Reference

### State Management Patterns

#### Local State (useState)
```javascript
// File upload
const [file, setFile] = useState(null);

// Loading states
const [loading, setLoading] = useState(false);

// User data
const [user, setUser] = useState(null);

// Results
const [result, setResult] = useState(null);
```

#### Side Effects (useEffect)
```javascript
// Fetch on mount
useEffect(() => {
  fetchData();
}, []);

// Update on prop change
useEffect(() => {
  processData(prop);
}, [prop]);
```

#### Navigation State (React Router)
```javascript
// Passing state
navigate("/result", { state: { data: value } });

// Receiving state
const location = useLocation();
const data = location.state.data;
```

### Common Props Patterns

#### Children Props
```javascript
// Not currently used, but standard pattern:
<Component>
  {children}
</Component>
```

#### Callback Props
```javascript
// Event handlers
<button onClick={handleClick}>Click</button>

// Custom callbacks
<Component onComplete={handleComplete} />
```

#### Data Props
```javascript
// Passing data
<Chart values={scores} />

// Receiving
function Chart({ values }) {
  return <Line data={values} />;
}
```

---

## Component Patterns

### Container/Presentational Pattern

**Not currently used**, but recommended:

```javascript
// Container (smart component)
function UserContainer() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  return <UserPresenter user={user} />;
}

// Presenter (dumb component)
function UserPresenter({ user }) {
  return <div>{user.username}</div>;
}
```

### Custom Hooks Pattern

**Recommended for future**:

```javascript
// useAuth hook
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getUserDetails()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
}

// Usage
function Homepage() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader />;
  return <div>Hello {user.username}</div>;
}
```

### Compound Components Pattern

**Not currently used**, example:

```javascript
<VideoUpload>
  <VideoUpload.TierSelector />
  <VideoUpload.FileInput />
  <VideoUpload.SubmitButton />
</VideoUpload>
```

---

## Best Practices

### Component Organization

1. **Imports** (top)
2. **Component definition**
3. **State declarations**
4. **useEffect hooks**
5. **Event handlers**
6. **Render logic**
7. **Export**

### State Management

- Use `useState` for local state
- Use `useContext` for shared state (not currently implemented)
- Lift state up when multiple components need it
- Keep state close to where it's used

### Performance

- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for stable function references
- Avoid inline object/array creation in render

### Error Handling

```javascript
try {
  const result = await apiCall();
  setData(result);
} catch (error) {
  console.error(error);
  setError(error.message);
}
```

---

## Conclusion

DeepTrace's component architecture features:

✅ **6 Pages**: Landing, Login, Signup, Homepage, VideoUpload, Result
✅ **2 Reusable Components**: Navbar, Chart
✅ **2 Utilities**: userDetails, contractDeets
✅ **Clear Separation**: Pages, components, utilities
✅ **Modern Patterns**: Hooks, functional components
✅ **Type Safety**: PropTypes (recommended to add)

For more information, see:
- [Frontend Architecture](FRONTEND_ARCHITECTURE.md)
- [Quick Reference](QUICK_REFERENCE.md)

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024

