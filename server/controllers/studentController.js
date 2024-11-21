import Students from '../models/student.js';
import Messages from '../models/message.js';
import Logs from '../models/log.js';

const getStudents = async (req, res) => {
  try {
    const students = await Students.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await Students.findById(req.params.id); // Fixed model name
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const postStudent = async (req, res) => {
  try {
    const student = new Students(req.body); // Fixed model name
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const studentid = req.params.id;

    if (!studentid) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    console.log('Updating student with studentid:', studentid);
    console.log('Update data:', req.body);

    const cleanData = (obj) => {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          const cleanedNested = cleanData(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else if (value !== "" && value !== undefined && value !== null) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    };

    const updates = cleanData(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const updatedStudent = await Students.findOneAndUpdate(
      { studentid: studentid },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      details: error.stack
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentid = req.params.studentid;
    console.log('Deleting student with studentid:', studentid);

    // Find the student first to get their _id
    const student = await Students.findOne({ studentid: studentid });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Count related records before deletion
    const messagesCount = await Messages.countDocuments({ student: student._id });
    const logsCount = await Logs.countDocuments({ student: student._id });

    // Delete the student (this will trigger the cascade delete)
    await Students.findOneAndDelete({ studentid: studentid });

    res.status(200).json({
      message: 'Student has been deleted',
      deletedRecords: {
        messages: messagesCount,
        logs: logsCount
      }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getStudents, getStudent, postStudent, updateStudent, deleteStudent };
