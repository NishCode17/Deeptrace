const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Job = require('../Models/job');

const FLASK_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8080/predict';

async function processJob(jobId) {
    let filePath = null;

    try {
        // 1. Atomically Claim Job
        const job = await Job.findOneAndUpdate(
            { _id: jobId, status: 'PENDING' },
            { $set: { status: 'PROCESSING' } },
            { new: true }
        );

        if (!job) {
            console.log(`Job ${jobId} could not be claimed (not PENDING or already taken)`);
            return;
        }

        console.log(`Job ${jobId} claimed. Starting processing...`);
        const uploadDir = path.join(__dirname, '../uploads');
        filePath = path.join(uploadDir, job.filename);

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }

        // 2. Prepare Data for Flask
        const form = new FormData();
        form.append('video', fs.createReadStream(filePath));
        // Add optional params if needed. Example: form.append('frames_per_video', 100);

        // 3. Call Flask (Worker)
        const response = await axios.post(FLASK_URL, form, {
            headers: {
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // 4. Update Job on Success
        await Job.findByIdAndUpdate(jobId, {
            status: 'COMPLETED',
            result: response.data
        });
        console.log(`Job ${jobId} completed successfully.`);

    } catch (error) {
        console.error(`Job ${jobId} failed:`, error.message);

        let errorMessage = error.message;
        if (error.response && error.response.data) {
            errorMessage = JSON.stringify(error.response.data);
        }

        // 5. Update Job on Failure
        await Job.findByIdAndUpdate(jobId, {
            status: 'FAILED',
            error: errorMessage
        });
    } finally {
        // 6. Cleanup File
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up file for job ${jobId}`);
            } catch (cleanupError) {
                console.error(`Failed to delete file for job ${jobId}:`, cleanupError);
            }
        }
    }
}

module.exports = { processJob };
