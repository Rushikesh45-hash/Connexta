import mongoose from "mongoose";
const chatroom_schema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    }
  ],
  created_at: {
    type: Date,
    default: Date.now,
    index: { expires: "24h" } 
  }
});
export default mongoose.model("chatroom", chatroom_schema);