import mongoose from 'mongoose';

const aiProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    financial_goals: {
      type: String,
      default: null,
    },
    family_context: {
      type: String,
      default: null,
    },
    known_triggers: {
      type: [String],
      default: [],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    resilience_score: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const AIProfile = mongoose.model('AIProfile', aiProfileSchema, 'ai_profiles');

export default AIProfile;
