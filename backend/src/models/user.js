import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null
    },
    username: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    days_free: {
      type: Number,
      default: 0
    },
    last_gambling_at: {
      type: Date,
      default: null
    },
    hasLogedForFirstTime: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const User = mongoose.model('User', userSchema, 'user');

export default User;