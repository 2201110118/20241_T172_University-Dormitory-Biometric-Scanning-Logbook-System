import mongoose from 'mongoose';

const formatDate = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);

    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    const hours = String(dateObj.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');

    return {
        date: `${month}/${day}/${year}`,
        time: `${hours}:${minutes}`
    };
};

const logModel = mongoose.model('Logs', new mongoose.Schema({
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
    logType: {
        type: String,
        enum: ['login', 'logout'],
        required: true
    },
    timestamp: {
        date: {
            type: String,
            default: () => formatDate(new Date()).date,
            get: (date) => date
        },
        time: {
            type: String,
            default: () => formatDate(new Date()).time,
            get: (time) => time
        }
    },
    logid: {
        type: Number,
        required: true
    },
    archive: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
}).index({ logid: 1 }, { unique: true }));

logModel.schema.index({ student: 1 });

export default logModel;
