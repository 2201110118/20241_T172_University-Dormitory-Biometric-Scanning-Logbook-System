// Import mongoose and necessary components
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the schema for the Student model
const studentSchema = new Schema({
    gmail: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
});

// Create the Student model from the schema
const studentModel = mongoose.model('Student', studentSchema);

// Export the Student model for use in other parts of the application
export default studentModel;
