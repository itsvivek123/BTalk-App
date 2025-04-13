import { useState, useEffect, useCallback } from 'react';

// Add SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  browserSupportsSpeechRecognition: boolean;
}

export default function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState<boolean>(false);
  
  // Using a separate useEffect for browser check to avoid hydration mismatch
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    // Only run on the client-side after hydration is complete
    if (!isBrowser) return;
    
    try {
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setBrowserSupportsSpeechRecognition(true);
        const recognitionInstance = new SpeechRecognition();
        
        // Set continuous back to true for ongoing listening
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        
        // Track the last processed index to avoid duplicates
        let lastProcessedIndex = -1;
        
        recognitionInstance.onresult = (event: any) => {
          let finalText = '';
          
          // Process only new results
          for (let i = lastProcessedIndex + 1; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript;
              lastProcessedIndex = i;
            }
          }
          
          // Only update if we have new final text
          if (finalText) {
            setTranscript(prev => {
              const space = prev ? ' ' : '';
              return prev + space + finalText;
            });
          }
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(event.error);
        };
        
        // Handle when recognition stops
        recognitionInstance.onend = () => {
          if (isListening) {
            try {
              recognitionInstance.start();
            } catch (err) {
              console.error('Error restarting speech recognition:', err);
            }
          }
        };
        
        setRecognition(recognitionInstance);
      } else {
        setError('Your browser does not support speech recognition.');
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Error initializing speech recognition');
    }
    
    // Cleanup function
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (err) {
          console.error('Error stopping speech recognition during cleanup:', err);
        }
      }
    };
  }, [isBrowser]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Error starting speech recognition');
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    browserSupportsSpeechRecognition
  };
} 