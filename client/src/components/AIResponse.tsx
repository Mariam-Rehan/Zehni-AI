import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MoodTag from "./MoodTag";

interface AIResponseProps {
  result: {
    summary: string;
    mood: string;
    moodEmoji: string;
    response: string;
  };
  transcript: string;
  duration?: number;
}

export default function AIResponse({ result, transcript, duration = 0 }: AIResponseProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveEntryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/journal-entries', {
        userId: 1, // For now, not using user authentication
        transcript,
        audioUrl: null,
        mood: result.mood,
        moodEmoji: result.moodEmoji,
        summary: result.summary.trim(),
        aiResponse: result.response.trim(),
        duration,
      });
    },
    onSuccess: () => {
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="bg-gradient-to-r from-blue-400/20 to-cyan-300/20 border border-blue-100/50 rounded-2xl p-6 shadow-lg mb-6 animate-fade-in">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full flex items-center justify-center">
          <i className="fas fa-heart text-white text-xs"></i>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">Zehni's Response</h3>
          <p className="text-xs text-gray-500">Generated with care</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-blue-600/70 mb-1">🧠 Summary:</p>
          <p className="text-sm text-gray-700">{result.summary}</p>
        </div>
        
        <div>
          <p className="text-xs text-blue-600/70 mb-1">🌈 Mood:</p>
          <MoodTag mood={result.mood} emoji={result.moodEmoji} />
        </div>
        
        <div>
          <p className="text-xs text-blue-600/70 mb-1">💬 Response:</p>
          <p className="text-sm text-gray-700 italic">"{result.response}"</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => saveEntryMutation.mutate()}
          disabled={saveEntryMutation.isPending}
          size="sm"
          className="bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400"
        >
          {saveEntryMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Entry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
