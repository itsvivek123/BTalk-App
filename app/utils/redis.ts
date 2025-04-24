import { createClient, RedisClientType } from 'redis';

// Define the structure for the client promise
let redisClientPromise: Promise<RedisClientType> | null = null;

function getRedisClient(): Promise<RedisClientType> {
  if (redisClientPromise) {
    return redisClientPromise;
  }

  const url = process.env.KV_URL || process.env.REDIS_URL;

  if (!url) {
    console.warn('Redis or KV connection URL not found in environment variables.');
    // Return a promise that resolves to a dummy client or rejects,
    // depending on how critical Redis is. Rejecting might be safer.
    return Promise.reject(new Error('Redis connection URL is not configured.'));
    // Or for a non-crashing fallback (use with caution):
    /*
    return Promise.resolve({
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      on: () => {}, // Add dummy 'on' method
      // Add other methods you might call if needed, returning dummy values
    } as any);
    */
  }

  console.log(`Attempting to connect to Redis at: ${url.split('@')[1] || url}`); // Log URL without credentials

  const client = createClient({ url });

  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('Redis client connecting...'));
  client.on('ready', () => console.log('Redis client ready.'));
  client.on('end', () => console.log('Redis client connection closed.'));

  // Start the connection process and store the promise
  redisClientPromise = client.connect()
    .then(() => {
        console.log('Successfully connected to Redis.');
        return client as RedisClientType; // Cast needed as connect returns Promise<void> initially
    })
    .catch(err => {
        console.error('Failed to connect to Redis:', err);
        redisClientPromise = null; // Reset promise on failure
        throw err; // Re-throw error to propagate it
    });

  return redisClientPromise;
}

// Export a function that returns the promise of the connected client
export { getRedisClient };

// Optional: You could export a simplified interface for common operations
/*
export const redisCache = {
  async get(key: string): Promise<string | null> {
    const client = await getRedisClient();
    return client.get(key);
  },
  async set(key: string, value: string, options?: { EX?: number }): Promise<string | null> {
    const client = await getRedisClient();
    // The 'redis' package uses slightly different options format
    return client.set(key, value, options);
  },
  async del(key: string | string[]): Promise<number> {
    const client = await getRedisClient();
    return client.del(key);
  }
};
*/