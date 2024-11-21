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

const messageModel = mongoose.model('Messages', new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    messageid: {
        type: Number,
        required: true
    },
    requestStatus: {
        isConfirmed: {
            type: Boolean,
            default: false
        },
        requestDate: {
            type: String,
            default: () => formatDate(new Date()),
            get: (date) => formatDate(date)
        },
        confirmationDate: {
            type: String,
            get: (date) => formatDate(date),
            set: (date) => formatDate(new Date())
        }
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
}).index({ messageid: 1 }, { unique: true }));

export default messageModel;
