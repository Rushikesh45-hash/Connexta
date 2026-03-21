import redis from "../config/redis.js";

const getKey = (chatroomId) => `chat:${chatroomId}`;

//this is the code to save message in redis cache
export const cacheMessage = async (chatroomId, message) => {
  const key = getKey(chatroomId);

 // we are normalizing the message object before storing in redis because we want to store only necessary fields in redis and also we want to store messages in redis in reverse order (newest message at the head of the list)
 //  so that when we fetch messages from redis we can easily reverse the order of messages before sending to client because client expects messages in ascending order of created_at
  const normalizedMessage = {
    sender_id: message.sender_id,
    message: message.message,
    created_at: message.created_at,
    read: message.read
  };

  await redis.lpush(key, JSON.stringify(normalizedMessage));
  await redis.ltrim(key, 0, 49); // last 50 messages
  await redis.expire(key, 600); // 10 mins expiry
};

//here we get the cached messages for a chatroom from redis and 
// we are returning those messages in reverse order because we are storing messages in redis in reverse order (newest message at the head of the list) so when we fetch messages from redis 
export const getCachedMessages = async (chatroomId) => {
  const key = getKey(chatroomId);

  const data = await redis.lrange(key, 0, -1);

  return data.map((msg) => JSON.parse(msg)).reverse();
};