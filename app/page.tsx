'use client';

import { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import NoteCard from './components/NoteCard';
import { ThemeToggle } from './components/ThemeProvider';
import { Note } from './types';
import { getNotes, createNote, deleteNote } from './services/notes';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const notesData = await getNotes();
      setNotes(notesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(`Failed to load notes. Please try again. ${err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSaveNote = async (title: string, content: string) => {
    try {
      setLoading(true);
      await createNote(title, content);
      await fetchNotes();
    } catch (err: any) {
      console.error('Error saving note:', err);
      setError(`Failed to save note. Please try again. ${err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setLoading(true);
      await deleteNote(id);
      await fetchNotes();
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(`Failed to delete note. Please try again. ${err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

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
        <AudioRecorder onSave={handleSaveNote} />
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="my-6">
        <h2 className="text-2xl font-semibold mb-4">Your Notes</h2>
        
        {loading ? (
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
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
