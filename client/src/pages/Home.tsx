import { useLocation } from "wouter";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="px-6 py-8">
      {/* Welcome Section */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-light text-blue-600 mb-4 tracking-wide" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>
          آپ کا دل کیسا ہے؟
        </h1>
        <p className="text-blue-500 text-sm mb-2">How is your heart today?</p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Share your thoughts in Urdu or Roman Urdu. Zehni will listen with care and understanding.
        </p>
      </div>

      {/* Voice Recording Section */}
      <VoiceRecorder />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setLocation('/journal')}
          variant="ghost"
          className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100/50 hover:bg-blue-50/50 transition-all h-auto flex-col"
        >
          <i className="fas fa-book-open text-blue-500 text-lg mb-2"></i>
          <p className="text-sm font-medium text-gray-700">View Journal</p>
        </Button>
        
        <Button
          onClick={() => setLocation('/insights')}
          variant="ghost"
          className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100/50 hover:bg-blue-50/50 transition-all h-auto flex-col"
        >
          <i className="fas fa-chart-pie text-cyan-500 text-lg mb-2"></i>
          <p className="text-sm font-medium text-gray-700">Mood Insights</p>
        </Button>
      </div>
    </div>
  );
}
