import mongoose from 'mongoose';

const aiProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  financial_goals: {
    type: String,
    default: '',
  },
  family_context: {
    type: String,
    default: '',
  },
  known_triggers: {
    type: [String],
    default: [],
  },
  hobbies: {
    type: [String],
    default: [],
  },
  entertainment_tools: [{
    name: String,
    url: String,
  }],
}, { timestamps: true });

export default mongoose.model('AIProfile', aiProfileSchema);
