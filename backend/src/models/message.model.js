import mongoose from "mongoose";
const message_schema = new mongoose.Schema({
  chatroom_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chatroom",
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});
message_schema.index({ chatroom_id: 1, created_at: 1 });
export default mongoose.model("message", message_schema);