import Student from '../models/student.js'

// Get all students from the database
const getStudents = async (req, res) => {
  try {
    // Retrieve all student records
    const students = await Student.find();

    // Send all student records as a response
    res.status(200).json(students);
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching students:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single student by ID
const getStudent = async (req, res) => {
  try {
    // Find a student by ID
    const student = await Student.findById(req.params.id);

    // Check if the student was found
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Send the student details as a response
    res.status(200).json(student);
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching student:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new student to the database
const postStudent = async (req, res) => {
  try {
    // Create a new student instance with the provided data
    const student = new Student(req.body);

    // Save the new student record to the database
    const savedStudent = await student.save();

    // Respond with the saved student record
    res.status(201).json(savedStudent);
  } catch (error) {
    // Log the error for debugging
    console.error('Error adding student:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an existing student record
const updateStudent = async (req, res) => {
  try {
    // Filter out fields that have empty values
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== "")
    );

    // Check if there are any valid fields to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    // Attempt to find and update the student by ID
    // Return the updated document and validate the update according to the schema
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    // Check if the student was found and updated
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Respond with the updated student record
    res.status(200).json(updatedStudent);
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating student:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a student record by ID
const deleteStudent = async (req, res) => {
  try {
    // Attempt to find and delete the student by ID
    const student = await Student.findByIdAndDelete(req.params.id);

    // Check if the student was found and deleted
    if (!student) {
      // If no student was found, return a 404 error
      return res.status(404).json({ message: 'Student not found' });
    }

    // Confirm deletion of the student record
    res.status(200).json({ message: 'Student has been deleted' });
  } catch (error) {
    // Log the error for debugging
    console.error('Error deleting student:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getStudents, getStudent, postStudent, updateStudent, deleteStudent };
