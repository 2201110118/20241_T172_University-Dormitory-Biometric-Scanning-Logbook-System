import Logs from '../models/log.js'

const getLogs = async (req, res) => {
    try {
        const logs = await Logs.find()
            .populate('student', 'studentid fullname roomnumber')
            .sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error(`Error fetching logs: ${error}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    };
};

const deleteLog = async (req, res) => {
    try {
        const logid = req.params.logid;
        const log = await Logs.findOneAndDelete({ logid: logid });
        if (!log) {
            return res.status(404).json({ log: "Message not found" });
        }
        res.status(200).json({ log: "Message deleted successfully" });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ log: 'Server error', error: error.log });
    }
};

export { getLogs, deleteLog };