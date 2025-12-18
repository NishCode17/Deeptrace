const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    result: {
        type: Object,
        default: null
    },
    error: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
