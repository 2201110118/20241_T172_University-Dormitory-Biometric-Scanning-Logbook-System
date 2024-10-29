import mongoose, { mongo } from 'mongoose'
const { Schema } = mongoose

const accountSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    gmail:{
        type: String,
        required: true
    }
})

const accountModel = mongoose.model('Account', accountSchema);
export default accountModel;