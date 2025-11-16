# DeepTrace Frontend Deployment Guide

> Complete deployment instructions for the DeepTrace React frontend

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Building for Production](#building-for-production)
5. [Deployment Options](#deployment-options)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **Node.js** | 18.x | 20.x LTS |
| **npm** | 9.x | 10.x |
| **RAM** | 4 GB | 8 GB |
| **Disk Space** | 2 GB | 5 GB |

### Software Requirements

- Node.js and npm
- Git
- MetaMask browser extension (for blockchain features)
- Modern web browser (Chrome, Firefox, Edge)

### Checking Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher

# Check Git
git --version
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/deeptrace.git
cd deeptrace
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This installs:
# - React 18.3.1
# - Vite 5.4.1
# - Tailwind CSS 3.4.10
# - ethers.js 5.7.0
# - Chart.js 4.4.4
# - And more...
```

**Installation Time**: ~2-3 minutes depending on internet speed

### 3. Environment Setup

Create `.env.local` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# ML Service URL
VITE_ML_API_URL=http://localhost:8080

# Contract Address (if different)
VITE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Note**: Vite requires environment variables to be prefixed with `VITE_`

### 4. Start Development Server

```bash
npm run dev
```

**Output**:
```
VITE v5.4.1  ready in 347 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

**Features**:
- Hot Module Replacement (HMR)
- Fast Refresh
- Instant updates
- Port: 5173

### 5. Verify Setup

Open `http://localhost:5173` in your browser.

**Checklist**:
- [ ] Landing page loads
- [ ] Animated background works
- [ ] Navigation buttons work
- [ ] Login redirects to backend
- [ ] No console errors

---

## Environment Configuration

### Environment Variables

#### Development (.env.local)

```env
# API Endpoints
VITE_API_URL=http://localhost:5000
VITE_ML_API_URL=http://localhost:8080

# Blockchain
VITE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_CHAIN_ID=31337  # Hardhat local network

# Feature Flags
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_ANALYTICS=false
```

#### Production (.env.production)

```env
# API Endpoints
VITE_API_URL=https://api.deeptrace.com
VITE_ML_API_URL=https://ml.deeptrace.com

# Blockchain
VITE_CONTRACT_ADDRESS=0x...  # Production contract address
VITE_CHAIN_ID=1  # Ethereum Mainnet

# Feature Flags
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### Using Environment Variables

```javascript
// In your code
const API_URL = import.meta.env.VITE_API_URL;
const ML_URL = import.meta.env.VITE_ML_API_URL;

// Example
fetch(`${API_URL}/getUserDetails`, {
  credentials: 'include'
});
```

### Update Hardcoded URLs

**Current**: Hardcoded URLs in components

```javascript
// Bad: Hardcoded
window.location.href = "http://localhost:5000/auth/google";
fetch("http://127.0.0.1:8080/upload-video", { ... });
```

**Better**: Use environment variables

```javascript
// Good: Environment variables
const API_URL = import.meta.env.VITE_API_URL;
window.location.href = `${API_URL}/auth/google`;

const ML_URL = import.meta.env.VITE_ML_API_URL;
fetch(`${ML_URL}/upload-video`, { ... });
```

**Recommended Changes**:

Create `src/config.js`:
```javascript
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  mlUrl: import.meta.env.VITE_ML_API_URL || 'http://localhost:8080',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
  chainId: import.meta.env.VITE_CHAIN_ID,
};
```

Usage:
```javascript
import { config } from './config';

fetch(`${config.mlUrl}/upload-video`, { ... });
```

---

## Building for Production

### 1. Build Command

```bash
npm run build
```

**Output**:
```
vite v5.4.1 building for production...
✓ 234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-D7kc8oPz.css   45.23 kB │ gzip: 10.11 kB
dist/assets/index-BsUaF3Qh.js   245.67 kB │ gzip: 78.90 kB
✓ built in 2.34s
```

### 2. Build Output

```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Bundled JavaScript
│   ├── index-[hash].css    # Bundled CSS
│   ├── deeptrace_logo-[hash].png
│   └── ...                 # Other assets
└── vite.svg                # Vite logo
```

### 3. Build Optimization

**Vite automatically**:
- Minifies JavaScript and CSS
- Tree-shakes unused code
- Code splits by route
- Optimizes images
- Generates source maps

**Manual Optimizations**:

#### Code Splitting

```javascript
import { lazy, Suspense } from 'react';

const Homepage = lazy(() => import('./components/Homepage/Homepage'));
const VideoUpload = lazy(() => import('./prediction'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/home" element={<Homepage />} />
          <Route path="/upload-video" element={<VideoUpload />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

#### Image Optimization

```bash
# Install image optimizer
npm install -D vite-plugin-imagemin

# Update vite.config.js
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      svgo: { plugins: [{ removeViewBox: false }] }
    })
  ]
});
```

### 4. Preview Production Build

```bash
npm run preview
```

Opens `http://localhost:4173` with production build.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel**:
- Zero configuration
- Automatic deployments
- CDN included
- Serverless functions support
- Free for hobby projects

#### Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Configuration

Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Custom Domain

```bash
vercel --prod
vercel alias set your-deployment.vercel.app deeptrace.com
```

---

### Option 2: Netlify

**Why Netlify**:
- Simple deployment
- Automatic HTTPS
- Form handling
- Free tier generous

#### Setup

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

#### Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Option 3: GitHub Pages

**Why GitHub Pages**:
- Free
- Integrated with GitHub
- Simple for static sites

#### Setup

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

#### Configuration

Update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/deeptrace/', // Repository name
  plugins: [react()],
});
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### Option 4: AWS S3 + CloudFront

**Why AWS**:
- Highly scalable
- Full control
- Global CDN
- Integration with other AWS services

#### Setup

```bash
# Install AWS CLI
# https://aws.amazon.com/cli/

# Configure AWS
aws configure

# Build
npm run build

# Create S3 bucket
aws s3 mb s3://deeptrace-frontend

# Enable static website hosting
aws s3 website s3://deeptrace-frontend/ \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://deeptrace-frontend/ \
  --delete \
  --cache-control "public, max-age=31536000"

# Make public
aws s3api put-bucket-policy \
  --bucket deeptrace-frontend \
  --policy file://bucket-policy.json
```

**bucket-policy.json**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::deeptrace-frontend/*"
    }
  ]
}
```

#### CloudFront CDN

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name deeptrace-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

---

### Option 5: Docker + Nginx

**Why Docker**:
- Consistent environments
- Easy deployment
- Scalable

#### Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Build and Run

```bash
# Build image
docker build -t deeptrace-frontend .

# Run container
docker run -p 80:80 deeptrace-frontend
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Performance Optimization

### 1. Code Splitting

```javascript
// Route-based splitting
const Homepage = lazy(() => import('./components/Homepage/Homepage'));

// Component-based splitting
const Chart = lazy(() => import('./components/Chart'));
```

### 2. Bundle Analysis

```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Update vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
});

# Build and analyze
npm run build
```

### 3. Image Optimization

```bash
# Convert images to WebP
npm install -D @squoosh/lib

# Or use online tools:
# - https://squoosh.app/
# - https://tinypng.com/
```

### 4. Lazy Loading Images

```javascript
<img 
  src={logo} 
  loading="lazy" 
  alt="DeepTrace Logo" 
/>
```

### 5. Remove Unused Dependencies

```bash
# Analyze dependencies
npm install -D depcheck
npx depcheck

# Remove unused
npm uninstall unused-package
```

### 6. Enable Compression

**Vite** (development):
```javascript
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ]
});
```

**Nginx** (production):
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
gzip_comp_level 6;
```

### 7. Caching Strategy

**index.html**: No cache (always check for updates)
```
Cache-Control: no-cache
```

**Assets**: Long cache (immutable)
```
Cache-Control: public, max-age=31536000, immutable
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_ML_API_URL: ${{ secrets.ML_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d deeptrace.com -d www.deeptrace.com

# Auto-renewal
sudo certbot renew --dry-run
```

### CloudFlare (Free)

1. Add domain to CloudFlare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Auto Minify"

---

## Monitoring & Analytics

### Google Analytics

```javascript
// In index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (Error Tracking)

```bash
npm install @sentry/react
```

```javascript
// In main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## Troubleshooting

### Issue 1: "Cannot find module 'buffer'"

**Solution**:
```bash
npm install buffer

# Add to vite.config.js
resolve: {
  alias: {
    buffer: 'buffer/',
  }
}
```

### Issue 2: "Module not found: ethers"

**Solution**:
```bash
npm install ethers@5.7.0
```

### Issue 3: "Blank page after deployment"

**Solution**:
Check `base` in `vite.config.js`:
```javascript
export default defineConfig({
  base: '/',  // For root domain
  // base: '/deeptrace/',  // For subdomain
});
```

### Issue 4: "404 on refresh"

**Solution**:
Configure server rewrite rules:

**Nginx**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue 5: "MetaMask not detected"

**Solution**:
```javascript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask!');
  window.open('https://metamask.io/download/', '_blank');
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Environment variables configured
- [ ] API URLs updated for production
- [ ] Contract address updated
- [ ] Images optimized
- [ ] Dependencies updated

### Post-Deployment

- [ ] Landing page loads
- [ ] All routes work
- [ ] Authentication works
- [ ] Video upload works
- [ ] Results display correctly
- [ ] Chart renders
- [ ] MetaMask connection works
- [ ] No 404 errors
- [ ] HTTPS enabled
- [ ] Analytics tracking
- [ ] Error monitoring active

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 300KB (gzipped)

---

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use secrets management
   - Rotate secrets regularly

2. **HTTPS**:
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use HSTS headers

3. **Content Security Policy**:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

4. **Secure Headers**:
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

---

## Conclusion

DeepTrace frontend can be deployed to various platforms:

✅ **Vercel**: Easiest, recommended for quick deployment
✅ **Netlify**: Great alternative, generous free tier
✅ **GitHub Pages**: Free, simple for static sites
✅ **AWS**: Scalable, full control
✅ **Docker**: Consistent, portable

Choose based on:
- Budget
- Scalability needs
- Team expertise
- Integration requirements

For more information, see:
- [Frontend Architecture](FRONTEND_ARCHITECTURE.md)
- [Component Reference](COMPONENT_REFERENCE.md)

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024

