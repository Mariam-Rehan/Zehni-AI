import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { id: "home", path: "/", icon: "fas fa-home", label: "Home" },
    { id: "journal", path: "/journal", icon: "fas fa-book", label: "Journal" },
    { id: "insights", path: "/insights", icon: "fas fa-chart-line", label: "Insights" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-200/30 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-blue-600">Zehni</h1>
          </div>
          <div className="flex space-x-2 ml-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  location === item.path
                    ? "bg-gradient-to-r from-blue-400 to-cyan-300 text-white shadow-md"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <i className={item.icon}></i>
                <span className="ml-1 hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
