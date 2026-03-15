import mongoose from 'mongoose';

const surgeSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bodySensation: { type: String, trim: true },
    urgeRating: { type: Number, min: 0, max: 10 },
    durationMs: { type: Number },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

surgeSessionSchema.index({ user: 1, completedAt: -1 });

const SurgeSession = mongoose.model('SurgeSession', surgeSessionSchema, 'surge_session');

export default SurgeSession;
