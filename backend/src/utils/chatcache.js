import redis from "../config/redis.js";

const getKey = (chatroomId) => `chat:${chatroomId}`;

//this is the code to save message in redis cache
export const cacheMessage = async (chatroomId, message) => {
  const key = getKey(chatroomId);

  // we are normalizing the message object before storing in redis because we want to store only necessary fields in redis
  // also we want to store messages in redis in reverse order (newest message at the head of the list)
  // so that when we fetch messages from redis we can reverse the order before sending to client

  const normalizedMessage = {
    _id: message._id,
    sender_id: message.sender_id,
    message: message.message,
    createdAt: message.createdAt, // IMPORTANT FIX
    read: message.read
  };

  await redis.lpush(key, JSON.stringify(normalizedMessage));
  await redis.ltrim(key, 0, 49); // last 50 messages
  await redis.expire(key, 600); // 10 mins expiry
};

//here we get the cached messages for a chatroom from redis
//we return those messages in ascending order because frontend expects old -> new
export const getCachedMessages = async (chatroomId) => {
  const key = getKey(chatroomId);

  const data = await redis.lrange(key, 0, -1);

  return data.map((msg) => JSON.parse(msg)).reverse();
};