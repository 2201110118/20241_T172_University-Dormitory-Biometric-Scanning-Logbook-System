import mongoose from 'mongoose';
import Messages from '../models/message.js';

const getMessages = async (req, res) => {
    try {
        const messages = await Messages.find().sort({ 'requestStatus.requestDate': -1 });

        // Manually populate student data using studentid
        const populatedMessages = await Promise.all(messages.map(async (message) => {
            const messageObj = message.toObject();
            const student = await mongoose.model('Students').findOne({ studentid: messageObj.student });
            return {
                ...messageObj,
                student: student || null
            };
        }));

        res.status(200).json(populatedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMessage = async (req, res) => {
    try {
        if (req.params.id === 'all') {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const message = await Messages.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.status(200).json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
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

const updateMessage = async (req, res) => {
    try {
        const messageid = req.params.id;
        const message = await Messages.findOneAndUpdate(
            { messageid: messageid },
            {
                $set: {
                    'requestStatus.isConfirmed': req.body.requestStatus.isConfirmed,
                    'requestStatus.confirmationDate': req.body.requestStatus.confirmationDate
                }
            },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { getMessages, getMessage, deleteMessage, updateMessage };