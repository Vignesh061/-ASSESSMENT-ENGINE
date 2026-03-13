import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";
import TrainerLogin from "./pages/TrainerLogin";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminPage from "./pages/AdminPage";
import TrainerGuard from "./components/trainer/TrainerGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Student routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace/:lessonId" element={<Workspace />} />

          {/* Trainer routes */}
          <Route path="/trainer/login" element={<TrainerLogin />} />
          <Route
            path="/trainer/*"
            element={
              <TrainerGuard>
                <TrainerDashboard />
              </TrainerGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <TrainerGuard>
                <AdminPage />
              </TrainerGuard>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
