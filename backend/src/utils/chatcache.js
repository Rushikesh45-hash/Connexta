import redis from "../config/redis.js";

const getKey = (chatroomId) => `chat:${chatroomId}`;

// Store message in redis (newest at head)
export const cacheMessage = async (chatroomId, message) => {
  const key = getKey(chatroomId);

  const normalizedMessage = {
    _id: message._id,
    sender_id: message.sender_id,
    receiver_id: message.receiver_id,
    message: message.message,
    createdAt: message.createdAt,
    read: message.read
  };

  await redis.lpush(key, JSON.stringify(normalizedMessage));
  await redis.ltrim(key, 0, 49); // keep only 50
  await redis.expire(key, 600); // 10 mins
};

// Get cached messages (oldest → newest)
export const getCachedMessages = async (chatroomId) => {
  const key = getKey(chatroomId);

  const data = await redis.lrange(key, 0, -1);

  // Redis stores newest first, so reverse
  return data.map((msg) => JSON.parse(msg)).reverse();
};

// Clear cache if needed (optional)
export const clearChatCache = async (chatroomId) => {
  const key = getKey(chatroomId);
  await redis.del(key);
};