import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function NoteCard({ note, onDelete, isDeleting = false }: NoteCardProps) {
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="card p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{note.title}</h3>
        <button
          onClick={() => onDelete(note.id)}
          className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Delete note"
          disabled={isDeleting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
            <path
              fillRule="evenodd"
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
            />
          </svg>
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{formattedDate}</p>
      <p className="whitespace-pre-wrap">{note.content}</p>
    </div>
  );
} 