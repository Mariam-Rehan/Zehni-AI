import { useState, useEffect } from 'react';
import { useRecorder } from '@/hooks/useRecorder';
import { analyzeEntry, type AnalysisResult } from '@/utils/analyzeEntry';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AIResponse from './AIResponse';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { InsertJournalEntry } from '@shared/schema';

export default function VoiceRecorder() {
  const [recorderState, recorderControls] = useRecorder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [shouldAnalyze, setShouldAnalyze] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  const { isRecording, transcript, isSupported, error } = recorderState;
  const { startRecording, stopRecording, resetTranscript } = recorderControls;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveEntryMutation = useMutation({
    mutationFn: async (entryData: InsertJournalEntry) => {
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        body: JSON.stringify(entryData),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to save entry');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      toast({
        title: "Journal Entry Saved",
        description: "Your entry has been saved successfully!"
      });
      // Reset form after successful save
      setAnalysisResult(null);
      setCurrentTranscript('');
      resetTranscript();
    },
    onError: (error) => {
      console.error('Failed to save entry:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle analysis after recording stops
  useEffect(() => {
    console.log('Analysis effect triggered:', { isRecording, shouldAnalyze, transcript: transcript.trim() });
    if (!isRecording && shouldAnalyze && transcript.trim()) {
      const cleanTranscript = transcript.trim();
      console.log('Starting analysis for transcript:', cleanTranscript);
      setCurrentTranscript(cleanTranscript);
      setIsAnalyzing(true);
      setShouldAnalyze(false);
      
      analyzeEntry(cleanTranscript)
        .then((result) => {
          console.log('Analysis result:', result);
          setAnalysisResult(result);
        })
        .catch((error) => {
          console.error('Failed to analyze entry:', error);
          setLocalError('Failed to analyze entry. Please try again.');
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    }
  }, [isRecording, shouldAnalyze, transcript]);

  const handleStartRecording = () => {
    resetTranscript();
    setAnalysisResult(null);
    setRecordingStartTime(Date.now());
    startRecording();
  };

  const handleStopRecording = async () => {
    console.log('Stop recording clicked');
    stopRecording();
    
    if (recordingStartTime) {
      setDuration(Math.floor((Date.now() - recordingStartTime) / 1000));
    }
    
    // Wait a moment for final transcript to be processed
    setTimeout(() => {
      setShouldAnalyze(true);
    }, 1000);
  };

  const handleManualAnalyze = async () => {
    const textToAnalyze = transcript.trim() || currentTranscript.trim();
    if (!textToAnalyze) {
      setLocalError('No transcript available to analyze');
      return;
    }

    console.log('Manual analysis triggered for:', textToAnalyze);
    setIsAnalyzing(true);
    setLocalError(null);
    
    try {
      const result = await analyzeEntry(textToAnalyze);
      console.log('Analysis result:', result);
      setAnalysisResult(result);
      setCurrentTranscript(textToAnalyze);
    } catch (error) {
      console.error('Failed to analyze entry:', error);
      setLocalError('Failed to analyze entry. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveEntry = () => {
    if (!analysisResult || !currentTranscript) {
      setLocalError('No analysis result or transcript to save');
      return;
    }

    const entryData: InsertJournalEntry = {
      userId: 1, // Default user ID for now
      transcript: currentTranscript,
      mood: analysisResult.mood,
      moodEmoji: analysisResult.moodEmoji,
      summary: analysisResult.summary,
      aiResponse: analysisResult.response,
      duration: duration > 0 ? duration : null,
      audioUrl: null
    };

    saveEntryMutation.mutate(entryData);
  };

  const getRecordStatus = () => {
    if (isRecording) return 'Recording... Tap to stop';
    if (isAnalyzing) return 'Processing your entry...';
    if (transcript) return 'Tap to start a new recording';
    return 'Tap to start recording your journal entry';
  };

  if (!isSupported) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50 mb-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-500 text-2xl mb-6">
            <i className="fas fa-microphone-slash"></i>
          </div>
          <p className="text-red-500 text-sm">Voice recording is not supported in this browser</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50 mb-6">
        <div className="text-center">
          <div className="relative mb-6">
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isAnalyzing}
              className={cn(
                "w-20 h-20 rounded-full shadow-lg text-white text-2xl transition-all transform hover:scale-105 active:scale-95",
                isRecording 
                  ? "bg-gradient-to-br from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600" 
                  : "bg-gradient-to-br from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400"
              )}
            >
              <i className={isRecording ? "fas fa-stop" : "fas fa-microphone"}></i>
            </Button>
            
            {isRecording && (
              <div className="absolute inset-0 bg-green-800 rounded-full animate-ping opacity-30"></div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            {getRecordStatus()}
          </p>
          
          {(error || localError) && (
            <p className="text-red-600 text-sm mb-4">{error || localError}</p>
          )}
          
          {transcript && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-blue-600 mb-2">Your words:</p>
              <p className="text-gray-700 text-sm">{transcript}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={handleManualAnalyze}
                  disabled={isAnalyzing || !transcript.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400"
                >
                  {isAnalyzing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain mr-2"></i>
                      Get AI Response
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    resetTranscript();
                    setAnalysisResult(null);
                    setLocalError(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {!transcript && !isRecording && (
            <div className="text-center">
              <p className="text-blue-600 text-sm mb-3">Or type your journal entry:</p>
              <div className="space-y-3">
                <textarea
                  placeholder="Type your journal entry here... (e.g., 'Kal mein buhat udaas thi')"
                  className="w-full p-3 border border-blue-200 bg-blue-50/30 rounded-lg text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  rows={3}
                  id="manual-transcript"
                />
                <Button
                  onClick={async () => {
                    const textarea = document.getElementById('manual-transcript') as HTMLTextAreaElement;
                    const text = textarea?.value.trim();
                    if (text) {
                      console.log('Testing AI analysis with:', text);
                      setIsAnalyzing(true);
                      setLocalError(null);
                      try {
                        const result = await analyzeEntry(text);
                        console.log('Analysis result:', result);
                        setAnalysisResult(result);
                        setCurrentTranscript(text);
                        textarea.value = '';
                      } catch (error) {
                        console.error('Failed to analyze entry:', error);
                        setLocalError('Failed to analyze entry. Check if OpenRouter API key is valid.');
                      } finally {
                        setIsAnalyzing(false);
                      }
                    }
                  }}
                  disabled={isAnalyzing}
                  size="sm"
                  className="bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400"
                >
                  {isAnalyzing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain mr-2"></i>
                      Test AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {isRecording && (
            <div className="flex justify-center items-end space-x-1 h-12 mb-4">
              {[20, 60, 40, 80, 30].map((height, index) => (
                <div
                  key={index}
                  className="w-1 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-full animate-pulse"
                  style={{ 
                    height: `${height}%`,
                    animationDelay: `${index * 0.1}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {analysisResult && (
        <div className="space-y-4">
          <AIResponse 
            result={analysisResult} 
            transcript={currentTranscript || transcript}
            duration={duration}
          />
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => {
                setAnalysisResult(null);
                setCurrentTranscript('');
                resetTranscript();
                setLocalError(null);
              }}
              variant="outline"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
