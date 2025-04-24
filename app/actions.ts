'use server'; // Mark this module as containing server actions

import { revalidatePath } from 'next/cache'; // To refresh data after mutation
import { Note } from './types';
import { getNotes as getNotesService, createNote as createNoteService, deleteNote as deleteNoteService } from './services/notes'; // Rename imports to avoid naming conflict

// Action to get notes (can be called from Client Components if needed)
export async function getNotesAction(): Promise<Note[]> {
  // No need to revalidate here, just fetching
  return getNotesService();
}

// Action to create a note
export async function createNoteAction(title: string, content: string): Promise<Note> {
  try {
    const newNote = await createNoteService(title, content);
    revalidatePath('/'); // Revalidate the home page cache after creating
    return newNote;
  } catch (error) {
    console.error("Server Action Error (createNoteAction):", error);
    // Rethrow or return an error object for the client to handle
    throw new Error("Failed to create note.");
  }
}

// Action to delete a note
export async function deleteNoteAction(id: string): Promise<void> {
  try {
    await deleteNoteService(id);
    revalidatePath('/'); // Revalidate the home page cache after deleting
  } catch (error) {
    console.error("Server Action Error (deleteNoteAction):", error);
    // Rethrow or return an error object for the client to handle
    throw new Error("Failed to delete note.");
  }
}

// You could potentially add updateNoteAction here too following the same pattern