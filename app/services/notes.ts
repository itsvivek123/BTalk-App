import supabase from '../utils/supabase';
import { getRedisClient } from '../utils/redis'; // Import the function to get the client promise
import { Note } from '../types';
import { RedisClientType } from 'redis'; // Import the type if needed for explicit typing

const NOTES_CACHE_KEY = 'notes:all';
const CACHE_EXPIRATION_SECONDS = 3600; // Cache for 1 hour (e.g., 60 * 60)

// Helper function to safely get the Redis client connection
// Returns the client or null if connection fails
async function getRedisConnection(): Promise<RedisClientType | null> {
  try {
    // Await the promise returned by getRedisClient
    const client = await getRedisClient();
    // Basic check to see if we got a valid-looking client object
    if (client && typeof client.get === 'function') {
      return client;
    } else {
      throw new Error("Received invalid Redis client object.");
    }
  } catch (error) {
    // Log the error from getRedisClient if connection failed
    console.error("Failed to establish Redis connection:", error);
    return null; // Indicate connection failure
  }
}

export async function getNotes(): Promise<Note[]> {
  const redis = await getRedisConnection(); // Attempt to get the Redis client

  // --- Try Cache Read ---
  if (redis) { // Only proceed if Redis connection is available
    try {
      const cachedNotes = await redis.get(NOTES_CACHE_KEY);
      if (cachedNotes) {
        console.log('Cache hit for notes');
        // Safely parse JSON
        try {
            return JSON.parse(cachedNotes);
        } catch (parseError) {
            console.error("Failed to parse cached notes JSON:", parseError);
            // Invalidate potentially corrupt cache entry
            await redis.del(NOTES_CACHE_KEY).catch(delErr => console.error("Failed to delete corrupt cache:", delErr));
        }
      } else {
        console.log('Cache miss for notes');
      }
    } catch (cacheError) {
      console.error('Redis cache read error:', cacheError);
      // Continue to DB fetch if cache read fails
    }
  } else {
      console.warn("Proceeding without Redis cache (connection unavailable).");
  }

  // --- Fetch from Database (Cache Miss or Redis Unavailable) ---
  console.log('Fetching notes from database');
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes from Supabase:', error);
    throw error; // Propagate database error
  }

  const notesData = data || [];

  // --- Cache Write ---
  if (redis) { // Only write to cache if Redis is available
    try {
      await redis.set(NOTES_CACHE_KEY, JSON.stringify(notesData), {
        EX: CACHE_EXPIRATION_SECONDS, // Set expiration in seconds
      });
      console.log('Notes stored in cache.');
    } catch (cacheWriteError) {
      console.error('Redis cache write error:', cacheWriteError);
      // Don't fail the request if cache write fails
    }
  }

  return notesData;
}

// --- Cache Invalidation ---
async function invalidateNotesCache(): Promise<void> {
  const redis = await getRedisConnection(); // Attempt to get Redis client
  if (!redis) {
      console.warn("Skipping cache invalidation (Redis connection unavailable).");
      return; // Exit if no connection
  }

  try {
    console.log(`Invalidating Redis cache key: ${NOTES_CACHE_KEY}`);
    const result = await redis.del(NOTES_CACHE_KEY);
    console.log(`Cache invalidation result (keys deleted): ${result}`);
  } catch (cacheError) {
    console.error('Redis cache invalidation error:', cacheError);
    // Log error but don't block the main operation
  }
}

// --- Database Mutation Operations (with Cache Invalidation) ---

export async function createNote(title: string, content: string): Promise<Note> {
  console.log('Creating note in database...');
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select()
    .single();

  if (error) {
    console.error('Error creating note in Supabase:', error);
    throw error;
  }

  console.log('Note created successfully, invalidating cache.');
  await invalidateNotesCache(); // Invalidate cache *after* successful DB operation
  return data;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  console.log(`Updating note ${id} in database...`);
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating note ${id} in Supabase:`, error);
    throw error;
  }

  console.log(`Note ${id} updated successfully, invalidating cache.`);
  await invalidateNotesCache(); // Invalidate cache *after* successful DB operation
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  console.log(`Deleting note ${id} from database...`);
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting note ${id} from Supabase:`, error);
    throw error;
  }

  console.log(`Note ${id} deleted successfully, invalidating cache.`);
  await invalidateNotesCache(); // Invalidate cache *after* successful DB operation
}