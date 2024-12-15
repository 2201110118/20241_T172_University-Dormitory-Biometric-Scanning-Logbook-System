import mongoose from 'mongoose';
import Messages from './message.js';
import Logs from './log.js';
import bcrypt from 'bcrypt';

const formatDate = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);

    // Convert to Philippines time (UTC+8)
    const philippinesTime = new Date(dateObj.getTime() + (8 * 60 * 60 * 1000));

    const month = String(philippinesTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(philippinesTime.getUTCDate()).padStart(2, '0');
    const year = philippinesTime.getUTCFullYear();

    return `${month}/${day}/${year}`;
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
            contactNumber: { type: Number, required: false },
            gmail: { type: String, required: false }
        },
        guardian: {
            contactNumber: { type: Number, required: false },
            gmail: { type: String, required: false }
        },
        friend: {
            contactNumber: { type: Number, required: false },
            gmail: { type: String, required: false }
        }
    },
    roomnumber: { type: Number, required: false },
    password: { type: String, required: true, minlength: 6, select: false },
    registeredaccount: {
        type: Boolean,
        default: false
    },
    archive: {
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
            default: function() {
                const now = new Date();
                const philippinesTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
                const month = String(philippinesTime.getUTCMonth() + 1).padStart(2, '0');
                const day = String(philippinesTime.getUTCDate()).padStart(2, '0');
                const year = philippinesTime.getUTCFullYear();
                return `${month}/${day}/${year}`;
            },
            get: (date) => formatDate(date)
        },
        verificationDate: {
            type: String,
            get: (date) => formatDate(date)
        }
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Add pre-save middleware to hash password
studentSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to compare passwords
studentSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

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
