import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
