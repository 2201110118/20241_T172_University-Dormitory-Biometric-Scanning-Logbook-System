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
    date: { type: String, default: () => { return formatDate(new Date()) } }
}));

export default studentModel;
