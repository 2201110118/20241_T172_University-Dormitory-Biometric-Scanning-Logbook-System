import mongoose from 'mongoose';

const adminModel = mongoose.model('Admins', new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 }
}));

export default adminModel;
