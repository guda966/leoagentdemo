import { useState, useEffect } from "react";
import {
  LayoutDashboard, Briefcase, Users, BarChart3, TrendingUp, UserCheck, Plus, Loader2, Send
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RecruiterCandidates from "./RecruiterCandidates";

const navItems = [
  { label: "Overview", path: "/recruiter", icon: LayoutDashboard },
  { label: "Post Job", path: "/recruiter/post", icon: Plus },
  { label: "Candidates", path: "/recruiter/candidates", icon: Users },
  { label: "Pipeline", path: "/recruiter/pipeline", icon: BarChart3 },
];

interface Job {
  id: string;
  title: string;
  company: string;
  status: string | null;
  created_at: string;
  location: string | null;
  salary_range: string | null;
  skills_required: string[] | null;
  description: string | null;
  experience: string | null;
}

interface Application {
  id: string;
  status: string;
  match_score: number | null;
  applied_at: string;
  student_id: string;
  job_id: string;
  student_profile?: {
    full_name: string | null;
    college_name: string | null;
    skills: string[] | null;
    resume_url: string | null;
  };
}

const RecruiterDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Job form
  const [jobForm, setJobForm] = useState({
    title: "", experience: "", salary_range: "", skills: "", location: "", description: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch recruiter's jobs
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", user!.id)
      .order("created_at", { ascending: false });

    if (jobsData) {
      setJobs(jobsData);

      // Fetch applications for these jobs
      if (jobsData.length > 0) {
        const jobIds = jobsData.map((j) => j.id);
        const { data: appsData } = await supabase
          .from("applications")
          .select("*")
          .in("job_id", jobIds)
          .order("applied_at", { ascending: false });

        if (appsData) {
          // Fetch student profiles for applications
          const studentIds = [...new Set(appsData.map((a) => a.student_id))];
          if (studentIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, full_name, college_name, skills, resume_url")
              .in("user_id", studentIds);

            const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
            setApplications(
              appsData.map((a) => ({
                ...a,
                student_profile: profileMap.get(a.student_id) as any,
              }))
            );
          } else {
            setApplications(appsData);
          }
        }
      }
    }
    setLoading(false);
  };

  const handlePostJob = async () => {
    if (!user || !jobForm.title) return;
    setPosting(true);
    try {
      const skills = jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const { data: newJob, error } = await supabase.from("jobs").insert({
        title: jobForm.title,
        company: profile?.company_name || "Company",
        recruiter_id: user.id,
        experience: jobForm.experience || null,
        salary_range: jobForm.salary_range || null,
        skills_required: skills,
        location: jobForm.location || null,
        description: jobForm.description || null,
        status: "active",
      }).select().single();

      if (error) throw error;

      // Notify all students and colleges about new job
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["student", "college"]);

      if (studentRoles && newJob) {
        const notifications = studentRoles.map((r) => ({
          user_id: r.user_id,
          title: "New Job Posted",
          message: `${profile?.company_name || "A recruiter"} posted: ${jobForm.title}${jobForm.location ? ` in ${jobForm.location}` : ""}`,
          type: "job",
          related_id: newJob.id,
        }));

        // Insert in batches
        for (let i = 0; i < notifications.length; i += 50) {
          await supabase.from("notifications").insert(notifications.slice(i, i + 50));
        }
      }

      toast({ title: "Job Posted!", description: `${jobForm.title} is now live` });
      setJobForm({ title: "", experience: "", salary_range: "", skills: "", location: "", description: "" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", appId);
      if (error) throw error;

      // Notify student
      const app = applications.find((a) => a.id === appId);
      if (app) {
        await supabase.from("notifications").insert({
          user_id: app.student_id,
          title: `Application ${newStatus}`,
          message: `Your application has been ${newStatus.toLowerCase()} by the recruiter`,
          type: "application_update",
          related_id: app.job_id,
        });
      }

      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
      toast({ title: `Candidate ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const totalApplicants = applications.length;
  const shortlisted = applications.filter((a) => a.status === "Shortlisted").length;
  const interviewed = applications.filter((a) => a.status === "Interview").length;
  const selected = applications.filter((a) => a.status === "Selected").length;

  if (loading) {
    return (
      <DashboardLayout title="Recruiter Hub" role="Recruiter" navItems={navItems} userName={profile?.full_name || "Recruiter"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Recruiter Hub" role="Recruiter" navItems={navItems} userName={profile?.full_name || "Recruiter"}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="postjob">Post Job</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard title="Active Jobs" value={jobs.filter((j) => j.status === "active").length} icon={Briefcase} />
            <StatCard title="Total Applicants" value={totalApplicants} icon={Users} />
            <StatCard title="Shortlisted" value={shortlisted} icon={UserCheck} />
            <StatCard title="Selected" value={selected} icon={TrendingUp} />
          </div>

          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-card-foreground">Posted Jobs</h3>
            </div>
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No jobs posted yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground p-4">Job Title</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-4">Location</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-4">Applicants</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => {
                    const appCount = applications.filter((a) => a.job_id === j.id).length;
                    return (
                      <tr key={j.id} className="border-b border-border last:border-0">
                        <td className="p-4 text-sm font-medium text-card-foreground">{j.title}</td>
                        <td className="p-4 text-sm text-muted-foreground">{j.location || "—"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{appCount}</td>
                        <td className="p-4">
                          <Badge variant={j.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                            {j.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Candidates */}
        <TabsContent value="candidates" className="space-y-4">
          <p className="text-sm text-muted-foreground">All applicants sorted by AI match score</p>
          {applications.length === 0 ? (
            <div className="bg-card rounded-xl p-10 text-center border border-border">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {[...applications].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).map((app) => {
                const jobTitle = jobs.find((j) => j.id === app.job_id)?.title || "Unknown Job";
                return (
                  <div key={app.id} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <ScoreRing score={app.match_score || 0} size={56} strokeWidth={5} />
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {app.student_profile?.full_name || "Student"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {app.student_profile?.college_name || "College"} · Applied for {jobTitle}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          {(app.student_profile?.skills || []).slice(0, 4).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                          ))}
                        </div>
                        <Badge variant="outline" className="text-[10px] mt-1 capitalize">{app.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === "Applied" && (
                        <>
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => updateApplicationStatus(app.id, "Shortlisted")}>
                            Shortlist
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => updateApplicationStatus(app.id, "Rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                      {app.status === "Shortlisted" && (
                        <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs" onClick={() => updateApplicationStatus(app.id, "Interview")}>
                          Schedule Interview
                        </Button>
                      )}
                      {app.status === "Interview" && (
                        <>
                          <Button size="sm" className="bg-success text-success-foreground text-xs" onClick={() => updateApplicationStatus(app.id, "Selected")}>
                            Select
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => updateApplicationStatus(app.id, "Rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Pipeline */}
        <TabsContent value="pipeline" className="space-y-6">
          <h3 className="text-sm font-semibold text-foreground">Hiring Funnel</h3>
          <div className="space-y-3 max-w-2xl">
            {[
              { stage: "Applied", count: applications.filter((a) => a.status === "Applied").length },
              { stage: "Shortlisted", count: shortlisted },
              { stage: "Interview", count: interviewed },
              { stage: "Selected", count: selected },
              { stage: "Rejected", count: applications.filter((a) => a.status === "Rejected").length },
            ].map((stage) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-24">{stage.stage}</span>
                <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full bg-primary/30 rounded-full flex items-center px-3"
                    style={{ width: `${totalApplicants > 0 ? (stage.count / totalApplicants) * 100 : 0}%`, minWidth: stage.count > 0 ? "40px" : "0" }}
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
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Job Title *</label>
                <Input className="mt-1.5" placeholder="e.g., Senior Frontend Developer" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Experience</label>
                  <Input className="mt-1.5" placeholder="e.g., 0-2 years" value={jobForm.experience} onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Salary Range</label>
                  <Input className="mt-1.5" placeholder="e.g., ₹8-12 LPA" value={jobForm.salary_range} onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Required Skills (comma separated)</label>
                <Input className="mt-1.5" placeholder="React, TypeScript, Node.js" value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input className="mt-1.5" placeholder="e.g., Bangalore" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Job Description</label>
                <Textarea className="mt-1.5" placeholder="Describe the role, responsibilities, and requirements..." rows={5} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
              </div>
              <Button
                onClick={handlePostJob}
                disabled={posting || !jobForm.title}
                className="gradient-primary text-primary-foreground border-0 gap-2"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post Job
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
