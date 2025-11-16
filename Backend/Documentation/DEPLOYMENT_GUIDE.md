# DeepTrace Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Cloud Deployment](#cloud-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 8 GB | 16+ GB |
| **Storage** | 10 GB | 50+ GB |
| **OS** | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest versions |

### Software Requirements

#### Node.js Backend
- Node.js: v18.x or higher
- npm: v9.x or higher
- MongoDB: v6.0 or higher (or MongoDB Atlas account)

#### Python ML Service
- Python: 3.8, 3.9, or 3.10
- pip: Latest version
- CUDA (optional): 11.8+ for GPU support

#### Additional Tools
- Git: For version control
- ExifTool: For metadata operations (optional)
- PM2: For process management (production)

### Checking Prerequisites

```bash
# Check Node.js
node --version  # Should be v18.x+

# Check npm
npm --version   # Should be 9.x+

# Check Python
python --version  # Should be 3.8-3.10

# Check pip
pip --version

# Check MongoDB (if local)
mongod --version

# Check Git
git --version

# Check CUDA (optional)
nvidia-smi
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/deeptrace.git
cd deeptrace
```

### 2. Node.js Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Install additional dependencies (if not in package.json)
npm install express-session passport passport-google-oauth20 dotenv

# Create .env file
touch .env
```

Edit `.env`:
```env
SESSION_SECRET=your_random_secret_here_min_32_chars
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
NODE_ENV=development
PORT=5000
```

**Generate Session Secret**:
```bash
# Linux/Mac
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Windows PowerShell
[System.Convert]::ToBase64String((1..32|%{Get-Random -Min 0 -Max 256}))
```

### 3. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster
4. Database Access: Add user with password
5. Network Access: Add IP (0.0.0.0/0 for dev, specific IPs for prod)
6. Get connection string: `mongodb+srv://...`
7. Add to `.env` as `MONGODB_URI`

#### Option B: Local MongoDB

```bash
# macOS (with Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Windows
# Download from mongodb.com and install
# Start MongoDB service from Services app
```

Connection string for local: `mongodb://localhost:27017/DeepTrace`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized JavaScript origins:
   - `http://localhost:5000`
   - `http://localhost:5173`
7. Authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
8. Copy Client ID and Client Secret to `.env`

### 5. Python ML Service Setup

```bash
# Navigate to models directory
cd ../models

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install PyTorch (CPU version)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Or GPU version (if CUDA available)
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install TensorFlow
pip install tensorflow

# Install other dependencies
pip install flask flask-cors
pip install opencv-python pillow
pip install numpy scipy matplotlib
pip install scikit-learn
pip install efficientnet-pytorch
pip install tensorflow-addons
pip install keras-vit

# Or create requirements.txt
cat > requirements.txt << EOF
torch
torchvision
torchaudio
tensorflow>=2.10.0
tensorflow-addons
flask>=2.3.0
flask-cors>=4.0.0
opencv-python>=4.7.0
pillow>=9.5.0
numpy>=1.23.0
scipy>=1.10.0
matplotlib>=3.7.0
scikit-learn>=1.2.0
efficientnet-pytorch>=0.7.0
keras-vit>=0.1.0
EOF

pip install -r requirements.txt
```

### 6. Download Pre-trained Weights

The BlazeFace weights should be automatically downloaded. If not:

```bash
cd models/icpr2020dfdc/blazeface

# Download BlazeFace weights
wget https://github.com/hollance/BlazeFace-PyTorch/raw/master/blazeface.pth

# Download anchors
wget https://github.com/hollance/BlazeFace-PyTorch/raw/master/anchors.npy
```

### 7. Frontend Setup

```bash
# Navigate to root directory
cd ../..

# Install frontend dependencies
npm install

# Create .env.local (if needed)
echo "VITE_API_URL=http://localhost:5000" > .env.local
echo "VITE_ML_API_URL=http://localhost:8080" >> .env.local
```

---

## Environment Configuration

### Backend Environment Variables

Create `Backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/DeepTrace?retryWrites=true&w=majority

# Session
SESSION_SECRET=your_session_secret_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# CORS
FRONTEND_URL=http://localhost:5173

# Optional
LOG_LEVEL=info
```

### Update server.js for Environment Variables

```javascript
// server.js
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Update CORS
app.use(cors({
    origin: frontendURL,
    credentials: true
}));

// Update redirects
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${frontendURL}/login`
    }),
    (req, res) => {
        res.redirect(`${frontendURL}/home`);
    }
);
```

### Python Environment Variables

Create `models/.env`:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py
FLASK_DEBUG=1

# Model Configuration
MODEL_DEVICE=cpu
# MODEL_DEVICE=cuda  # If GPU available

# CORS
FRONTEND_URL=http://localhost:5173
```

### Security Best Practices

1. **Never commit .env files**
   ```bash
   # Add to .gitignore
   echo "*.env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Use strong secrets**
   - Minimum 32 characters
   - Random generated
   - Different for each environment

3. **Rotate secrets regularly**
   - Every 90 days for production
   - After any security incident
   - When team members leave

---

## Running the Application

### Development Mode

#### Terminal 1: MongoDB (if local)
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongodb

# Windows
# Start from Services app
```

#### Terminal 2: Node.js Backend
```bash
cd Backend
npm start
# or with nodemon for auto-reload
npx nodemon server.js

# Should see:
# Server is running on http://localhost:5000
# Connected to MongoDB
```

#### Terminal 3: Python ML Service
```bash
cd models

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Set working directory for BlazeFace paths
cd icpr2020dfdc
python ../app.py

# Should see:
# * Running on http://127.0.0.1:8080
```

#### Terminal 4: Frontend
```bash
# From root directory
npm run dev

# Should see:
# VITE ready in X ms
# Local: http://localhost:5173
```

### Access Application

1. Open browser: `http://localhost:5173`
2. Click "Sign in with Google"
3. Upload video for analysis

### Verify Services

```bash
# Check Node.js backend
curl http://localhost:5000/getUserDetails

# Check Flask ML service
curl http://localhost:8080/upload-video
# Should return error (no video file)
```

---

## Production Deployment

### 1. Environment Preparation

```bash
# Set production environment
export NODE_ENV=production
export FLASK_ENV=production
```

### 2. Security Hardening

#### Update Backend Configuration

```javascript
// server.js - Production settings
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,        // HTTPS only
        sameSite: 'strict',  // Strict CSRF protection
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600  // Lazy session update
    })
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

#### Install Security Packages

```bash
npm install helmet express-rate-limit
```

### 3. Build Frontend

```bash
npm run build
# Creates 'dist' folder with optimized files
```

### 4. Process Management with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd Backend
pm2 start server.js --name deeptrace-backend

# Start frontend (serve static files)
pm2 serve ../dist 5173 --name deeptrace-frontend --spa

# Check status
pm2 status

# View logs
pm2 logs

# Save PM2 configuration
pm2 save

# Auto-start on reboot
pm2 startup
# Follow instructions printed
```

#### PM2 Configuration File

Create `ecosystem.config.js`:

```javascript
module.exports = {
    apps: [
        {
            name: 'deeptrace-backend',
            script: './Backend/server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        },
        {
            name: 'deeptrace-ml',
            script: './models/app.py',
            interpreter: './models/venv/bin/python',
            instances: 2,
            env: {
                FLASK_ENV: 'production',
                PYTHONPATH: './models/icpr2020dfdc'
            }
        }
    ]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/deeptrace

upstream backend {
    server localhost:5000;
}

upstream ml_service {
    server localhost:8080;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/deeptrace/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # ML Service
    location /ml/ {
        proxy_pass http://ml_service/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        client_max_body_size 100M;
        proxy_read_timeout 300s;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/deeptrace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (cron job automatically added)
sudo certbot renew --dry-run
```

---

## Docker Deployment

### 1. Backend Dockerfile

Create `Backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
```

### 2. ML Service Dockerfile

Create `models/Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start Flask
CMD ["python", "app.py"]
```

### 3. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./Backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/DeepTrace?authSource=admin
      - SESSION_SECRET=${SESSION_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
      - mongodb

  ml_service:
    build: ./models
    restart: always
    ports:
      - "8080:8080"
    environment:
      - FLASK_ENV=production
      - MODEL_DEVICE=cpu
    volumes:
      - ./models/icpr2020dfdc:/app/icpr2020dfdc

  frontend:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
      - ml_service

volumes:
  mongodb_data:
```

### 4. Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (Ubuntu 22.04)
# t3.xlarge or larger recommended (4 vCPU, 16 GB RAM)

# SSH into instance
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt-get install -y python3 python3-pip python3-venv

# Install Nginx
sudo apt-get install -y nginx

# Install Git
sudo apt-get install -y git

# Clone repository
git clone https://github.com/your-repo/deeptrace.git
cd deeptrace

# Follow Local Development Setup steps
```

#### 2. Security Group Configuration

Inbound Rules:
- SSH (22) from your IP
- HTTP (80) from anywhere
- HTTPS (443) from anywhere
- Custom TCP (5000) from VPC only
- Custom TCP (8080) from VPC only

#### 3. S3 for Video Storage (Optional)

```javascript
// Install AWS SDK
npm install aws-sdk

// Configure S3
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});

// Upload video
const uploadToS3 = async (file) => {
    const params = {
        Bucket: 'deeptrace-videos',
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer
    };
    return s3.upload(params).promise();
};
```

### Google Cloud Platform (GCP)

#### 1. Compute Engine

```bash
# Create VM instance
gcloud compute instances create deeptrace \
    --zone=us-central1-a \
    --machine-type=n1-standard-4 \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=50GB

# SSH into instance
gcloud compute ssh deeptrace --zone=us-central1-a

# Follow Local Development Setup steps
```

#### 2. Cloud Storage

```javascript
// Install GCS SDK
npm install @google-cloud/storage

// Configure Storage
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: process.env.GCS_KEY_FILE
});

const bucket = storage.bucket('deeptrace-videos');
```

### Heroku Deployment

#### Backend (Node.js)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create deeptrace-backend

# Set environment variables
heroku config:set SESSION_SECRET=your_secret
heroku config:set GOOGLE_CLIENT_ID=your_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git subtree push --prefix Backend heroku main

# Or create Procfile in Backend/
echo "web: node server.js" > Backend/Procfile
```

#### ML Service (Python)

```bash
# Create app
heroku create deeptrace-ml

# Set buildpack
heroku buildpacks:set heroku/python

# Create Procfile
echo "web: python app.py" > models/Procfile

# Create runtime.txt
echo "python-3.10.0" > models/runtime.txt

# Deploy
git subtree push --prefix models heroku main
```

---

## Monitoring & Maintenance

### Logging

#### Node.js (Winston)

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Use in code
logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err });
```

#### Python (logging)

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Use in code
logger.info('Video uploaded', extra={'filename': filename})
logger.error('Model inference failed', exc_info=True)
```

### Health Checks

```javascript
// Add to server.js
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

```python
# Add to app.py
@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': net is not None
    }), 200
```

### Monitoring Tools

1. **PM2 Monitoring**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Prometheus + Grafana**
   - Monitor CPU, memory, request rates
   - Set up alerts for anomalies

3. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/node
   ```
   
   ```javascript
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: process.env.SENTRY_DSN });
   ```

### Backup Strategy

1. **Database Backups**
   ```bash
   # MongoDB Atlas: Automatic backups enabled by default
   
   # Local MongoDB
   mongodump --uri="mongodb://localhost:27017/DeepTrace" --out=/backup/$(date +%Y%m%d)
   ```

2. **Application Backups**
   ```bash
   # Backup script
   tar -czf deeptrace-backup-$(date +%Y%m%d).tar.gz \
       Backend/ \
       models/ \
       dist/ \
       --exclude='node_modules' \
       --exclude='venv'
   ```

3. **Automated Backups (Cron)**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup-script.sh
   ```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"

**Symptoms**: Backend fails to start

**Solutions**:
```bash
# Check MongoDB is running
sudo systemctl status mongodb

# Check connection string
echo $MONGODB_URI

# Whitelist IP in MongoDB Atlas
# Check firewall rules
```

#### 2. "Google OAuth not working"

**Symptoms**: Redirect fails after Google auth

**Solutions**:
- Verify redirect URI matches exactly in Google Console
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure frontend URL is whitelisted

#### 3. "Video upload fails"

**Symptoms**: ML service returns 500 error

**Solutions**:
```bash
# Check Python service is running
curl http://localhost:8080/health

# Check model weights exist
ls models/icpr2020dfdc/blazeface/blazeface.pth

# Check Python dependencies
pip list | grep torch
```

#### 4. "Out of memory"

**Symptoms**: Process crashes during video processing

**Solutions**:
- Reduce `frames_per_video` parameter
- Increase server RAM
- Use smaller video resolution
- Implement video preprocessing

#### 5. "Session not persisting"

**Symptoms**: User logged out on refresh

**Solutions**:
- Check `credentials: 'include'` in frontend
- Verify cookie settings (httpOnly, sameSite)
- Check MongoDB session store is working
- Clear browser cookies and retry

### Debug Mode

#### Enable Debug Logging

```javascript
// Backend
DEBUG=* node server.js

// Or specific module
DEBUG=express:* node server.js
```

```python
# Python
FLASK_DEBUG=1 python app.py
```

### Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Cache Static Assets**
   ```javascript
   app.use(express.static('dist', {
       maxAge: '1d',
       etag: true
   }));
   ```

3. **Database Indexing**
   ```javascript
   // Create index on googleId
   UserScheme.index({ googleId: 1 });
   ```

4. **GPU Acceleration** (if available)
   ```python
   device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
   ```

---

## Maintenance Checklist

### Daily
- [ ] Check application logs for errors
- [ ] Monitor server resource usage
- [ ] Verify all services are running

### Weekly
- [ ] Review security logs
- [ ] Check database size and performance
- [ ] Test backup restoration
- [ ] Update dependencies (dev environment)

### Monthly
- [ ] Update all dependencies
- [ ] Review and rotate secrets
- [ ] Analyze performance metrics
- [ ] Clean up temporary files
- [ ] Review user feedback

### Quarterly
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning review
- [ ] Update documentation

---

## Conclusion

This deployment guide covers:
- ✅ Local development setup
- ✅ Production deployment with PM2 and Nginx
- ✅ Docker containerization
- ✅ Cloud deployment (AWS, GCP, Heroku)
- ✅ Monitoring and maintenance
- ✅ Troubleshooting common issues

For additional support, refer to:
- [Backend Architecture Documentation](BACKEND_ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Project README](README.md)

---

**Document Version**: 1.0
**Last Updated**: November 16, 2024

