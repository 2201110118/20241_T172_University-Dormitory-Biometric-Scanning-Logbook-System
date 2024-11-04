import mongoose from 'mongoose';

// Destructure Schema from mongoose
const { Schema } = mongoose;

// Define the admin schema
const adminSchema = new Schema({
    // Username field, required for admin
    username: {
        type: String,
        required: true
    },
    // Password field, required and must be at least 6 characters long
    password: {
        type: String,
        required: true,
        minlength: 6
    }
});

// Create the Admin model from the schema
const adminModel = mongoose.model('Admin', adminSchema);

// Export the Admin model for use in other files
export default adminModel;
