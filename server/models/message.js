import mongoose from 'mongoose';

const formatDate = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);

    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const year = dateObj.getUTCFullYear();

    return `${month}/${day}/${year}`;
};

const messageModel = mongoose.model('Messages', new mongoose.Schema({
    student: {
        type: Number,
        ref: 'Students',
        required: true,
        validate: {
            validator: async function (studentid) {
                const Student = mongoose.model('Students');
                const student = await Student.findOne({ studentid: studentid });
                return student !== null;
            },
            message: 'Student ID does not exist'
        }
    },
    description: {
        type: String,
        required: true
    },
    messageid: {
        type: Number,
        required: true
    },
    archive: {
        type: Boolean,
        default: false
    },
    requestStatus: {
        isConfirmed: {
            type: Boolean,
            default: false
        },
        requestDate: {
            type: String,
            default: () => formatDate(new Date()),
            get: (date) => formatDate(date)
        },
        confirmationDate: {
            type: String,
            get: (date) => formatDate(date),
            set: (date) => formatDate(new Date())
        }
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
}).index({ messageid: 1 }, { unique: true }));

messageModel.schema.index({ student: 1 });

export default messageModel;
