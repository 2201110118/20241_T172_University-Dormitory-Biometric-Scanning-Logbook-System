import Messages from '../models/message.js';

const getMessages = async (req, res) => {
    try {
        const messages = await Messages.find();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMessage = async (req, res) => {
    try {
        const message = await Messages.findById(req.params.id); // Fixed model name
        if (!message) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json(message);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const messageid = req.params.id; // messageid from URL params
        const message = await Messages.findOneAndDelete({ messageid: messageid }); // Use messageid for deletion

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export { getMessages, getMessage, deleteMessage };