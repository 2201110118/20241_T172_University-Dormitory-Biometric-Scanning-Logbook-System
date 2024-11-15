import mongoose from 'mongoose';

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
    date: { type: Date, default: Date.now }
}).index({ messageid: 1 }, { unique: true }));

export default messageModel;
