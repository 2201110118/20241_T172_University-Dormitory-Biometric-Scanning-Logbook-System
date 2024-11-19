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

const logModel = mongoose.model('Logs', new mongoose.Schema({
    fullname: [{
        firstname: { type: String, required: true },
        lastname: { type: String, required: true }
    }],
    studentid: { type: Number, required: true },
    roomnumber: { type: String, required: true },
    date: { type: String, default: () => { return formatDate(new Date()) } },
    logid: { type: Number, required: true }
}).index({ logid: 1 }, { unique: true }));

export default logModel;
