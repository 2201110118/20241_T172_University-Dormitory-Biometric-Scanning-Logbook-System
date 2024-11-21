import mongoose from 'mongoose';

const formatDate = (date) => {
    if (!date) return null;
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return new Date(date).toLocaleString('en-US', options);
};

const logModel = mongoose.model('Logs', new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students',
        required: true
    },
    logType: {
        type: String,
        enum: ['login', 'logout'],
        required: true
    },
    timestamp: {
        type: String,
        default: () => formatDate(new Date()),
        get: (date) => formatDate(date)
    },
    logid: {
        type: Number,
        required: true
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
}).index({ logid: 1 }, { unique: true }));

export default logModel;
