import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
{
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "blocked"],
        default: "pending"
    }
},
{ timestamps: true }
);

connectionSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);


export const Connection = mongoose.model("Connection", connectionSchema);