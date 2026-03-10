import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Building2, Plus, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import OwnerOverview from "./OwnerOverview";
import OwnerRecruiters from "./OwnerRecruiters";
import OwnerColleges from "./OwnerColleges";

const navItems = [
  { label: "Overview", path: "/owner", icon: LayoutDashboard },
  { label: "Recruiters", path: "/owner/recruiters", icon: Briefcase },
  { label: "Colleges", path: "/owner/colleges", icon: Building2 },
];

const pageTitles: Record<string, string> = {
  "/owner": "Dashboard",
  "/owner/recruiters": "Manage Recruiters",
  "/owner/colleges": "Manage Colleges",
};

const OwnerDashboard = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <DashboardLayout title={title} role="Owner" navItems={navItems}>
      <Routes>
        <Route index element={<OwnerOverview />} />
        <Route path="recruiters" element={<OwnerRecruiters />} />
        <Route path="colleges" element={<OwnerColleges />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
