import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true, max: 100 },
    lastName: { type: String, required: true, max: 100 },
    email: { type: String, unique: true, required: true, max: 100 },
})

export const Student = mongoose.model('Student', studentSchema);