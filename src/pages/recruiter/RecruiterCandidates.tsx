import { useState } from "react";
import { Users, Eye, Send, CheckCircle, XCircle, Clock, FileText, Loader2 } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  skills_required: string[] | null;
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

interface Props {
  applications: Application[];
  jobs: Job[];
  onStatusUpdate: (appId: string, newStatus: string) => void;
  onRefresh: () => void;
}

const RecruiterCandidates = ({ applications, jobs, onStatusUpdate, onRefresh }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeDialog, setResumeDialog] = useState<{ open: boolean; url: string; name: string }>({
    open: false, url: "", name: "",
  });
  const [sendingTest, setSendingTest] = useState<string | null>(null);

  const viewResume = async (resumeUrl: string, name: string) => {
    if (!resumeUrl) {
      toast({ title: "No Resume", description: "This candidate hasn't uploaded a resume yet", variant: "destructive" });
      return;
    }
    // Get signed URL for private bucket
    const { data } = await supabase.storage.from("resumes").createSignedUrl(resumeUrl, 3600);
    if (data?.signedUrl) {
      setResumeDialog({ open: true, url: data.signedUrl, name });
    } else {
      toast({ title: "Error", description: "Could not load resume", variant: "destructive" });
    }
  };

  const sendAptitudeTest = async (app: Application) => {
    if (!user) return;
    setSendingTest(app.id);
    try {
      const job = jobs.find((j) => j.id === app.job_id);
      if (!job) throw new Error("Job not found");

      // Generate questions via AI
      const { data: fnData, error: fnError } = await supabase.functions.invoke("ai-aptitude-test", {
        body: {
          jobTitle: job.title,
          jobDescription: job.description,
          skillsRequired: job.skills_required,
          studentSkills: app.student_profile?.skills,
        },
      });

      if (fnError) throw fnError;
      if (fnData?.error) throw new Error(fnData.error);

      const questions = fnData.questions;
      if (!questions || questions.length === 0) throw new Error("No questions generated");

      // Create aptitude test record
      const { error: insertErr } = await supabase.from("aptitude_tests" as any).insert({
        job_id: job.id,
        application_id: app.id,
        student_id: app.student_id,
        recruiter_id: user.id,
        questions,
        total_questions: questions.length,
        status: "pending",
        time_limit_minutes: 60,
      });
      if (insertErr) throw insertErr;

      // Update application status
      onStatusUpdate(app.id, "Aptitude Test");

      // Notify student
      await supabase.from("notifications").insert({
        user_id: app.student_id,
        title: "Aptitude Test Assigned",
        message: `You have an aptitude test for ${job.title} at ${job.company}. Complete it within 60 minutes.`,
        type: "aptitude_test",
        related_id: app.id,
      });

      // Notify college if student has college association
      if (app.student_profile?.college_name) {
        const { data: collegeProfiles } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("college_name", app.student_profile.college_name)
          .limit(100);

        const { data: collegeRoles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "college");

        if (collegeRoles && collegeProfiles) {
          const collegeUserIds = new Set(collegeRoles.map((r) => r.user_id));
          // Notify college admins
          for (const cr of collegeRoles) {
            await supabase.from("notifications").insert({
              user_id: cr.user_id,
              title: "Student Aptitude Test",
              message: `${app.student_profile?.full_name || "A student"} has been assigned an aptitude test for ${job.title}`,
              type: "aptitude_test",
              related_id: app.id,
            });
          }
        }
      }

      toast({ title: "Aptitude Test Sent!", description: `40 AI-generated MCQs sent to ${app.student_profile?.full_name || "candidate"}` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSendingTest(null);
    }
  };

  const sorted = [...applications].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">All applicants sorted by AI match score. Review resumes and send aptitude tests.</p>

      {applications.length === 0 ? (
        <div className="bg-card rounded-xl p-10 text-center border border-border">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sorted.map((app) => {
            const jobTitle = jobs.find((j) => j.id === app.job_id)?.title || "Unknown Job";
            return (
              <div key={app.id} className="bg-card rounded-xl p-5 shadow-card border border-border">
                <div className="flex items-center justify-between">
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

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* View Resume - always available */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1"
                      onClick={() => viewResume(app.student_profile?.resume_url || "", app.student_profile?.full_name || "Candidate")}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Resume
                    </Button>

                    {/* Status-based actions */}
                    {app.status === "Applied" && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => onStatusUpdate(app.id, "Shortlisted")}>
                          Shortlist
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => onStatusUpdate(app.id, "Rejected")}>
                          Reject
                        </Button>
                      </>
                    )}

                    {app.status === "Shortlisted" && (
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground border-0 text-xs gap-1"
                        onClick={() => sendAptitudeTest(app)}
                        disabled={sendingTest === app.id}
                      >
                        {sendingTest === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Send Aptitude Test
                      </Button>
                    )}

                    {app.status === "Aptitude Test" && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="h-3 w-3" /> Awaiting Test
                      </Badge>
                    )}

                    {app.status === "Test Completed" && (
                      <>
                        <Button size="sm" className="bg-success text-success-foreground text-xs gap-1" onClick={() => onStatusUpdate(app.id, "Interview")}>
                          <CheckCircle className="h-3.5 w-3.5" /> Schedule Interview
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive gap-1" onClick={() => onStatusUpdate(app.id, "Rejected")}>
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}

                    {app.status === "Interview" && (
                      <>
                        <Button size="sm" className="bg-success text-success-foreground text-xs" onClick={() => onStatusUpdate(app.id, "Selected")}>
                          Select
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => onStatusUpdate(app.id, "Rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resume Viewer Dialog */}
      <Dialog open={resumeDialog.open} onOpenChange={(o) => setResumeDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Resume - {resumeDialog.name}
            </DialogTitle>
          </DialogHeader>
          <iframe
            src={resumeDialog.url}
            className="w-full flex-1 rounded-lg border border-border"
            style={{ height: "calc(80vh - 80px)" }}
            title="Resume Viewer"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruiterCandidates;
