import Students from '../models/student.js';
import Messages from '../models/message.js';
import Logs from '../models/log.js';
import axios from 'axios';

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

const verifyRecaptcha = async (token) => {
  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token
      }
    });
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

const postStudent = async (req, res) => {
  try {
    const { captchaToken, confirmPassword, ...studentData } = req.body;

    // Verify reCAPTCHA
    if (!captchaToken) {
      return res.status(400).json({ message: 'Please complete the reCAPTCHA verification' });
    }

    const isValidCaptcha = await verifyRecaptcha(captchaToken);
    if (!isValidCaptcha) {
      return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
    }

    // Add default values
    studentData.registeredaccount = false;
    studentData.accountStatus = {
      isConfirmed: false,
      submissionDate: new Date().toISOString()
    };

    const student = await Students.create(studentData);
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Student ID already exists' });
    } else {
      console.error('Error creating student:', error);
      res.status(400).json({ message: error.message });
    }
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

// Check if student exists by Gmail
const checkGoogleStudent = async (req, res) => {
  try {
    const { gmail } = req.body;
    const student = await Students.findOne({ gmail });

    if (student) {
      // Check if the account is registered and confirmed
      return res.json({
        exists: true,
        isRegistered: student.registeredaccount,
        isConfirmed: student.accountStatus.isConfirmed
      });
    }

    return res.json({ exists: false });
  } catch (error) {
    console.error('Error checking student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login with Google
const loginWithGoogle = async (req, res) => {
  try {
    const { gmail, googleId } = req.body;
    const student = await Students.findOne({ gmail });

    if (!student) {
      return res.status(404).json({
        message: 'No account found with this email',
        shouldSignup: true
      });
    }

    if (!student.registeredaccount) {
      return res.status(403).json({
        message: 'Account not registered',
        isConfirmed: false
      });
    }

    // Update googleId if not already set
    if (!student.googleId && googleId) {
      student.googleId = googleId;
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      student: {
        studentid: student.studentid,
        fullname: student.fullname,
        gmail: student.gmail,
        roomnumber: student.roomnumber,
        registeredaccount: student.registeredaccount,
        accountStatus: student.accountStatus
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getStudents, getStudent, postStudent, updateStudent, deleteStudent, checkGoogleStudent, loginWithGoogle };
