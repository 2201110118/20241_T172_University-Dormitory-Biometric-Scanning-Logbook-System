import mongoose from 'mongoose';

const studentModel = mongoose.model('Students', new mongoose.Schema({
    gmail: { type: String, required: true },
    studentid: { type: Number, required: true, unique: true },
    fullname: [{
        firstname: { type: String, required: true },
        lastname: { type: String, required: true }
    }],
    contactNumbers: [{
        familycontactnumber: Number,
        familycontactgmail: String,
        guardiancontactnumber: Number,
        guardiancontactgmail: String,
        friendcontactnumber: Number,
        friendcontactgmail: String
    }],
    roomnumber: Number,
    password: { type: String, required: true, minlength: 6 },
    registeredaccount: { type: Boolean, required: true },
    date: { type: Date, default: Date.now }
}));

export default studentModel;
