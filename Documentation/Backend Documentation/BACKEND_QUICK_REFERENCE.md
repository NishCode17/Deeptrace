# DeepTrace Backend - Quick Reference Guide

> A concise reference for developers working with DeepTrace's backend

---

## 🚀 Quick Start

```bash
# Terminal 1: Backend
cd Backend && npm start

# Terminal 2: ML Service
cd models && source venv/bin/activate && python app.py

# Terminal 3: Frontend
npm run dev
```

Access: `http://localhost:5173`

---

## 📁 Project Structure

```
DeepTrace/
├── Backend/                    # Node.js Express Server (Port 5000)
│   ├── server.js              # Main server file
│   ├── Models/user.js         # User schema
│   └── Routes/userRoutes.js   # User endpoints
│
├── models/                     # Python ML Service (Port 8080)
│   ├── app.py                 # Flask server (EfficientNet)
│   ├── ConvLSTM/main.py       # ConvLSTM model training
│   ├── LRCN/main.py           # LRCN model training
│   ├── VisionTransformer/     # ViT model training
│   └── icpr2020dfdc/          # Face detection utilities
│       ├── architectures/     # Model architectures
│       └── blazeface/         # Face detector
│
└── src/                        # React Frontend (Port 5173)
```

---

## 🔌 API Endpoints

### Node.js Express (Port 5000)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/auth/google` | Initiate Google OAuth | No |
| GET | `/auth/google/callback` | OAuth callback | No |
| GET | `/getUserDetails` | Get current user info | Yes |
| GET | `/logout` | Logout user | Yes |
| POST | `/metadata-update` | Update video metadata | No |

### Python Flask (Port 8080)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/upload-video` | Analyze video for deepfakes | No |

---

## 💾 Database

**MongoDB Atlas**: `DeepTrace` database

### Collections

**users**
```javascript
{
    _id: ObjectId,
    googleId: String,
    username: String,
    email: String
}
```

**sessions**
```javascript
{
    _id: String,
    expires: Date,
    session: {
        cookie: Object,
        passport: { user: String }
    }
}
```

---

## 🧠 ML Models

| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| **EfficientNet-B4** | 224×224 frames | Score per frame | Production inference |
| **ConvLSTM** | 80×64×64 sequence | Real/Fake | Temporal analysis |
| **LRCN** | 40×64×64 sequence | Real/Fake | Balanced performance |
| **ViT** | 80×64×64 sequence | Real/Fake | High accuracy |

---

## 🔑 Environment Variables

### Backend (.env)

```env
SESSION_SECRET=min_32_random_chars
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
PORT=5000
```

### ML Service

```env
FLASK_ENV=development
MODEL_DEVICE=cpu  # or cuda
```

---

## 📊 Data Flow

```
User uploads video
    ↓
Frontend sends to Flask ML Service
    ↓
Extract 100 frames evenly
    ↓
Detect faces with BlazeFace
    ↓
Crop & resize to 224×224
    ↓
Run through EfficientNet
    ↓
Apply sigmoid to logits
    ↓
Calculate mean score
    ↓
Return scores to frontend
```

---

## 🎯 Score Interpretation

```javascript
mean_score < 0.5  →  REAL
mean_score >= 0.5 →  FAKE

confidence = mean_score < 0.5 
    ? (1 - mean_score) * 100 
    : mean_score * 100
```

---

## 🔐 Authentication Flow

```
1. User clicks "Sign in with Google"
2. Redirect to /auth/google
3. Google OAuth consent
4. Callback to /auth/google/callback
5. Find/create user in DB
6. Create session
7. Redirect to /home
```

---

## 🛠️ Common Commands

### Backend

```bash
# Install dependencies
npm install

# Start server
npm start

# Development with auto-reload
npx nodemon server.js

# Check for vulnerabilities
npm audit
```

### ML Service

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

### Database

```bash
# Connect to MongoDB
mongosh "mongodb+srv://..."

# Show databases
show dbs

# Use DeepTrace database
use DeepTrace

# Show collections
show collections

# Find all users
db.users.find()

# Count sessions
db.sessions.countDocuments()
```

---

## 🐛 Quick Debugging

### Check Service Status

```bash
# Backend
curl http://localhost:5000/health

# ML Service
curl http://localhost:8080/health

# MongoDB (local)
mongosh --eval "db.adminCommand('ping')"
```

### View Logs

```bash
# PM2 logs
pm2 logs

# Specific app
pm2 logs deeptrace-backend

# Real-time
tail -f Backend/logs/combined.log
```

### Test API

```bash
# Get user details (will fail without session)
curl http://localhost:5000/getUserDetails

# Test video upload
curl -X POST http://localhost:8080/upload-video \
  -F "video=@test.mp4" \
  -F "frames_per_video=50"
```

---

## 🚨 Common Issues & Fixes

### "MongoDB connection failed"
```bash
# Check MongoDB Atlas IP whitelist
# Verify MONGODB_URI in .env
# Test connection
mongosh "your_mongodb_uri"
```

### "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Find process
lsof -i :5000
# or
netstat -ano | findstr :5000

# Kill process
kill -9 <PID>
```

### "Video processing fails"
```bash
# Check BlazeFace weights exist
ls models/icpr2020dfdc/blazeface/blazeface.pth

# Verify Python dependencies
pip list | grep torch

# Test with smaller video
# Reduce frames_per_video parameter
```

---

## 📦 Dependencies

### Node.js

```json
{
  "express": "^4.21.0",
  "mongoose": "^8.6.2",
  "cors": "^2.8.5",
  "connect-mongo": "^5.1.0",
  "passport": "latest",
  "passport-google-oauth20": "latest",
  "express-session": "latest",
  "dotenv": "latest"
}
```

### Python

```txt
torch
tensorflow>=2.10.0
flask>=2.3.0
flask-cors>=4.0.0
opencv-python>=4.7.0
numpy>=1.23.0
scipy>=1.10.0
efficientnet-pytorch>=0.7.0
```

---

## 🔄 Git Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## 📝 Code Snippets

### Frontend: Upload Video

```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('frames_per_video', '100');

const response = await fetch('http://localhost:8080/upload-video', {
    method: 'POST',
    body: formData
});

const data = await response.json();
const label = data.mean_score < 0.5 ? 'REAL' : 'FAKE';
```

### Backend: Protected Route

```javascript
app.get('/protected', isLoggedin, (req, res) => {
    const user = req.user;
    res.json({ message: `Hello ${user.username}` });
});
```

### Add New Model Endpoint

```python
@app.route('/predict-custom', methods=['POST'])
def predict_custom():
    video = request.files['video']
    # Process video
    # Run model
    return jsonify({'result': 'FAKE', 'confidence': 0.95})
```

---

## 🎓 Learning Resources

### Documentation
- [Full Backend Architecture](BACKEND_ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

### External Resources
- [Express.js Docs](https://expressjs.com/)
- [Flask Docs](https://flask.palletsprojects.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Passport.js Docs](http://www.passportjs.org/)
- [PyTorch Docs](https://pytorch.org/docs/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@deeptrace.com

---

## ⚡ Performance Tips

1. **Use GPU for ML inference**
   ```python
   device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
   ```

2. **Enable compression**
   ```javascript
   app.use(compression());
   ```

3. **Implement caching**
   ```javascript
   const cache = new Map();
   // Cache results by video hash
   ```

4. **Reduce frames for faster processing**
   ```javascript
   frames_per_video: 50  // Instead of 100
   ```

5. **Use connection pooling**
   ```javascript
   mongoose.connect(uri, {
       maxPoolSize: 10
   });
   ```

---

## 🔒 Security Checklist

- [ ] Environment variables in `.env` (not committed)
- [ ] Strong session secret (min 32 chars)
- [ ] HTTPS in production
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] MongoDB authentication enabled
- [ ] Regular dependency updates
- [ ] CORS restricted to frontend domain
- [ ] Session cookies with httpOnly and secure flags

---

## 📊 Monitoring

```bash
# CPU & Memory usage
top
htop

# Disk usage
df -h

# PM2 monitoring
pm2 monit

# Request logs
tail -f /var/log/nginx/access.log
```

---

## 🎯 Key Files to Know

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `Backend/server.js` | Main server logic | Often |
| `models/app.py` | ML inference | Sometimes |
| `Backend/Models/user.js` | User schema | Rarely |
| `.env` | Configuration | Setup only |
| `package.json` | Dependencies | When adding packages |

---

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Nginx configured
- [ ] PM2 process manager setup
- [ ] Monitoring enabled
- [ ] Logs configured
- [ ] Health checks working
- [ ] Load testing completed

---

## 📈 Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time | < 200ms | > 1s |
| Error Rate | < 1% | > 5% |
| CPU Usage | < 70% | > 90% |
| Memory Usage | < 80% | > 95% |
| Disk Space | < 70% | > 90% |
| Request Rate | - | Unusual spike |

---

## 🔧 Configuration Files

```
.
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Node dependencies
├── ecosystem.config.js         # PM2 configuration
├── docker-compose.yml          # Docker setup
├── nginx.conf                  # Nginx configuration
└── requirements.txt            # Python dependencies
```

---

## 🌐 URLs

| Service | Local | Production |
|---------|-------|------------|
| Frontend | http://localhost:5173 | https://deeptrace.com |
| Backend | http://localhost:5000 | https://api.deeptrace.com |
| ML Service | http://localhost:8080 | https://ml.deeptrace.com |
| MongoDB | localhost:27017 | Atlas cluster |

---

## 💡 Pro Tips

1. **Use `.nvmrc` for Node version consistency**
   ```bash
   echo "18.16.0" > .nvmrc
   nvm use
   ```

2. **Auto-format code**
   ```bash
   npm install -D prettier eslint
   ```

3. **Use environment-specific configs**
   ```javascript
   const config = require(`./config/${process.env.NODE_ENV}.js`);
   ```

4. **Log request IDs for debugging**
   ```javascript
   app.use((req, res, next) => {
       req.id = generateId();
       next();
   });
   ```

5. **Graceful shutdown**
   ```javascript
   process.on('SIGTERM', () => {
       server.close(() => {
           mongoose.connection.close();
       });
   });
   ```

---

**Last Updated**: November 16, 2024
**Version**: 1.0

For detailed information, see [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)

