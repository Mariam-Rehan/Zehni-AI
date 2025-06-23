import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { JournalEntry } from "@shared/schema";

export default function Insights() {
  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Your Journey</h2>
          <p className="text-gray-600 text-sm">Understanding your emotional patterns</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-blue-100 rounded mb-3"></div>
              <div className="h-20 bg-blue-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Your Journey</h2>
          <p className="text-gray-600 text-sm">Understanding your emotional patterns</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-chart-line text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Yet</h3>
          <p className="text-gray-600 text-sm">
            Record a few journal entries to see your emotional insights.
          </p>
        </div>
      </div>
    );
  }

  // Calculate insights
  const totalEntries = entries.length;
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  );

  const moodDistribution = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / totalEntries) * 100),
      emoji: entries.find(e => e.mood === mood)?.moodEmoji || '😊'
    }))
    .sort((a, b) => b.count - a.count);

  // Group entries by date
  const groupEntriesByDate = (entries: JournalEntry[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: Record<string, JournalEntry[]> = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt || Date.now());
      entryDate.setHours(0, 0, 0, 0);
      
      let dateKey: string;
      if (entryDate.getTime() === today.getTime()) {
        dateKey = 'Today';
      } else if (entryDate.getTime() === yesterday.getTime()) {
        dateKey = 'Yesterday';
      } else {
        const diffDays = Math.ceil((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          dateKey = `${diffDays} days ago`;
        } else {
          dateKey = entryDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: entryDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
          });
        }
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });
    
    return groups;
  };

  const dateGroups = groupEntriesByDate(entries);
  
  const getMostCommonMoodForDay = (dayEntries: JournalEntry[]) => {
    const moodCounts: Record<string, number> = {};
    dayEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostCommon = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    );
    
    const entry = dayEntries.find(e => e.mood === mostCommon[0]);
    return entry?.moodEmoji || '😊';
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      happy: 'from-blue-300 to-cyan-400',
      happiness: 'from-blue-300 to-cyan-400',
      grateful: 'from-blue-400 to-sky-400',
      peaceful: 'from-sky-300 to-blue-400',
      calm: 'from-cyan-300 to-blue-300',
      worried: 'from-blue-400 to-indigo-400',
      anxious: 'from-indigo-400 to-blue-500',
      sad: 'from-slate-400 to-blue-400',
      sadness: 'from-slate-400 to-blue-400',
      excited: 'from-cyan-400 to-blue-400',
      loved: 'from-blue-400 to-purple-400',
      angry: 'from-indigo-400 to-blue-500',
      frustrated: 'from-blue-500 to-indigo-500',
    };
    return colors[mood.toLowerCase()] || 'from-blue-400 to-cyan-300';
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Your Journey</h2>
        <p className="text-gray-600 text-sm">Understanding your emotional patterns</p>
      </div>

      {/* Mood Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border border-blue-100/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalEntries}</div>
            <div className="text-xs text-gray-600">Journal Entries</div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border border-blue-100/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">{mostCommonMood[1] && entries.find(e => e.mood === mostCommonMood[0])?.moodEmoji}</div>
            <div className="text-xs text-gray-600">Most Common Mood</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries Chart */}
      <Card className="bg-white/70 backdrop-blur-sm border border-blue-100/50 mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Entries</h3>
          <div className="space-y-3">
            {Object.entries(dateGroups).slice(0, 5).map(([dateKey, dayEntries]) => {
              const entryCount = dayEntries.length;
              const intensity = Math.min((entryCount / 5) * 100, 100); // Scale based on entry count
              const mostCommonEmoji = getMostCommonMoodForDay(dayEntries);
              
              return (
                <div key={dateKey} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{dateKey}</span>
                  <div className="flex-1 mx-3 bg-blue-100/50 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-cyan-300 h-3 rounded-full transition-all"
                      style={{ width: `${Math.max(intensity, 20)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{entryCount}</span>
                    <span className="text-base">{mostCommonEmoji}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mood Distribution */}
      <Card className="bg-white/70 backdrop-blur-sm border border-blue-100/50 mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Emotional Themes</h3>
          <div className="space-y-3">
            {moodDistribution.map(({ mood, count, percentage, emoji }) => (
              <div key={mood} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>{emoji}</span>
                  <span className="text-sm text-gray-700 capitalize">{mood}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-blue-100/50 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getMoodColor(mood)} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Patterns */}
      <Card className="bg-gradient-to-r from-blue-400/20 to-cyan-300/20 border border-blue-100/50">
        <CardContent className="p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Personal Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-lightbulb text-blue-600 text-xs"></i>
              </div>
              <p className="text-sm text-gray-700">
                Your most common emotion is "{mostCommonMood[0]}" appearing in {Math.round((mostCommonMood[1] / totalEntries) * 100)}% of your entries.
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-calendar text-cyan-600 text-xs"></i>
              </div>
              <p className="text-sm text-gray-700">
                You've recorded {totalEntries} journal {totalEntries === 1 ? 'entry' : 'entries'} - you're building a beautiful habit!
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-heart text-sky-600 text-xs"></i>
              </div>
              <p className="text-sm text-gray-700">
                Voice journaling helps you process emotions and gain clarity about your inner world.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
