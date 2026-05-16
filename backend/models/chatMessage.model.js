import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // For guest users, this can be optional
    },
    sessionId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    intent: {
      type: String, // Extracted intent from NLP
    },
    confidence: {
      type: Number, // Confidence score from NLP
    },
    entities: {
      type: Array, // Array of extracted entities
      default: [],
    },
    actionTaken: {
      type: String, // E.g., 'added_to_cart', 'order_status_shown'
    },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
