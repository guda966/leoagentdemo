import { useState } from "react";
import {
  LayoutDashboard, User, FileText, Search, MessageSquare, ClipboardList,
  Briefcase, TrendingUp, BookOpen, CheckCircle, Clock, XCircle, Send
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { label: "Overview", path: "/student", icon: LayoutDashboard },
  { label: "Profile", path: "/student/profile", icon: User },
  { label: "Resume", path: "/student/resume", icon: FileText },
  { label: "Job Search", path: "/student/jobs", icon: Search },
  { label: "Mock Interview", path: "/student/interview", icon: MessageSquare },
  { label: "Applications", path: "/student/applications", icon: ClipboardList },
];

const skills = ["React", "TypeScript", "Python", "Node.js", "SQL", "Machine Learning", "Docker", "AWS"];

const jobs = [
  { title: "Frontend Developer", company: "TechCorp", match: 92, location: "Bangalore", salary: "₹8-12 LPA", skills: ["React", "TypeScript"] },
  { title: "Full Stack Engineer", company: "InnovateLabs", match: 85, location: "Hyderabad", salary: "₹10-15 LPA", skills: ["Node.js", "React", "SQL"] },
  { title: "ML Engineer", company: "DataMinds", match: 78, location: "Remote", salary: "₹12-18 LPA", skills: ["Python", "Machine Learning"] },
  { title: "Backend Developer", company: "CloudScale", match: 71, location: "Pune", salary: "₹7-11 LPA", skills: ["Node.js", "Docker", "AWS"] },
];

const applications = [
  { company: "TechCorp", role: "Frontend Developer", status: "Interview", date: "Feb 28" },
  { company: "InnovateLabs", role: "Full Stack Engineer", status: "Shortlisted", date: "Feb 25" },
  { company: "DataMinds", role: "ML Engineer", status: "Applied", date: "Feb 22" },
  { company: "Acme Inc", role: "SDE Intern", status: "Selected", date: "Feb 15" },
  { company: "StartupXYZ", role: "Backend Dev", status: "Rejected", date: "Feb 10" },
];

const statusColor: Record<string, string> = {
  Applied: "bg-muted text-muted-foreground",
  Shortlisted: "bg-primary/10 text-primary",
  Interview: "bg-accent/15 text-accent",
  Selected: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
};

const statusIcon: Record<string, React.ReactNode> = {
  Applied: <Send className="h-3 w-3" />,
  Shortlisted: <BookOpen className="h-3 w-3" />,
  Interview: <MessageSquare className="h-3 w-3" />,
  Selected: <CheckCircle className="h-3 w-3" />,
  Rejected: <XCircle className="h-3 w-3" />,
};

const StudentDashboard = () => {
  return (
    <DashboardLayout title="Dashboard" role="Student" navItems={navItems} userName="Arjun Sharma">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">AI Job Match</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="resume">Resume Score</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard title="Applications" value={12} icon={ClipboardList} trend={{ value: 20, positive: true }} />
            <StatCard title="Interviews" value={4} icon={MessageSquare} trend={{ value: 33, positive: true }} />
            <StatCard title="Offers" value={1} icon={CheckCircle} />
            <StatCard title="Profile Views" value={48} icon={TrendingUp} trend={{ value: 15, positive: true }} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Readiness score */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Placement Readiness</h3>
              <ScoreRing score={78} size={140} />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Complete certifications to reach 85%+
              </p>
            </div>

            {/* Profile completion */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Profile Completion</h3>
              <div className="space-y-3">
                {[
                  { label: "Personal Details", done: true },
                  { label: "Education", done: true },
                  { label: "Skills", done: true },
                  { label: "Projects", done: true },
                  { label: "Certifications", done: false },
                  { label: "Experience", done: false },
                  { label: "Resume Upload", done: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${item.done ? "bg-success" : "bg-muted"}`}>
                      {item.done && <CheckCircle className="h-3 w-3 text-success-foreground" />}
                    </div>
                    <span className={`text-sm ${item.done ? "text-card-foreground" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-card-foreground">71%</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">SUGGESTED SKILLS</h4>
                <div className="flex flex-wrap gap-2">
                  {["Kubernetes", "GraphQL", "Redis"].map((s) => (
                    <Badge key={s} variant="outline" className="text-xs border-dashed">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Jobs */}
        <TabsContent value="jobs" className="space-y-4">
          <p className="text-sm text-muted-foreground">Jobs matched to your profile skills using AI</p>
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job.title} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <ScoreRing score={job.match} size={56} strokeWidth={5} />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {job.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-sm font-medium text-card-foreground">{job.salary}</span>
                  <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications">
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Company</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.company + app.role} className="border-b border-border last:border-0">
                    <td className="p-4 text-sm font-medium text-card-foreground">{app.company}</td>
                    <td className="p-4 text-sm text-muted-foreground">{app.role}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[app.status]}`}>
                        {statusIcon[app.status]} {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{app.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Resume */}
        <TabsContent value="resume" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">ATS Score</h3>
              <ScoreRing score={72} size={140} />
            </div>
            <div className="md:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">AI Suggestions</h3>
              <div className="space-y-3">
                {[
                  "Add quantifiable achievements (e.g., 'Improved load time by 40%')",
                  "Include keywords: CI/CD, Agile, REST API",
                  "Add a professional summary section",
                  "List certifications prominently",
                  "Use action verbs: Led, Developed, Optimized",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-card-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default StudentDashboard;
