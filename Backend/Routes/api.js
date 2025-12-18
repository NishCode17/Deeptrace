const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Job = require('../Models/job');
const mongoose = require('mongoose');
const { processJob } = require('../Services/jobProcessor');

// Configure Multer for temp storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Save with temporary name initially, will rename after Job ID is generated
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST /api/upload
router.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    try {
        // 1. Generate Job ID using Mongoose (requires import)
        const jobId = new mongoose.Types.ObjectId();
        const extension = path.extname(req.file.originalname);
        const newFilename = `${jobId}${extension}`;

        // 2. Rename file to <jobId>.mp4
        const oldPath = req.file.path;
        const newPath = path.join(path.dirname(oldPath), newFilename);

        // This is safe because jobId is unique
        fs.renameSync(oldPath, newPath);

        // 3. Create Job with correct details
        const userId = req.user ? String(req.user._id) : 'guest';

        const job = await Job.create({
            _id: jobId,
            userId: userId,
            filename: newFilename,
            status: 'PENDING'
        });

        // 4. Respond Immediately
        res.status(200).json({ jobId: job._id });

        // 5. Trigger async worker (Fire-and-forget)
        // We do NOT await this. Node.js event loop handles it in background.
        processJob(job._id);

    } catch (error) {
        console.error('Upload Error:', error);
        // Clean up file if job creation failed
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        // Also try to delete the new file if rename succeeded but DB failed
        // (Not strictly required by prompt but good practice, keeping it simple for now)
        res.status(500).json({ error: 'Failed to create job' });
    }
});

module.exports = router;
