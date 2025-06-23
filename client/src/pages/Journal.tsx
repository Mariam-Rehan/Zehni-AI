import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EntryCard from "@/components/EntryCard";
import type { JournalEntry } from "@shared/schema";

export default function Journal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/journal-entries/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Entry Deleted",
        description: "Your journal entry has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEntry = (id: number) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      deleteEntryMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Your Journal</h2>
          <p className="text-gray-600 text-sm">All your voice entries and reflections</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-blue-100 rounded mb-3"></div>
              <div className="h-3 bg-blue-100 rounded mb-2"></div>
              <div className="h-3 bg-blue-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Entries</h3>
          <p className="text-gray-600 text-sm mb-4">There was an error loading your journal entries.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Your Journal</h2>
        <p className="text-gray-600 text-sm">All your voice entries and reflections</p>
      </div>

      {!entries || entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-blue-300 mb-4">
            <i className="fas fa-book-open text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Entries Yet</h3>
          <p className="text-gray-600 text-sm mb-6">
            Start your journaling journey by recording your first entry.
          </p>
          <Button 
            onClick={() => setLocation('/')}
            className="bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400"
          >
            <i className="fas fa-microphone mr-2"></i>
            Record First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {entries.map((entry) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setLocation('/')}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-300 hover:from-blue-500 hover:to-cyan-400 rounded-full shadow-lg text-white text-xl transition-all transform hover:scale-105"
      >
        <i className="fas fa-plus"></i>
      </Button>
    </div>
  );
}
