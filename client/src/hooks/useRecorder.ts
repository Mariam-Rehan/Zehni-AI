import { useState, useRef, useCallback } from 'react';

// Add type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface RecorderState {
  isRecording: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

export interface RecorderControls {
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export function useRecorder(): [RecorderState, RecorderControls] {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if Speech Recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ur-PK'; // Urdu (Pakistan)
    recognition.maxAlternatives = 3;
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
      setError(null);
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript;
      console.log('Speech recognition result:', currentTranscript);
      setTranscript(currentTranscript);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
    };
    
    return recognition;
  }, [isSupported]);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setTranscript(''); // Clear previous transcript
    recognitionRef.current = initializeRecognition();

    if (recognitionRef.current && !isRecording) {
      try {
        console.log('Starting speech recognition');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recording:', error);
        setError('Failed to start recording');
      }
    }
  }, [isSupported, isRecording, initializeRecognition]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called, isRecording:', isRecording);
    if (recognitionRef.current && isRecording) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return [
    { isRecording, transcript, isSupported, error },
    { startRecording, stopRecording, resetTranscript }
  ];
}
