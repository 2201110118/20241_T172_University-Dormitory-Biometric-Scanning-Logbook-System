import mongoose from 'mongoose';
const { Schema } = mongoose;

const studentSchema = new Schema({
    gmail: {
        type: String,
        required: true
    },
    studentid: {
        type: Number,
        required: true
    },
    fullname: [{
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        }
    }],
    contactnumber: [{
        familycontactnumber: {
            type: Number,
            required: false
        },
        familycontactgmail: {
            type: String,
            required: false
        },
        guardiancontactnumber: {
            type: Number,
            required: false
        },
        guardiancontactgmail: {
            type: String,
            required: false
        },
        friendcontactnumber: {
            type: Number,
            required: false
        },
        friendcontactgmail: {
            type: String,
            required: false
        },
    }],
    roomnumber: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
});

studentSchema.index({ studentid: 1 }, { unique: true });

const studentModel = mongoose.model('Student', studentSchema);

export default studentModel;
