import Students from '../models/student.js';

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
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== "")
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const updatedStudent = await Students.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }); // Fixed model name
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentid = req.params.studentid;
    console.log('Deleting student with studentid:', studentid);

    const student = await Students.findOneAndDelete({ studentid: studentid }); // Fixed model name
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student has been deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getStudents, getStudent, postStudent, updateStudent, deleteStudent };
