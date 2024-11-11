import mongoose from 'mongoose';

const { Schema } = mongoose;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
});

const adminModel = mongoose.model('Admin', adminSchema);

export default adminModel;