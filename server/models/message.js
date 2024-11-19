import mongoose from 'mongoose';

const formatDate = (date) => {
    if (!date) return null;
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const messageModel = mongoose.model('Messages', new mongoose.Schema({
    confirmedRequest: { type: Boolean, required: true },
    description: { type: String, required: true },
    messageid: { type: Number, required: true },
    gmail: { type: String, required: true },
    studentid: { type: Number, required: true },
    fullname: [{
        firstname: { type: String, required: true },
        lastname: { type: String, required: true }
    }],
    roomnumber: { type: Number },
    date: { type: String, default: () => { return formatDate(new Date()) } },
    status: { type: String, required: true }
}).index({ messageid: 1 }, { unique: true }));

export default messageModel;
