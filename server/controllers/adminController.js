import Admin from '../models/admin.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get all admins from the database
const getAdmins = async (req, res) => {
  try {
    // Retrieve all admin records
    const admins = await Admin.find();

    // Send all admin records as a response
    res.status(200).json(admins);
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching admins:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single admin by ID
const getAdmin = async (req, res) => {
  try {
    // Find an admin by ID
    const admin = await Admin.findById(req.params.id);

    // Check if the admin was found
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Send the admin details as a response
    res.status(200).json(admin);
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching admin:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new admin to the database
const postAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin instance with the hashed password
    const admin = new Admin({
      username,
      password: hashedPassword
    });

    // Save the new admin record to the database
    const savedAdmin = await admin.save();

    // Remove password from response
    const adminResponse = {
      _id: savedAdmin._id,
      username: savedAdmin.username
    };

    res.status(201).json(adminResponse);
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an existing admin record
const updateAdmin = async (req, res) => {
  try {
    // Filter out fields that have empty values
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== "")
    );

    // Check if there are any valid fields to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    // Attempt to find and update the admin by ID
    // Return the updated document and validate the update according to the schema
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    // Check if the admin was found and updated
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Respond with the updated admin record
    res.status(200).json(updatedAdmin);
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating admin:', error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an admin record by ID
const deleteAdmin = async (req, res) => {
  try {
    // Attempt to find and delete the admin by ID
    const admin = await Admin.findByIdAndDelete(req.params.id);

    // Check if the admin was found and deleted
    if (!admin) {
      // If no admin was found, return a 404 error
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Confirm deletion of the admin record
    res.status(200).json({ message: 'Admin has been deleted' });
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Return a server error response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add this new function
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Send success response with token
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update the changePassword controller
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.params.id;

    // Find admin and include the password field
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    if (admin.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

export { getAdmins, getAdmin, postAdmin, updateAdmin, deleteAdmin, loginAdmin, changePassword };
