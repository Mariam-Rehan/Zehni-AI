import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Insights from "@/pages/Insights";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Navigation />
      <div className="max-w-md mx-auto bg-white/30 backdrop-blur-sm min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/journal" component={Journal} />
          <Route path="/insights" component={Insights} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
