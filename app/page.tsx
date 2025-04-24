'use client';

import { useState, useEffect, useTransition } from 'react'; // Import useTransition
import AudioRecorder from './components/AudioRecorder';
import NoteCard from './components/NoteCard';
import { ThemeToggle } from './components/ThemeProvider';
import { Note } from './types';
// Remove direct service imports
// import { getNotes, createNote, deleteNote } from './services/notes';
// Import Server Actions
import { getNotesAction, createNoteAction, deleteNoteAction } from './actions';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true); // Keep for initial load
  const [error, setError] = useState<string | null>(null);
  // useTransition for non-blocking UI updates during action calls
  const [isPending, startTransition] = useTransition();

  // Fetch initial notes (can still use an action or keep client-side fetch)
  const fetchInitialNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the server action to get notes
      const notesData = await getNotesAction();
      setNotes(notesData);
    } catch (err: any) {
      console.error('Error fetching initial notes:', err);
      setError(`Failed to load notes. Please try again. ${err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialNotes();
    // No dependency array needed if it only runs once on mount
  }, []);

  // Handle Save Note using Server Action
  const handleSaveNote = async (title: string, content: string) => {
    setError(null);
    startTransition(async () => {
      try {
        // Call the server action
        const newNote = await createNoteAction(title, content);
        // Optimistic UI update (optional but good UX)
        // setNotes(prevNotes => [newNote, ...prevNotes]); // Add immediately

        // Because revalidatePath('/') was called in the action,
        // the data *should* be fresh if we refetch.
        // Alternatively, rely purely on revalidation triggering a re-render
        // if the component tree structure allows it.
        // For simplicity here, let's refetch after the action.
        await fetchInitialNotes(); // Refetch to get latest list (including new note)

      } catch (err: any) {
        console.error('Error saving note:', err);
        setError(`Failed to save note. Please try again. ${err?.message || ''}`);
        // Rollback optimistic update if needed: await fetchInitialNotes();
      }
    });
  };

  // Handle Delete Note using Server Action
  const handleDeleteNote = async (id: string) => {
    setError(null);
    // Optimistic UI update (optional)
    // const previousNotes = notes;
    // setNotes(prevNotes => prevNotes.filter(note => note.id !== id));

    startTransition(async () => {
      try {
        // Call the server action
        await deleteNoteAction(id);
        // Refetch after successful deletion
        // await fetchInitialNotes(); // Or rely on revalidation

        // --- If NOT using optimistic update, refetch here ---
        // await fetchInitialNotes();

      } catch (err: any) {
        console.error('Error deleting note:', err);
        setError(`Failed to delete note. Please try again. ${err?.message || ''}`);
        // Rollback optimistic update
        // setNotes(previousNotes);
      }
      // --- If using optimistic update, refetch maybe isn't needed ---
      // because revalidatePath should update the underlying data.
      // However, forcing a refetch ensures consistency if revalidation
      // timing is complex. Let's refetch for robustness here.
       await fetchInitialNotes();

    });
  };

  // Determine overall loading state (initial load OR action pending)
  const isLoading = loading || isPending;

  return (
    <main className="min-h-screen py-8 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="flex-1"></div>
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold" style={{ color: '#f5cc00' }}>BTalk App</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Share your thoughts, Save your ideas</p>
        </div>
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      <div className="card p-6 mb-8">
        {/* Pass the action handler to the recorder */}
        <AudioRecorder onSave={handleSaveNote} />
        {/* Indicate loading state during action */}
        {isPending && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Processing...</p>}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="my-6">
        <h2 className="text-2xl font-semibold mb-4">Your Notes</h2>

        {/* Use combined loading state */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>You don't have any notes yet. Start recording to create one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                // Pass the action handler to the card
                onDelete={handleDeleteNote}
                // Optionally disable delete button while pending
                isDeleting={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Note: You might need to adjust NoteCard to accept/use the `isDeleting` prop
// to disable its delete button visually during the transition.