# DeepTrace Frontend - Quick Reference Guide

> Fast reference for developers working with DeepTrace's frontend

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Access: `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── APIs/
│   └── userDetails.js          # User authentication API
├── components/
│   ├── Chart.jsx               # Line chart visualization
│   ├── Navbar/Navbar.jsx       # Navigation bar
│   ├── Homepage/Homepage.jsx   # Dashboard
│   ├── Login/Login.jsx         # Login page
│   ├── Signup/Signup.jsx       # Signup page
│   └── Result.jsx              # Results display
├── assets/                     # Images, logos
├── artifacts/                  # Smart contract ABI
├── App.jsx                     # Main app + routing
├── Landing.jsx                 # Landing page
├── prediction.jsx              # Video upload
└── contractDeets.jsx           # Blockchain utilities
```

---

## 🗺️ Routes

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | Landing | No | Landing page |
| `/login` | Login | No | User login |
| `/signup` | Signup | No | User registration |
| `/home` | Homepage | Yes | Dashboard |
| `/upload-video` | VideoUpload | Yes | Video upload |
| `/result` | Result | Yes | Results page |

---

## 🔐 Authentication Flow

```
User visits /login
    ↓
Click "Sign in with Google"
    ↓
Redirect to Express /auth/google
    ↓
Google OAuth consent
    ↓
Backend processes & creates session
    ↓
Redirect to /home
```

**Check Auth**:
```javascript
import { getUserDetails } from './APIs/userDetails';

const user = await getUserDetails();
if (user) {
  console.log(user.username);
}
```

---

## 📤 Video Upload Flow

```
Select file → Choose tier → Click Upload
    ↓
POST to Flask ML service (port 8080)
    ↓
Receive prediction scores
    ↓
Upload hash to blockchain
    ↓
Navigate to /result with data
```

**Code**:
```javascript
const formData = new FormData();
formData.append("video", file);
formData.append("frames_per_video", 100);

const response = await fetch("http://127.0.0.1:8080/upload-video", {
  method: "POST",
  body: formData,
});

const data = await response.json();
// { mean_score: 0.292, pred_scores: [...] }
```

---

## ⛓️ Blockchain Integration

```javascript
import { uploadVideo, fetchVideos } from './contractDeets';

// Upload video hash
await uploadVideo(file, "Real");  // or "Deepfake"

// Fetch user's videos
const videos = await fetchVideos();
```

**Contract Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

---

## 🎨 Styling

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#1e1e1e` | Main background |
| Card | `#252525` | Card backgrounds |
| Text | `#f1f3f5` | Primary text |
| Accent | `#1473E6` | Links |
| Success | `#00ff00` | Real videos |
| Error | `#ff0000` | Deepfakes |

### Common Classes

```javascript
// Buttons
<button className="py-2.5 px-5 bg-[#f1f3f5] hover:bg-[#ddd] text-gray-900 font-semibold rounded-full">

// Input
<input className="px-4 py-2.5 bg-[#1e1e1e] rounded-full border border-[#f1f3f515]" />

// Card
<div className="bg-[#252525] px-12 py-16 rounded-[20px]">
```

---

## 🛠️ Common Commands

### Development

```bash
# Start dev server
npm run dev

# Start with specific port
npm run dev -- --port 3000

# Clear cache and restart
rm -rf node_modules/.vite && npm run dev
```

### Building

```bash
# Production build
npm run build

# Build with source maps
npm run build -- --sourcemap

# Analyze bundle
npm run build -- --mode analyze
```

### Linting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 🔧 Configuration Files

### `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer/',
    }
  }
})
```

### `tailwind.config.js`

```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### `package.json` Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

---

## 📊 State Management

### useState Examples

```javascript
// File state
const [file, setFile] = useState(null);

// Loading state
const [loading, setLoading] = useState(false);

// User state
const [user, setUser] = useState(null);

// Result state
const [result, setResult] = useState(null);
```

### useEffect Examples

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

### React Router

```javascript
import { useNavigate, useLocation } from 'react-router-dom';

// Navigate
const navigate = useNavigate();
navigate('/home');

// With state
navigate('/result', { state: { data: value } });

// Access state
const location = useLocation();
const data = location.state.data;
```

---

## 🔌 API Calls

### User Details

```javascript
import axios from 'axios';

const response = await axios.get(
  'http://localhost:5000/getUserDetails',
  { withCredentials: true }
);

// Response: { username: "John", email: "john@example.com" }
```

### Video Upload

```javascript
const formData = new FormData();
formData.append('video', file);
formData.append('frames_per_video', 100);

const response = await fetch('http://127.0.0.1:8080/upload-video', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

### OAuth Redirect

```javascript
// Login with Google
window.location.href = 'http://localhost:5000/auth/google';

// Logout
window.location.href = 'http://localhost:5000/logout';
```

---

## 📈 Chart Component

```javascript
import Chart from './components/Chart';

<Chart values={[0.23, 0.31, 0.19, 0.45, ...]} />
```

**Props**:
- `values`: Array of numbers (0-1)

**Renders**: Line chart with frame numbers on X-axis, scores on Y-axis

---

## 🎯 Icons

### Lucide React

```javascript
import { ArrowRight, ArrowLeft, Loader, InfoIcon } from 'lucide-react';

<ArrowRight size={20} />
<Loader size={64} className="animate-spin" />
```

### React Icons

```javascript
import { FcGoogle } from 'react-icons/fc';

<FcGoogle className='scale-[1.5]'/>
```

---

## 🐛 Common Issues & Fixes

### "Cannot find module 'buffer'"

```bash
npm install buffer

# Add to vite.config.js
resolve: {
  alias: {
    buffer: 'buffer/',
  }
}
```

### "Blank page after build"

Check `vite.config.js`:
```javascript
export default defineConfig({
  base: '/',  // For root domain
});
```

### "404 on page refresh"

Configure server rewrite:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### "MetaMask not detected"

```javascript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask!');
}
```

### "CORS error"

Backend must allow:
```javascript
// Express backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

Frontend must send:
```javascript
fetch(url, {
  credentials: 'include'  // Send cookies
});
```

---

## 📦 Dependencies

### Core

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.1"
}
```

### UI & Visualization

```json
{
  "chart.js": "^4.4.4",
  "react-chartjs-2": "^5.2.0",
  "lucide-react": "^0.438.0",
  "react-icons": "^5.3.0"
}
```

### Blockchain

```json
{
  "ethers": "^5.7.0",
  "buffer": "^6.0.3"
}
```

### HTTP

```json
{
  "axios": "^1.7.7"
}
```

### Build Tools

```json
{
  "vite": "^5.4.1",
  "@vitejs/plugin-react-swc": "^3.5.0",
  "tailwindcss": "^3.4.10"
}
```

---

## 🔐 Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:5000
VITE_ML_API_URL=http://localhost:8080
VITE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Usage**:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Pixels | Tailwind Class |
|------------|--------|----------------|
| Mobile | 0-639px | (default) |
| Tablet | 640-1023px | `sm:` |
| Laptop | 1024-1279px | `lg:` |
| Desktop | 1280px+ | `xl:` |

**Example**:
```javascript
<button className="hidden lg:inline-block">
  {/* Hidden on mobile, visible on laptop+ */}
</button>
```

---

## 🎨 Animations

### Tailwind Utilities

```javascript
// Spin
<Loader className="animate-spin" />

// Pulse
<div className="animate-pulse">Loading...</div>

// Bounce
<div className="animate-bounce">↓</div>
```

### Custom Animation

```css
/* App.css */
@keyframes pulseGlow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.circle1 {
  animation: pulseGlow 5s infinite ease-in-out;
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Landing page loads
- [ ] Login with Google works
- [ ] Homepage shows user info
- [ ] Video upload accepts file
- [ ] Tier selection changes frames
- [ ] Upload shows loader
- [ ] Result page displays scores
- [ ] Chart renders correctly
- [ ] Logout works
- [ ] MetaMask connection works

---

## 🚀 Deployment

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Quick Deploy to Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 📊 Performance

### Lighthouse Targets

| Metric | Target | Current |
|--------|--------|---------|
| Performance | > 90 | TBD |
| Accessibility | > 90 | TBD |
| Best Practices | > 90 | TBD |
| SEO | > 90 | TBD |

### Bundle Size

```bash
# After build
ls -lh dist/assets/

# Target: < 300KB gzipped
```

---

## 🔍 Debugging

### React DevTools

```bash
# Install browser extension
# Chrome: React Developer Tools
# Firefox: React DevTools
```

### Console Logs

```javascript
// Conditional logging
if (import.meta.env.DEV) {
  console.log('Debug:', data);
}
```

### Network Tab

Check:
- API calls succeed (200 status)
- Correct request payloads
- Response data format
- CORS headers present

---

## 📝 Code Snippets

### Fetch with Auth

```javascript
const response = await fetch(url, {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### FormData Upload

```javascript
const formData = new FormData();
formData.append('video', file);
formData.append('frames_per_video', 100);

await fetch(url, {
  method: 'POST',
  body: formData
});
```

### Navigate with State

```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/result', { 
  state: { result: data, fileName: file.name } 
});
```

### Protected Route Pattern

```javascript
const [user, setUser] = useState(null);

useEffect(() => {
  getUserDetails().then(setUser);
}, []);

if (!user) return <div>Loading...</div>;

return <div>Welcome {user.username}</div>;
```

---

## 🎯 Best Practices

### Component Structure

```javascript
// 1. Imports
import { useState, useEffect } from 'react';

// 2. Component
function MyComponent() {
  // 3. State
  const [data, setData] = useState(null);
  
  // 4. Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return <div>...</div>;
}

// 7. Export
export default MyComponent;
```

### Error Handling

```javascript
try {
  const result = await apiCall();
  setData(result);
} catch (error) {
  console.error(error);
  alert('An error occurred');
}
```

### Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false);
  }
};

if (loading) return <Loader />;
```

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| **React Docs** | https://react.dev/ |
| **Vite Docs** | https://vitejs.dev/ |
| **Tailwind Docs** | https://tailwindcss.com/ |
| **React Router** | https://reactrouter.com/ |
| **Chart.js** | https://www.chartjs.org/ |
| **ethers.js** | https://docs.ethers.org/ |
| **Lucide Icons** | https://lucide.dev/ |

---

## 💡 Pro Tips

1. **Use environment variables** for API URLs
2. **Enable React DevTools** for debugging
3. **Check Network tab** for API issues
4. **Use `console.log`** sparingly in production
5. **Test in incognito** to simulate logged-out state
6. **Clear cache** if seeing stale data
7. **Check MetaMask** network matches contract
8. **Use `?.` optional chaining** to prevent null errors
9. **Destructure props** for cleaner code
10. **Keep components small** (< 200 lines)

---

## 📞 Getting Help

### Check These First

1. Console errors
2. Network tab
3. React DevTools
4. MetaMask logs

### Documentation

- [Frontend Architecture](FRONTEND_ARCHITECTURE.md)
- [Component Reference](COMPONENT_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

### Common Errors

| Error | Solution |
|-------|----------|
| Cannot find module | `npm install <module>` |
| CORS error | Check backend CORS config |
| 404 on refresh | Configure server rewrites |
| Blank page | Check `vite.config.js` base |

---

**Last Updated**: November 16, 2024
**Version**: 1.0

For detailed information, see [Frontend Architecture](FRONTEND_ARCHITECTURE.md)

