import {
  LayoutDashboard, Users, CalendarDays, BarChart3, GraduationCap, TrendingUp, CheckCircle, Clock, AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const navItems = [
  { label: "Overview", path: "/college", icon: LayoutDashboard },
  { label: "Students", path: "/college/students", icon: Users },
  { label: "Drives", path: "/college/drives", icon: CalendarDays },
  { label: "Analytics", path: "/college/analytics", icon: BarChart3 },
];

const deptData = [
  { dept: "CSE", ready: 82, total: 120 },
  { dept: "ECE", ready: 65, total: 95 },
  { dept: "Mech", ready: 45, total: 80 },
  { dept: "Civil", ready: 38, total: 60 },
  { dept: "EEE", ready: 58, total: 70 },
];

const pieData = [
  { name: "Placed", value: 245, color: "hsl(152, 69%, 31%)" },
  { name: "In Progress", value: 120, color: "hsl(38, 92%, 50%)" },
  { name: "Not Started", value: 60, color: "hsl(var(--muted))" },
];

const students = [
  { name: "Arjun Sharma", dept: "CSE", score: 92, status: "Placed", skills: ["React", "Node.js"] },
  { name: "Priya Patel", dept: "CSE", score: 88, status: "Interview", skills: ["Python", "ML"] },
  { name: "Rahul Kumar", dept: "ECE", score: 76, status: "Shortlisted", skills: ["Embedded", "C++"] },
  { name: "Sneha Reddy", dept: "Mech", score: 65, status: "Applied", skills: ["CAD", "Python"] },
  { name: "Vikram Singh", dept: "EEE", score: 82, status: "Placed", skills: ["Power Systems", "MATLAB"] },
];

const drives = [
  { company: "TechCorp", date: "Mar 5", roles: "SDE", eligible: 85, applied: 62, status: "Active" },
  { company: "InnovateLabs", date: "Mar 12", roles: "Full Stack", eligible: 70, applied: 0, status: "Upcoming" },
  { company: "DataMinds", date: "Feb 20", roles: "ML Engineer", eligible: 45, applied: 38, status: "Completed" },
];

const driveStatusColor: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Upcoming: "bg-primary/10 text-primary",
  Completed: "bg-muted text-muted-foreground",
};

const CollegeDashboard = () => (
  <DashboardLayout title="Placement Cell" role="College Admin" navItems={navItems} userName="Dr. Meera Iyer">
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-card border border-border">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="drives">Drives</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={425} icon={Users} />
          <StatCard title="Placement Ready" value="68%" icon={CheckCircle} trend={{ value: 8, positive: true }} />
          <StatCard title="Active Drives" value={3} icon={CalendarDays} />
          <StatCard title="Avg Readiness" value="74%" icon={TrendingUp} trend={{ value: 5, positive: true }} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Department Readiness</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dept" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="ready" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ready" />
                <Bar dataKey="total" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Placement Status</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-5 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Students */}
      <TabsContent value="students">
        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Student</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Department</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Readiness</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Skills</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-4 text-sm font-medium text-card-foreground">{s.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{s.dept}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={s.score} className="h-1.5 w-16" />
                      <span className="text-xs font-medium text-card-foreground">{s.score}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {s.skills.map((sk) => (
                        <Badge key={sk} variant="secondary" className="text-[10px] px-1.5 py-0">{sk}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs">{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* Drives */}
      <TabsContent value="drives" className="space-y-4">
        <div className="flex justify-end">
          <Button className="gradient-primary text-primary-foreground border-0" size="sm">
            + Create Drive
          </Button>
        </div>
        <div className="grid gap-4">
          {drives.map((d) => (
            <div key={d.company} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{d.company}</h3>
                <p className="text-sm text-muted-foreground">{d.roles} · {d.date}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Eligible</p>
                  <p className="text-sm font-medium text-card-foreground">{d.eligible}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Applied</p>
                  <p className="text-sm font-medium text-card-foreground">{d.applied}</p>
                </div>
                <Badge className={`${driveStatusColor[d.status]} border-0`}>{d.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Analytics */}
      <TabsContent value="analytics" className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Overall Placement Rate</h3>
            <ScoreRing score={68} size={130} color="hsl(var(--success))" label="of students placed" />
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Avg Readiness Score</h3>
            <ScoreRing score={74} size={130} label="across departments" />
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Drive Success Rate</h3>
            <ScoreRing score={85} size={130} color="hsl(var(--accent))" label="offers / interviews" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </DashboardLayout>
);

export default CollegeDashboard;
