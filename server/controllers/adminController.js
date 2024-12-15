import Admin from '../models/admin.js'
import bcrypt from 'bcrypt'

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

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({
        message: 'Username already exists'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    // Create a new admin instance
    const admin = new Admin({
      username,
      password, // Password will be hashed by pre-save middleware
      isConfirmed: false // Set initial confirmation status
    });

    // Save the new admin record to the database
    const savedAdmin = await admin.save();

    // Remove password from response
    const adminResponse = {
      _id: savedAdmin._id,
      username: savedAdmin.username,
      isConfirmed: savedAdmin.isConfirmed
    };

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: adminResponse
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(409).json({
        message: 'Username already exists'
      });
    }
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update an existing admin record
const updateAdmin = async (req, res) => {
  try {
    const { currentPassword, password, ...updates } = req.body;

    if (password) {
      // Find admin and include the password field
      const admin = await Admin.findById(req.params.id).select('+password');
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Verify current password
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.password = hashedPassword;
    }

    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== "")
    );

    if (Object.keys(cleanedUpdates).length === 0 && !password) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: cleanedUpdates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
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

// Add a new function to confirm admin registration
const confirmAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.isConfirmed = true;
    await admin.save();

    res.status(200).json({
      message: 'Admin account confirmed successfully',
      admin: {
        _id: admin._id,
        username: admin.username,
        isConfirmed: admin.isConfirmed
      }
    });
  } catch (error) {
    console.error('Error confirming admin:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update the loginAdmin function to check confirmation status
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username and include password
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if admin is confirmed
    if (!admin.isConfirmed) {
      return res.status(403).json({ message: 'Account pending confirmation' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        isConfirmed: admin.isConfirmed
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
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword; // Will be hashed by pre-save middleware
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

// Add the changeUsername controller
const changeUsername = async (req, res) => {
  try {
    const { currentPassword, newUsername } = req.body;
    const adminId = req.params.id;

    // Find admin and include the password field
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new username already exists
    const existingAdmin = await Admin.findOne({ username: newUsername });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Update username
    admin.username = newUsername;
    await admin.save();

    res.json({ message: 'Username updated successfully' });
  } catch (error) {
    console.error('Error changing username:', error);
    res.status(500).json({ message: 'Error updating username', error: error.message });
  }
};

// Add the getAdminDetails controller
const getAdminDetails = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Return only necessary details
    res.status(200).json({
      id: admin._id,
      username: admin.username
    });
  } catch (error) {
    console.error('Error fetching admin details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getAdmins, getAdmin, postAdmin, updateAdmin, deleteAdmin, loginAdmin, changePassword, changeUsername, getAdminDetails, confirmAdmin };
