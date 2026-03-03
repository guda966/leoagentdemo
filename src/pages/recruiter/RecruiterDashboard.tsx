import {
  LayoutDashboard, Briefcase, Users, GitCompare, BarChart3, TrendingUp, UserCheck, Search, Plus
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { label: "Overview", path: "/recruiter", icon: LayoutDashboard },
  { label: "Post Job", path: "/recruiter/post", icon: Plus },
  { label: "Candidates", path: "/recruiter/candidates", icon: Users },
  { label: "Compare", path: "/recruiter/compare", icon: GitCompare },
  { label: "Pipeline", path: "/recruiter/pipeline", icon: BarChart3 },
];

const candidates = [
  { name: "Arjun Sharma", college: "IIT Delhi", match: 95, skills: ["React", "TypeScript", "Node.js"], exp: "1 yr", score: 92 },
  { name: "Priya Patel", college: "NIT Trichy", match: 89, skills: ["Python", "ML", "TensorFlow"], exp: "Fresher", score: 88 },
  { name: "Rahul Kumar", college: "BITS Pilani", match: 82, skills: ["Java", "Spring", "AWS"], exp: "6 mo", score: 80 },
  { name: "Sneha Reddy", college: "VIT Vellore", match: 76, skills: ["React", "Python", "SQL"], exp: "Fresher", score: 76 },
  { name: "Vikram Singh", college: "IIT Bombay", match: 91, skills: ["C++", "Systems", "Docker"], exp: "2 yr", score: 90 },
];

const pipeline = [
  { stage: "Applied", count: 142, color: "bg-muted" },
  { stage: "Screened", count: 68, color: "bg-primary/20" },
  { stage: "Interviewed", count: 32, color: "bg-accent/20" },
  { stage: "Offered", count: 12, color: "bg-success/20" },
  { stage: "Hired", count: 8, color: "bg-success" },
];

const postedJobs = [
  { title: "Frontend Developer", applicants: 45, shortlisted: 12, status: "Active" },
  { title: "ML Engineer", applicants: 38, shortlisted: 8, status: "Active" },
  { title: "Backend Developer", applicants: 59, shortlisted: 15, status: "Closed" },
];

const RecruiterDashboard = () => (
  <DashboardLayout title="Recruiter Hub" role="Recruiter" navItems={navItems} userName="Nisha Verma">
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-card border border-border">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="candidates">AI Match</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="postjob">Post Job</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Active Jobs" value={2} icon={Briefcase} />
          <StatCard title="Total Applicants" value={142} icon={Users} trend={{ value: 25, positive: true }} />
          <StatCard title="Shortlisted" value={35} icon={UserCheck} />
          <StatCard title="Hire Rate" value="18%" icon={TrendingUp} trend={{ value: 3, positive: true }} />
        </div>

        <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-semibold text-card-foreground">Posted Jobs</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Job Title</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Applicants</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Shortlisted</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {postedJobs.map((j) => (
                <tr key={j.title} className="border-b border-border last:border-0">
                  <td className="p-4 text-sm font-medium text-card-foreground">{j.title}</td>
                  <td className="p-4 text-sm text-muted-foreground">{j.applicants}</td>
                  <td className="p-4 text-sm text-muted-foreground">{j.shortlisted}</td>
                  <td className="p-4">
                    <Badge variant={j.status === "Active" ? "default" : "secondary"} className="text-xs">
                      {j.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* AI Match */}
      <TabsContent value="candidates" className="space-y-4">
        <p className="text-sm text-muted-foreground">Candidates ranked by AI skill match for "Frontend Developer"</p>
        <div className="grid gap-4">
          {candidates.map((c) => (
            <div key={c.name} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-5">
                <ScoreRing score={c.match} size={56} strokeWidth={5} />
                <div>
                  <h3 className="font-semibold text-card-foreground">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.college} · {c.exp}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    {c.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" className="text-xs">View Resume</Button>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs">Shortlist</Button>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Compare */}
      <TabsContent value="compare" className="space-y-4">
        <p className="text-sm text-muted-foreground">Side-by-side candidate comparison</p>
        <div className="grid md:grid-cols-3 gap-4">
          {candidates.slice(0, 3).map((c) => (
            <div key={c.name} className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-lg font-bold text-primary">{c.name[0]}</span>
              </div>
              <h3 className="font-semibold text-card-foreground">{c.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{c.college}</p>
              <ScoreRing score={c.match} size={100} strokeWidth={6} label="Match" />
              <div className="w-full mt-5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Readiness</span>
                  <span className="font-medium text-card-foreground">{c.score}%</span>
                </div>
                <Progress value={c.score} className="h-1.5" />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-card-foreground">{c.exp}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">SKILLS</p>
                  <div className="flex flex-wrap gap-1">
                    {c.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Pipeline */}
      <TabsContent value="pipeline" className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Hiring Funnel</h3>
        <div className="space-y-3 max-w-2xl">
          {pipeline.map((stage) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground w-24">{stage.stage}</span>
              <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full flex items-center px-3`}
                  style={{ width: `${(stage.count / 142) * 100}%` }}
                >
                  <span className="text-xs font-semibold text-foreground">{stage.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Post Job */}
      <TabsContent value="postjob">
        <div className="bg-card rounded-xl p-6 shadow-card border border-border max-w-2xl">
          <h3 className="text-lg font-semibold text-card-foreground mb-6">Post a New Job</h3>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Job Title</label>
              <input className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Senior Frontend Developer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Experience</label>
                <input className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., 0-2 years" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Salary Range</label>
                <input className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., ₹8-12 LPA" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Required Skills</label>
              <input className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="React, TypeScript, Node.js" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Location</label>
              <input className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Bangalore" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Job Description</label>
              <textarea className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Describe the role..." />
              <Button type="button" variant="outline" size="sm" className="mt-2 text-xs gap-1">
                <Briefcase className="h-3 w-3" /> AI Generate Description
              </Button>
            </div>
            <Button type="button" className="gradient-primary text-primary-foreground border-0">
              Post Job
            </Button>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  </DashboardLayout>
);

export default RecruiterDashboard;
