import mongoose from 'mongoose';

const systemPromptSchema = new mongoose.Schema({
  prompt_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('SystemPrompt', systemPromptSchema);
