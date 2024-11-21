import mongoose from 'mongoose';
import Messages from './message.js';
import Logs from './log.js';

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

const studentSchema = new mongoose.Schema({
    fullname: {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true }
    },
    studentid: { type: Number, required: true, unique: true },
    gmail: { type: String, required: true },
    contacts: {
        family: {
            contactNumber: { type: Number, required: true },
            gmail: { type: String, required: true }
        },
        guardian: {
            contactNumber: { type: Number, required: true },
            gmail: { type: String, required: true }
        },
        friend: {
            contactNumber: { type: Number, required: true },
            gmail: { type: String, required: true }
        }
    },
    roomnumber: { type: Number, required: false },
    password: { type: String, required: true, minlength: 6, select: false },
    registeredaccount: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        isConfirmed: {
            type: Boolean,
            default: false
        },
        submissionDate: {
            type: String,
            default: () => formatDate(new Date()),
            get: (date) => formatDate(date)
        },
        verificationDate: {
            type: String,
            get: (date) => formatDate(date)
        }
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

studentSchema.pre('findOneAndDelete', async function (next) {
    try {
        const student = await this.model.findOne(this.getFilter());
        if (student) {
            await Messages.deleteMany({ student: student._id });
            await Logs.deleteMany({ student: student._id });
        }
        next();
    } catch (error) {
        next(error);
    }
});

const studentModel = mongoose.model('Students', studentSchema);

export default studentModel;
