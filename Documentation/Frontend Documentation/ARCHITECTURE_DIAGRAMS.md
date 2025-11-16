# DeepTrace Frontend - Architecture Diagrams

> Visual representations of the frontend architecture

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Authentication Flow](#authentication-flow)
4. [Video Upload Flow](#video-upload-flow)
5. [Data Flow](#data-flow)
6. [Routing Architecture](#routing-architecture)
7. [State Management](#state-management)
8. [Blockchain Integration](#blockchain-integration)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                 │
│                         (User Interface)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │ Port 5173 (Dev)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      REACT APPLICATION                               │
│                         (Vite + React 18)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                 PRESENTATION LAYER                       │       │
│  │                                                           │       │
│  │  • Landing Page (/)                                      │       │
│  │  • Login/Signup (/login, /signup)                       │       │
│  │  • Homepage (/home)                                      │       │
│  │  • Video Upload (/upload-video)                         │       │
│  │  • Results (/result)                                     │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │               COMPONENT LAYER                            │       │
│  │                                                           │       │
│  │  • Navbar      - Navigation                              │       │
│  │  • Chart       - Data visualization                      │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                INTEGRATION LAYER                         │       │
│  │                                                           │       │
│  │  • APIs/userDetails.js    - Backend API calls           │       │
│  │  • contractDeets.jsx      - Blockchain integration      │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└──────┬──────────────────────────┬───────────────────────┬──────────┘
       │                          │                       │
       │ HTTP + Cookies           │ HTTP                  │ Web3
       │                          │                       │
       ▼                          ▼                       ▼
┌──────────────┐         ┌──────────────┐       ┌──────────────────┐
│   Express    │         │    Flask     │       │    Ethereum      │
│   Backend    │         │  ML Service  │       │   Blockchain     │
│   Port 5000  │         │  Port 8080   │       │  Smart Contract  │
└──────────────┘         └──────────────┘       └──────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App.jsx
│
├── Router
│   │
│   ├── Route: "/"
│   │   └── Landing.jsx
│   │       └── Navbar.jsx
│   │           ├── Logo/Brand
│   │           ├── Navigation Links
│   │           └── Auth Buttons
│   │
│   ├── Route: "/signup"
│   │   └── Signup.jsx
│   │       ├── Logo Section
│   │       ├── Google OAuth Button
│   │       └── Signup Form
│   │           ├── Full Name Input
│   │           ├── Email Input
│   │           ├── Password Input
│   │           ├── Confirm Password Input
│   │           └── Submit Button
│   │
│   ├── Route: "/login"
│   │   └── Login.jsx
│   │       ├── Logo Section
│   │       ├── Google OAuth Button
│   │       └── Login Form
│   │           ├── Email Input
│   │           ├── Password Input
│   │           └── Submit Button
│   │
│   ├── Route: "/home"
│   │   └── Homepage.jsx
│   │       ├── Welcome Message
│   │       ├── Test Video Button
│   │       ├── Chatbot Button
│   │       └── Logout Button
│   │
│   ├── Route: "/upload-video"
│   │   └── VideoUpload.jsx (prediction.jsx)
│   │       ├── Return Button
│   │       ├── Tier Selection
│   │       │   ├── Basic (50 frames)
│   │       │   ├── Standard (100 frames)
│   │       │   └── Premium (300 frames)
│   │       ├── File Upload Area
│   │       │   ├── Drag & Drop Zone
│   │       │   └── Video Preview
│   │       ├── Upload Button
│   │       └── Loading Overlay
│   │
│   └── Route: "/result"
│       └── Result.jsx
│           ├── Results Header
│           ├── Result Card
│           │   ├── File Name
│           │   ├── Label Badge (Real/Deepfake)
│           │   ├── Confidence Score
│           │   └── Blockchain Status
│           ├── Chart.jsx
│           │   └── Line Chart
│           │       ├── X-Axis (Frames)
│           │       └── Y-Axis (Scores)
│           └── Upload Another Button
```

---

## Authentication Flow

### Google OAuth Flow

```
┌──────────────────┐
│   User Action    │
│  (Click Login)   │
└────────┬─────────┘
         │
         ▼
┌───────────────────────────┐
│  Landing/Login Page       │
│  localhost:5173/login     │
└────────┬──────────────────┘
         │
         │ User clicks "Sign in with Google"
         │
         ▼
┌───────────────────────────┐
│  Redirect to Backend      │
│  window.location.href =   │
│  "http://localhost:5000/  │
│   auth/google"            │
└────────┬──────────────────┘
         │
         │ Full page redirect
         │
         ▼
┌───────────────────────────┐
│  Express Backend          │
│  /auth/google             │
│                           │
│  passport.authenticate    │
│  ('google', {             │
│    scope: ['profile',     │
│            'email']       │
│  })                       │
└────────┬──────────────────┘
         │
         │ Redirect to Google
         │
         ▼
┌───────────────────────────┐
│  Google OAuth Server      │
│  accounts.google.com      │
│                           │
│  1. User logs in          │
│  2. Reviews permissions   │
│  3. Grants access         │
└────────┬──────────────────┘
         │
         │ Callback with auth code
         │
         ▼
┌───────────────────────────┐
│  Express Backend          │
│  /auth/google/callback    │
│                           │
│  1. Exchange code for     │
│     access token          │
│  2. Get user profile      │
│  3. Find/Create user in   │
│     MongoDB               │
│  4. Create session        │
│  5. Set session cookie    │
└────────┬──────────────────┘
         │
         │ Redirect with cookie
         │
         ▼
┌───────────────────────────┐
│  Frontend Homepage        │
│  localhost:5173/home      │
│                           │
│  Session cookie stored    │
│  User authenticated       │
└───────────────────────────┘
```

### Session Validation

```
┌──────────────────┐
│  User navigates  │
│   to /home       │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│  Homepage Component Mounts  │
│                              │
│  useEffect(() => {          │
│    fetchUserDetails()       │
│  }, [])                     │
└────────┬────────────────────┘
         │
         │ Call API
         │
         ▼
┌─────────────────────────────┐
│  getUserDetails()           │
│                              │
│  axios.get(                 │
│    'http://localhost:5000/  │
│     getUserDetails',        │
│    { withCredentials: true }│
│  )                          │
└────────┬────────────────────┘
         │
         │ HTTP GET with cookies
         │
         ▼
┌─────────────────────────────┐
│  Express Backend            │
│  /getUserDetails            │
│                              │
│  1. express-session reads   │
│     session cookie          │
│  2. Queries MongoDB         │
│  3. Deserializes user       │
│  4. Checks authentication   │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Authenticated  Not Authenticated
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Return null  │
    │    │ or empty     │
    │    └──────┬───────┘
    │           │
    │           ▼
    │    ┌──────────────┐
    │    │ Redirect to  │
    │    │   /login     │
    │    └──────────────┘
    │
    ▼
┌──────────────────┐
│ Return user data │
│ { username,      │
│   email }        │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend Updates State     │
│                              │
│  setUser(response.data)     │
│                              │
│  Renders: "Hello {username}"│
└─────────────────────────────┘
```

---

## Video Upload Flow

### Complete Upload Process

```
┌──────────────────────────────────────────────────────────┐
│               USER INTERACTION                            │
│                                                            │
│  1. User selects video file                               │
│  2. Chooses analysis tier (50/100/300 frames)            │
│  3. Clicks "Upload" button                                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│            FRONTEND: VideoUpload Component                │
│                                                            │
│  const handleUpload = async () => {                       │
│    setLoaderActive(true);                                 │
│                                                            │
│    const formData = new FormData();                       │
│    formData.append("video", file);                        │
│    formData.append("frames_per_video", framesPerVideo);  │
│                                                            │
│    const response = await fetch(                          │
│      "http://127.0.0.1:8080/upload-video",               │
│      { method: "POST", body: formData }                   │
│    );                                                      │
│  }                                                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ HTTP POST (multipart/form-data)
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         BACKEND: Flask ML Service (Port 8080)             │
│                                                            │
│  @app.route('/upload-video', methods=['POST'])           │
│  def upload_video():                                      │
│    1. Receive video file                                  │
│    2. Save temporarily                                    │
│    3. Extract frames                                      │
│    4. Detect faces (BlazeFace)                           │
│    5. Preprocess faces                                    │
│    6. Run ML inference (EfficientNet)                    │
│    7. Calculate scores                                    │
│    8. Return results                                      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Response JSON
                     │ { mean_score: 0.292,
                     │   pred_scores: [...] }
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│         FRONTEND: Process Response                        │
│                                                            │
│  const data = await response.json();                      │
│  setResult(data);                                         │
│                                                            │
│  if (data.mean_score < 0.5) {                            │
│    uploadVideo(file, "Real");                            │
│  } else {                                                 │
│    uploadVideo(file, "Deepfake");                        │
│  }                                                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Call blockchain function
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│          BLOCKCHAIN: Smart Contract                       │
│                                                            │
│  const uploadVideo = async (file, result) => {           │
│    const arrayBuffer = await file.arrayBuffer();         │
│    const buffer = Buffer.from(arrayBuffer);              │
│    const videoHash = ethers.utils.keccak256(buffer);    │
│                                                            │
│    const tx = await contract.addVideo(                   │
│      videoHash,                                           │
│      result                                               │
│    );                                                      │
│    await tx.wait();                                       │
│  }                                                         │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Transaction confirmed
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│          FRONTEND: Navigate to Results                    │
│                                                            │
│  navigate("/result", {                                    │
│    state: {                                               │
│      result: data,                                        │
│      fileName: file.name                                  │
│    }                                                       │
│  });                                                       │
│                                                            │
│  setLoaderActive(false);                                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│             FRONTEND: Results Page                        │
│                                                            │
│  • Display file name                                      │
│  • Show Real/Deepfake label                              │
│  • Display confidence percentage                          │
│  • Show "Stored on Blockchain" status                    │
│  • Render frame-by-frame chart                           │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      APP INITIALIZATION                      │
│                                                               │
│  main.jsx                                                    │
│    └─> createRoot(document.getElementById('root'))          │
│         └─> <App />                                          │
│              └─> <Router>                                    │
│                   └─> <Routes>                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     ROUTE MATCHING                           │
│                                                               │
│  URL: "/"                → Landing Component                 │
│  URL: "/login"           → Login Component                   │
│  URL: "/home"            → Homepage Component                │
│  URL: "/upload-video"    → VideoUpload Component            │
│  URL: "/result"          → Result Component                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  COMPONENT LIFECYCLE                         │
│                                                               │
│  Component Mounts                                            │
│       ↓                                                       │
│  Initialize State                                            │
│    const [data, setData] = useState(null);                  │
│       ↓                                                       │
│  Run Effects                                                 │
│    useEffect(() => {                                         │
│      fetchData();                                            │
│    }, []);                                                    │
│       ↓                                                       │
│  Handle User Interactions                                    │
│    onClick, onChange, onSubmit                               │
│       ↓                                                       │
│  Update State                                                │
│    setData(newData);                                         │
│       ↓                                                       │
│  Re-render                                                   │
└────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Video Upload

```
┌──────────────┐
│ VideoUpload  │
│  Component   │
└──────┬───────┘
       │
       │ State:
       │ • file: null
       │ • framesPerVideo: 50
       │ • LoaderActive: false
       │ • result: null
       │
       ▼
┌────────────────────────────┐
│  User Interaction          │
│  • Select file             │
│    setFile(selectedFile)   │
│  • Choose tier             │
│    setFramesPerVideo(100)  │
│  • Click upload            │
│    handleUpload()          │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  handleUpload()            │
│  1. setLoaderActive(true)  │
│  2. Create FormData        │
│  3. fetch() to ML service  │
│  4. await response         │
│  5. setResult(data)        │
│  6. uploadVideo()          │
│  7. navigate() to results  │
│  8. setLoaderActive(false) │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Result Component          │
│  Receives via location.    │
│  state:                    │
│  • result                  │
│  • fileName                │
│                            │
│  useEffect:                │
│  setResult(location.state. │
│           result)          │
│  setVidname(location.state.│
│            fileName)       │
└────────────────────────────┘
```

---

## Routing Architecture

### React Router Structure

```
┌────────────────────────────────────────────────────────┐
│                  BrowserRouter                         │
│                                                         │
│  ┌──────────────────────────────────────────────┐    │
│  │              Routes                           │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  Route: path="/"                     │   │    │
│  │  │  element={<Landing />}               │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  Route: path="/login"                │   │    │
│  │  │  element={<Login />}                 │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  Route: path="/signup"               │   │    │
│  │  │  element={<Signup />}                │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  Route: path="/home"                 │   │    │
│  │  │  element={<Homepage />}              │   │    │
│  │  │  (Protected via auth check)          │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  Route: path="/upload-video"         │   │    │
│  │  │  element={<VideoUpload />}           │   │    │
│  │  │  (Protected via auth check)          │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │                                                │    │
│  │  ┌──────────────────────────────────────┐   │    │
│  │  │  Route: path="/result"               │   │    │
│  │  │  element={<Result />}                │   │    │
│  │  │  (Requires navigation state)         │   │    │
│  │  └──────────────────────────────────────┘   │    │
│  │                                                │    │
│  └──────────────────────────────────────────────┘    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Navigation Methods

```
┌─────────────────────────────────────────────────────┐
│              Navigation Methods                      │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Programmatic │  │   Links      │  │  Window      │
│  Navigation   │  │   <a href>   │  │  Location    │
└───────┬───────┘  └───────┬──────┘  └───────┬──────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ navigate()   │  │ <a href=     │  │ window.      │
│ from         │  │   "/home">   │  │ location.href│
│ useNavigate()│  │              │  │ = "/login"   │
│              │  │ Client-side  │  │              │
│ With state:  │  │ routing      │  │ Full page    │
│ navigate(    │  │              │  │ redirect     │
│   "/result", │  │              │  │              │
│   { state:   │  │              │  │ Use for:     │
│     { data } }│  │              │  │ • External   │
│ )            │  │              │  │ • Backend    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## State Management

### Local State Pattern

```
┌──────────────────────────────────────────────────┐
│             Component with State                  │
│                                                    │
│  function MyComponent() {                        │
│    // Local State                                │
│    const [data, setData] = useState(null);       │
│    const [loading, setLoading] = useState(false);│
│                                                    │
│    // Side Effects                               │
│    useEffect(() => {                             │
│      fetchData().then(setData);                  │
│    }, []);                                        │
│                                                    │
│    // Event Handlers                             │
│    const handleClick = () => {                   │
│      setData(newData);                           │
│    };                                             │
│                                                    │
│    // Conditional Rendering                      │
│    if (loading) return <Loader />;               │
│    if (!data) return <Empty />;                  │
│                                                    │
│    return <div>{data}</div>;                     │
│  }                                                │
└──────────────────────────────────────────────────┘
```

### State Lifting Pattern

```
┌────────────────────────────────────────┐
│           Parent Component             │
│                                         │
│  const [sharedData, setSharedData]    │
│         = useState(null);              │
│                                         │
│  ┌──────────────┐  ┌──────────────┐  │
│  │   Child A    │  │   Child B    │  │
│  │              │  │              │  │
│  │  Receives:   │  │  Receives:   │  │
│  │  sharedData  │  │  sharedData  │  │
│  │              │  │              │  │
│  │  Can update: │  │  Can update: │  │
│  │  setShared   │  │  setShared   │  │
│  │  Data()      │  │  Data()      │  │
│  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────┘
```

---

## Blockchain Integration

### Web3 Provider Flow

```
┌────────────────────────────────────────────────────┐
│               Page Load/Module Load                 │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│          contractDeets.jsx executed                 │
│                                                      │
│  await loadProvider();                              │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│            Check for MetaMask                       │
│                                                      │
│  if (window.ethereum) { ... }                       │
└────────┬───────────────────────────────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Found        Not Found
    │          │
    │          ▼
    │    ┌──────────────┐
    │    │ Alert:       │
    │    │ "Install     │
    │    │  MetaMask!"  │
    │    └──────────────┘
    │
    ▼
┌──────────────────────────────────────────────────┐
│     Initialize Web3Provider                      │
│                                                   │
│  const provider = new ethers.providers.          │
│    Web3Provider(window.ethereum);                │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│      Request Account Access                      │
│                                                   │
│  await provider.send('eth_requestAccounts', []); │
│                                                   │
│  MetaMask Popup:                                 │
│  "Connect to DeepTrace?"                         │
│  [Cancel] [Connect]                              │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│         Get User's Ethereum Address              │
│                                                   │
│  const signer = provider.getSigner();            │
│  account = await signer.getAddress();            │
│  // account = "0x1234...5678"                    │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│        Initialize Smart Contract                 │
│                                                   │
│  const contract = new ethers.Contract(           │
│    contractAddress,                              │
│    VideoStorage.abi,                             │
│    signer                                         │
│  );                                               │
│                                                   │
│  contractGlobal = contract;                      │
└──────────────────────────────────────────────────┘
```

### Smart Contract Interaction

```
┌──────────────────────────────────────────────────┐
│          User Uploads Video Result               │
│                                                   │
│  uploadVideo(file, "Real")                       │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│            Hash Video File                       │
│                                                   │
│  1. const arrayBuffer = await file.arrayBuffer();│
│  2. const buffer = Buffer.from(arrayBuffer);     │
│  3. const hash = ethers.utils.keccak256(buffer); │
│                                                   │
│  hash = "0xabcd...1234"                          │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│       Call Smart Contract Function               │
│                                                   │
│  const tx = await contract.addVideo(             │
│    hash,     // Video hash                       │
│    result    // "Real" or "Deepfake"            │
│  );                                               │
│                                                   │
│  MetaMask Popup:                                 │
│  "Sign transaction?"                             │
│  Gas Fee: 0.0001 ETH                             │
│  [Reject] [Confirm]                              │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│      Wait for Transaction Confirmation           │
│                                                   │
│  await tx.wait();                                │
│                                                   │
│  Transaction mined in block #123456              │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│              Success!                            │
│                                                   │
│  • Video hash stored on blockchain               │
│  • Immutable record created                      │
│  • Timestamp recorded                            │
│  • Associated with user's address                │
│                                                   │
│  alert("Video uploaded successfully");           │
└──────────────────────────────────────────────────┘
```

---

## Conclusion

These diagrams illustrate:
- ✅ System architecture and component hierarchy
- ✅ Authentication and session management flow
- ✅ Video upload and processing pipeline
- ✅ Data flow and state management
- ✅ Routing structure
- ✅ Blockchain integration process

For detailed code explanations, see:
- [Frontend Architecture](FRONTEND_ARCHITECTURE.md)
- [Component Reference](COMPONENT_REFERENCE.md)

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024

