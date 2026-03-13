import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, max: 30 },
    email: { type: String, required: true, max: 30, unique: true, lowercase: true },
    age: { type: Number, required: false},
})

export const Student = mongoose.model('Student', studentSchema);