import mongoose from 'mongoose';

const formatDate = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);

    const dateFormat = dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const timeFormat = dateObj.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return {
        date: dateFormat,
        time: timeFormat
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
