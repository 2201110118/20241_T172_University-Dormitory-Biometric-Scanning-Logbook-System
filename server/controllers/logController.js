import mongoose from 'mongoose';
import Logs from '../models/log.js'

const getLogs = async (req, res) => {
    try {
        const logs = await Logs.find({ archive: { $ne: true } }).sort({ 'timestamp.date': -1, 'timestamp.time': -1 });

        // Manually populate student data using studentid
        const populatedLogs = await Promise.all(logs.map(async (log) => {
            const logObj = log.toObject();
            const student = await mongoose.model('Students').findOne({ studentid: logObj.student });
            return {
                ...logObj,
                student: student || null
            };
        }));

        res.status(200).json(populatedLogs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getLog = async (req, res) => {
    try {
        const log = await Logs.findOne({ logid: req.params.id });
        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        // Manually populate student data
        const student = await mongoose.model('Students').findOne({ studentid: log.student });
        const logWithStudent = {
            ...log.toObject(),
            student: student || null
        };

        res.status(200).json(logWithStudent);
    } catch (error) {
        console.error('Error fetching log:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteLog = async (req, res) => {
    try {
        const logid = req.params.logid;
        const log = await Logs.findOneAndDelete({ logid: logid });

        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        res.status(200).json({ message: "Log deleted successfully" });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateLog = async (req, res) => {
    try {
        const logid = req.params.logid;
        const log = await Logs.findOneAndUpdate(
            { logid: logid },
            { $set: req.body },
            { new: true }
        );

        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        res.status(200).json(log);
    } catch (error) {
        console.error('Error updating log:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { getLogs, getLog, deleteLog, updateLog };