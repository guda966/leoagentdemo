import { Routes, Route, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, FileText, Search, MessageSquare, ClipboardList
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StudentOverview from "./StudentOverview";
import StudentProfile from "./StudentProfile";
import StudentResume from "./StudentResume";
import StudentJobs from "./StudentJobs";
import StudentInterview from "./StudentInterview";
import StudentApplications from "./StudentApplications";

const navItems = [
  { label: "Overview", path: "/student", icon: LayoutDashboard },
  { label: "Profile", path: "/student/profile", icon: User },
  { label: "Resume", path: "/student/resume", icon: FileText },
  { label: "Job Search", path: "/student/jobs", icon: Search },
  { label: "Mock Interview", path: "/student/interview", icon: MessageSquare },
  { label: "Applications", path: "/student/applications", icon: ClipboardList },
];

const pageTitles: Record<string, string> = {
  "/student": "Overview",
  "/student/profile": "Profile",
  "/student/resume": "Resume & AI Analyzer",
  "/student/jobs": "AI Job Search",
  "/student/interview": "Mock Interview",
  "/student/applications": "Applications",
};

const StudentDashboard = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <DashboardLayout title={title} role="Student" navItems={navItems} userName="Arjun Sharma">
      <Routes>
        <Route index element={<StudentOverview />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="resume" element={<StudentResume />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="interview" element={<StudentInterview />} />
        <Route path="applications" element={<StudentApplications />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
