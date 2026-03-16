import { useState, useEffect } from "react";
import { Users, Eye, Send, CheckCircle, XCircle, Clock, FileText, Loader2, Upload, AlertTriangle, Ban, Edit } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface TestResult {
  id: string;
  application_id: string;
  student_id: string;
  score: number | null;
  status: string;
  total_questions: number;
  violations: any[];
  completed_at: string | null;
  questions: any[];
  answers: any[];
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
  const [resumeDialog, setResumeDialog] = useState<{ open: boolean; url: string; name: string }>({ open: false, url: "", name: "" });
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testDetailDialog, setTestDetailDialog] = useState<{ open: boolean; test: TestResult | null; appName: string }>({ open: false, test: null, appName: "" });

  // PDF upload state
  const [pdfDialog, setPdfDialog] = useState<{ open: boolean; app: Application | null }>({ open: false, app: null });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [editingQuestions, setEditingQuestions] = useState(false);

  // Real-time violations listener
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("recruiter-test-updates")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "aptitude_tests",
        filter: `recruiter_id=eq.${user.id}`,
      }, (payload) => {
        const updated = payload.new as any;
        setTestResults((prev) => prev.map((t) => t.id === updated.id ? { ...t, ...updated } : t));
        // Show toast for violations
        if (updated.violations && updated.violations.length > 0) {
          const lastViolation = updated.violations[updated.violations.length - 1];
          if (updated.status === "terminated") {
            toast({ title: "❌ Test Terminated", description: `Candidate's test was auto-terminated due to malpractice`, variant: "destructive" });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Fetch test results
  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      const { data } = await supabase
        .from("aptitude_tests")
        .select("*")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setTestResults(data as any);
    };
    fetchResults();
  }, [user, applications]);

  const viewResume = async (resumeUrl: string, name: string) => {
    if (!resumeUrl) {
      toast({ title: "No Resume", description: "This candidate hasn't uploaded a resume yet", variant: "destructive" });
      return;
    }
    const { data } = await supabase.storage.from("resumes").createSignedUrl(resumeUrl, 3600);
    if (data?.signedUrl) {
      setResumeDialog({ open: true, url: data.signedUrl, name });
    } else {
      toast({ title: "Error", description: "Could not load resume", variant: "destructive" });
    }
  };

  const sendAptitudeTest = async (app: Application, customQuestions?: any[]) => {
    if (!user) return;
    setSendingTest(app.id);
    try {
      const job = jobs.find((j) => j.id === app.job_id);
      if (!job) throw new Error("Job not found");

      let questions = customQuestions;

      if (!questions) {
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
        questions = fnData.questions;
      }

      if (!questions || questions.length === 0) throw new Error("No questions generated");

      const { error: insertErr } = await supabase.from("aptitude_tests").insert({
        job_id: job.id,
        application_id: app.id,
        student_id: app.student_id,
        recruiter_id: user.id,
        questions,
        total_questions: questions.length,
        status: "pending",
        time_limit_minutes: 60,
      } as any);
      if (insertErr) throw insertErr;

      onStatusUpdate(app.id, "Aptitude Test");

      await supabase.from("notifications").insert({
        user_id: app.student_id,
        title: "Aptitude Test Assigned",
        message: `You have an aptitude test for ${job.title} at ${job.company}. Complete it within 60 minutes. Warning: 3 violations = test terminated.`,
        type: "aptitude_test",
        related_id: app.id,
      });

      // Notify college
      const { data: collegeRoles } = await supabase.from("user_roles").select("user_id").eq("role", "college");
      if (collegeRoles) {
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

      toast({ title: "Aptitude Test Sent!", description: `${questions.length} MCQs sent to ${app.student_profile?.full_name || "candidate"}` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSendingTest(null);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile || !pdfDialog.app) return;
    setPdfProcessing(true);
    try {
      const job = jobs.find((j) => j.id === pdfDialog.app!.job_id);

      // Read PDF as text (basic extraction)
      const text = await pdfFile.text();

      const { data, error } = await supabase.functions.invoke("pdf-to-mcq", {
        body: {
          pdfText: text,
          jobTitle: job?.title || "",
          jobDescription: job?.description || "",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setGeneratedQuestions(data.questions);
      setEditingQuestions(true);
      toast({ title: "Questions Generated!", description: `${data.questions.length} MCQs created from PDF. Review and edit before sending.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPdfProcessing(false);
    }
  };

  const sendPdfQuestions = async () => {
    if (!pdfDialog.app || generatedQuestions.length === 0) return;
    setPdfDialog({ open: false, app: null });
    setEditingQuestions(false);
    await sendAptitudeTest(pdfDialog.app, generatedQuestions);
    setGeneratedQuestions([]);
    setPdfFile(null);
  };

  const getTestResult = (appId: string) => testResults.find((t) => t.application_id === appId);

  const sorted = [...applications].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">All applicants sorted by AI match score. Review resumes, send aptitude tests, and view results with malpractice logs.</p>

      {applications.length === 0 ? (
        <div className="bg-card rounded-xl p-10 text-center border border-border">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sorted.map((app) => {
            const jobTitle = jobs.find((j) => j.id === app.job_id)?.title || "Unknown Job";
            const testResult = getTestResult(app.id);

            return (
              <div key={app.id} className="bg-card rounded-xl p-5 shadow-card border border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <ScoreRing score={app.match_score || 0} size={56} strokeWidth={5} />
                    <div>
                      <h3 className="font-semibold text-card-foreground">{app.student_profile?.full_name || "Student"}</h3>
                      <p className="text-sm text-muted-foreground">{app.student_profile?.college_name || "College"} · Applied for {jobTitle}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {(app.student_profile?.skills || []).slice(0, 4).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-[10px] mt-1 capitalize">{app.status}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* View Resume */}
                    <Button size="sm" variant="outline" className="text-xs gap-1"
                      onClick={() => viewResume(app.student_profile?.resume_url || "", app.student_profile?.full_name || "Candidate")}>
                      <Eye className="h-3.5 w-3.5" /> View Resume
                    </Button>

                    {/* Status-based actions */}
                    {app.status === "Applied" && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => onStatusUpdate(app.id, "Shortlisted")}>Shortlist</Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => onStatusUpdate(app.id, "Rejected")}>Reject</Button>
                      </>
                    )}

                    {app.status === "Shortlisted" && (
                      <>
                        <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs gap-1"
                          onClick={() => sendAptitudeTest(app)} disabled={sendingTest === app.id}>
                          {sendingTest === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          AI Test
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs gap-1"
                          onClick={() => { setPdfDialog({ open: true, app }); setGeneratedQuestions([]); setEditingQuestions(false); setPdfFile(null); }}>
                          <Upload className="h-3.5 w-3.5" /> PDF Test
                        </Button>
                      </>
                    )}

                    {app.status === "Aptitude Test" && (
                      <Badge variant="secondary" className="text-xs gap-1"><Clock className="h-3 w-3" /> Awaiting Test</Badge>
                    )}

                    {(app.status === "Test Completed" || app.status === "Test Terminated") && testResult && (
                      <Button size="sm" variant="outline" className="text-xs gap-1"
                        onClick={() => setTestDetailDialog({ open: true, test: testResult, appName: app.student_profile?.full_name || "Candidate" })}>
                        <Eye className="h-3.5 w-3.5" /> View Results
                      </Button>
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

                    {app.status === "Test Terminated" && (
                      <Badge variant="destructive" className="text-xs gap-1"><Ban className="h-3 w-3" /> Terminated - Malpractice</Badge>
                    )}

                    {app.status === "Interview" && (
                      <>
                        <Button size="sm" className="bg-success text-success-foreground text-xs" onClick={() => onStatusUpdate(app.id, "Selected")}>Select</Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => onStatusUpdate(app.id, "Rejected")}>Reject</Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline test result summary */}
                {testResult && (testResult.status === "completed" || testResult.status === "terminated") && (
                  <div className={`mt-3 p-3 rounded-lg border ${testResult.status === "terminated" ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"}`}>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-medium">Score: <strong>{testResult.score}%</strong></span>
                      <span>Questions: {testResult.total_questions}</span>
                      <span className={`flex items-center gap-1 ${(testResult.violations?.length || 0) > 0 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        <AlertTriangle className="h-3 w-3" /> {testResult.violations?.length || 0} violations
                      </span>
                      {testResult.status === "terminated" && (
                        <Badge variant="destructive" className="text-[10px]">AUTO-TERMINATED</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Live violation indicator for in-progress tests */}
                {testResult && testResult.status === "in_progress" && (
                  <div className="mt-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                      <span className="font-medium text-primary">Test in Progress</span>
                      {(testResult.violations?.length || 0) > 0 && (
                        <span className="text-destructive flex items-center gap-1 font-medium">
                          <AlertTriangle className="h-3 w-3" /> {testResult.violations?.length || 0} violations detected
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resume Viewer */}
      <Dialog open={resumeDialog.open} onOpenChange={(o) => setResumeDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Resume - {resumeDialog.name}</DialogTitle>
          </DialogHeader>
          <iframe src={resumeDialog.url} className="w-full flex-1 rounded-lg border border-border" style={{ height: "calc(80vh - 80px)" }} title="Resume Viewer" />
        </DialogContent>
      </Dialog>

      {/* Test Results Detail Dialog */}
      <Dialog open={testDetailDialog.open} onOpenChange={(o) => setTestDetailDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Results - {testDetailDialog.appName}</DialogTitle>
          </DialogHeader>
          {testDetailDialog.test && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-card-foreground">{testDetailDialog.test.score}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-card-foreground">{testDetailDialog.test.total_questions}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${(testDetailDialog.test.violations?.length || 0) > 0 ? "bg-destructive/10" : "bg-muted/50"}`}>
                  <p className={`text-2xl font-bold ${(testDetailDialog.test.violations?.length || 0) > 0 ? "text-destructive" : "text-card-foreground"}`}>
                    {testDetailDialog.test.violations?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Violations</p>
                </div>
              </div>

              {testDetailDialog.test.status === "terminated" && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <Ban className="h-4 w-4" /> Test was auto-terminated due to malpractice
                  </p>
                </div>
              )}

              {/* Violations Log */}
              {(testDetailDialog.test.violations?.length || 0) > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Malpractice Log
                  </h4>
                  <div className="space-y-2">
                    {(testDetailDialog.test.violations || []).map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-destructive/5 rounded border border-destructive/20 text-xs">
                        <span className="font-mono text-muted-foreground">{new Date(v.timestamp).toLocaleTimeString()}</span>
                        <Badge variant="destructive" className="text-[10px]">{v.type}</Badge>
                        <span className="text-card-foreground">{v.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Upload Dialog */}
      <Dialog open={pdfDialog.open} onOpenChange={(o) => { setPdfDialog((p) => ({ ...p, open: o })); if (!o) { setGeneratedQuestions([]); setEditingQuestions(false); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestions ? "Review & Edit Questions" : "Upload PDF for MCQ Generation"}</DialogTitle>
          </DialogHeader>

          {!editingQuestions ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex-1 text-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{pdfFile ? pdfFile.name : "Choose PDF file"}</span>
                  <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPdfFile(f); }} />
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPdfDialog({ open: false, app: null })}>Cancel</Button>
                <Button onClick={handlePdfUpload} disabled={!pdfFile || pdfProcessing} className="gradient-primary text-primary-foreground border-0 gap-2">
                  {pdfProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Generate MCQs
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{generatedQuestions.length} questions generated. Edit any question/option below, then send.</p>
              <div className="max-h-[50vh] overflow-y-auto space-y-3">
                {generatedQuestions.map((q, qi) => (
                  <div key={qi} className="bg-muted/30 rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-muted-foreground">Q{qi + 1}</span>
                      <Badge variant="secondary" className="text-[9px] capitalize">{q.category}</Badge>
                      <Badge variant="outline" className="text-[9px] capitalize">{q.difficulty}</Badge>
                    </div>
                    <Textarea
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...generatedQuestions];
                        updated[qi] = { ...updated[qi], question: e.target.value };
                        setGeneratedQuestions(updated);
                      }}
                      rows={2}
                      className="text-sm mb-2"
                    />
                    {q.options.map((opt: string, oi: number) => (
                      <div key={oi} className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold w-5 ${q.correct === oi ? "text-success" : "text-muted-foreground"}`}>
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const updated = [...generatedQuestions];
                            const newOptions = [...updated[qi].options];
                            newOptions[oi] = e.target.value;
                            updated[qi] = { ...updated[qi], options: newOptions };
                            setGeneratedQuestions(updated);
                          }}
                          className="text-xs h-8"
                        />
                        <button
                          onClick={() => {
                            const updated = [...generatedQuestions];
                            updated[qi] = { ...updated[qi], correct: oi };
                            setGeneratedQuestions(updated);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded ${q.correct === oi ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground hover:bg-success/20"}`}
                        >
                          {q.correct === oi ? "✓ Correct" : "Set"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingQuestions(false)}>Back</Button>
                <Button onClick={sendPdfQuestions} className="gradient-primary text-primary-foreground border-0 gap-2">
                  <Send className="h-4 w-4" /> Send {generatedQuestions.length} Questions
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruiterCandidates;
