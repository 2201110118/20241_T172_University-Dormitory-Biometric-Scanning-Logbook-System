import mongoose from 'mongoose';

const logModel = mongoose.model('Logs', new mongoose.Schema({
    fullname: { type: String, required: true },
    studentid: { type: Number, required: true },
    roomnumber: { type: String, required: true },
    date: { type: Date, default: Date.now },
    logid: { type: Number, required: true }
}).index({ logid: 1 }, { unique: true }));

export default logModel;
