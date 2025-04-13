import React, { useState, useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface AudioRecorderProps {
  onSave: (title: string, content: string) => void;
}

export default function AudioRecorder({ onSave }: AudioRecorderProps) {
  const [title, setTitle] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartRecording = () => {
    resetTranscript();
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const handleSave = () => {
    if (transcript.trim()) {
      onSave(title || `Note ${new Date().toLocaleString()}`, transcript);
      setTitle('');
      resetTranscript();
    }
  };

  // Return empty div during server-side rendering to prevent hydration issues
  if (!mounted) {
    return <div className="rounded-lg p-4 mb-8 min-h-[300px]"></div>;
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg mb-4">
        Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Record a New Note</h2>
      
      <div className="mb-4">
        <label htmlFor="title" className="block mb-2">
          Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title or leave blank for auto-generated title"
          className="w-full p-2 border border-input rounded-md bg-background"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="transcript" className="block mb-2">
          Content
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => {/* Readonly, handled by speech recognition */}}
          placeholder="Record your note or type here..."
          className="w-full p-2 border border-input rounded-md h-32 bg-background"
          readOnly
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {!isListening ? (
          <button
            onClick={handleStartRecording}
            className="btn-primary px-4 py-2 rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop Recording
          </button>
        )}
        
        <button
          onClick={resetTranscript}
          className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700"
        >
          Clear
        </button>
        
        <button
          onClick={handleSave}
          disabled={!transcript.trim()}
          className={`px-4 py-2 rounded-md ml-auto ${
            transcript.trim()
              ? 'btn-primary'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Save Note
        </button>
      </div>
      
      {isListening && (
        <div className="flex items-center text-sm text-red-500">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Recording...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 dark:text-red-400 mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
} 