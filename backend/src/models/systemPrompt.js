import mongoose from 'mongoose';

const systemPromptSchema = new mongoose.Schema(
  {
    prompt_id: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const SystemPrompt = mongoose.model('SystemPrompt', systemPromptSchema, 'system_prompts');

export default SystemPrompt;
