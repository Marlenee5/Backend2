import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () { return !this.githubId; } // La contraseña es requerida solo si no hay githubId
  },
  age: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin", "premium"],
    default: "user"
  },
  githubId: {
    type: String,
    unique: true
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);