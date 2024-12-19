import Students from '../models/student.js';
import Messages from '../models/message.js';
import Logs from '../models/log.js';
import bcrypt from 'bcrypt';

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
    let student;
    const id = req.params.id;

    // Try to find by MongoDB ID first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Students.findById(id);
    }
    
    // If not found or not MongoDB ID, try finding by studentid
    if (!student) {
      student = await Students.findOne({ studentid: id });
    }

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
    const { confirmPassword, ...studentData } = req.body;

    // Format date in MM/DD/YYYY format for Philippines time
    const now = new Date();
    const philippinesTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const month = String(philippinesTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(philippinesTime.getUTCDate()).padStart(2, '0');
    const year = philippinesTime.getUTCFullYear();
    const formattedDate = `${month}/${day}/${year}`;

    // Add default values
    studentData.registeredaccount = false;
    studentData.accountStatus = {
      isConfirmed: false,
      submissionDate: formattedDate,
      verificationDate: null
    };

    // Create the student record
    const student = await Students.create(studentData);

    // Ensure the submission date is set by explicitly updating it
    await Students.findByIdAndUpdate(student._id, {
      'accountStatus.submissionDate': formattedDate
    }, { new: true });

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
    const { id } = req.params;
    const { version, currentPassword, password, modifiedBy, ...updates } = req.body;

    // Preserve existing logic for finding student by _id or studentid
    let student;
    try {
      // Check if id is a valid MongoDB ObjectId
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        student = await Students.findById(id).select('+password');
      }
    } catch (error) {
      console.log('Not a valid MongoDB ID, trying studentid instead');
    }

    // If not found by _id, try finding by studentid
    if (!student) {
      student = await Students.findOne({ studentid: id }).select('+password');
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Version conflict check (skip for password changes)
    if (!password && version !== undefined && student.hasConflict(version)) {
      return res.status(409).json({
        message: 'Data has been modified by another user. Please refresh and try again.',
        currentVersion: student.version,
        lastModified: student.lastModified,
        serverData: student
      });
    }

    // Handle password change separately
    if (password) {
      // Verify current password
      const isMatch = await student.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    // Set modifier information
    student._modifiedBy = modifiedBy || 'unknown';

    // Apply updates and save
    Object.assign(student, updates);
    await student.save();

    res.json({
      message: 'Student updated successfully',
      student: student,
      newVersion: student.version,
      lastModified: student.lastModified
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: error.message });
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

const getStudentByStudentId = async (req, res) => {
  try {
    const student = await Students.findOne({ studentid: req.params.studentid });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getStudents, getStudent, postStudent, updateStudent, deleteStudent, checkGoogleStudent, loginWithGoogle, getStudentByStudentId };
