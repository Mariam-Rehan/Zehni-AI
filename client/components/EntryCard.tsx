import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MoodTag from "./MoodTag";
import type { JournalEntry } from "@shared/schema";

interface EntryCardProps {
  entry: JournalEntry;
  onDelete?: (id: number) => void;
}

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown date';
    const entryDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return format(entryDate, 'MMM d, h:mm a');
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-blue-100/50">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <MoodTag mood={entry.mood} emoji={entry.moodEmoji} />
            {entry.duration && (
              <span className="text-xs text-gray-500">
                {formatDuration(entry.duration)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(entry.createdAt)}
          </span>
        </div>
        
        <div className="mb-3">
          <p className="text-xs text-blue-600/70 mb-1">Entry:</p>
          <p className="text-sm text-gray-700 line-clamp-3">
            {entry.transcript}
          </p>
        </div>
        
        <div className="bg-blue-50/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-blue-600/70 mb-1">💬 Zehni's reflection:</p>
          <p className="text-sm text-gray-700 italic">
            "{entry.aiResponse}"
          </p>
        </div>
        
        <div className="flex items-center justify-end">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="text-gray-400 hover:text-red-600 p-1"
            >
              <i className="fas fa-trash text-xs"></i>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
