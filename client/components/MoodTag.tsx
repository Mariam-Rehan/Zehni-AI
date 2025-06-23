import { cn } from "@/lib/utils";

interface MoodTagProps {
  mood: string;
  emoji: string;
  className?: string;
}

const moodColors: Record<string, string> = {
  happy: "bg-blue-100 text-blue-700",
  happiness: "bg-blue-100 text-blue-700",
  grateful: "bg-cyan-100 text-cyan-700",
  peaceful: "bg-sky-100 text-sky-700",
  calm: "bg-blue-100 text-blue-700",
  worried: "bg-indigo-100 text-indigo-700",
  anxious: "bg-slate-100 text-slate-700",
  sad: "bg-gray-100 text-gray-700",
  sadness: "bg-gray-100 text-gray-700",
  excited: "bg-cyan-100 text-cyan-700",
  loved: "bg-purple-100 text-purple-700",
  angry: "bg-slate-100 text-slate-700",
  frustrated: "bg-indigo-100 text-indigo-700",
  neutral: "bg-blue-100 text-blue-700",
};

export default function MoodTag({ mood, emoji, className }: MoodTagProps) {
  const colorClass = moodColors[mood.toLowerCase()] || moodColors.neutral;

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
      colorClass,
      className
    )}>
      <span className="mr-1">{emoji}</span>
      {mood}
    </span>
  );
}
