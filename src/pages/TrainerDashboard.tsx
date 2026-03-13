import { Routes, Route, Navigate } from "react-router-dom";
import TrainerSidebar from "@/components/trainer/TrainerSidebar";
import OverviewPanel from "@/components/trainer/OverviewPanel";
import ProblemsPanel from "@/components/trainer/ProblemsPanel";
import StudentsPanel from "@/components/trainer/StudentsPanel";
import SubmissionsPanel from "@/components/trainer/SubmissionsPanel";
import AnalyticsPanel from "@/components/trainer/AnalyticsPanel";
import CurriculumPanel from "@/components/trainer/CurriculumPanel";

const TrainerDashboard = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <TrainerSidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<OverviewPanel />} />
          <Route path="curriculum" element={<CurriculumPanel />} />
          <Route path="problems" element={<ProblemsPanel />} />
          <Route path="students" element={<StudentsPanel />} />
          <Route path="submissions" element={<SubmissionsPanel />} />
          <Route path="analytics" element={<AnalyticsPanel />} />
          <Route path="*" element={<Navigate to="/trainer" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default TrainerDashboard;
