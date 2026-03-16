import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Camera, Clock, CheckCircle, Shield, Loader2, ChevronLeft, ChevronRight, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  category: string;
  difficulty: string;
}

interface AptitudeTest {
  id: string;
  job_id: string;
  application_id: string;
  questions: Question[];
  status: string;
  time_limit_minutes: number;
  total_questions: number;
  violations: any[];
  started_at: string | null;
  recruiter_id: string;
}

const MAX_VIOLATIONS = 3;

const StudentAptitudeTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [terminatedTests, setTerminatedTests] = useState<AptitudeTest[]>([]);
  const [activeTest, setActiveTest] = useState<AptitudeTest | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState<any[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [terminated, setTerminated] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const violationsRef = useRef<any[]>([]);
  const activeTestRef = useRef<AptitudeTest | null>(null);
  const answersRef = useRef<(number | null)[]>([]);

  useEffect(() => {
    activeTestRef.current = activeTest;
  }, [activeTest]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (user) fetchTests();
  }, [user]);

  const fetchTests = async () => {
    // Fetch pending/in_progress tests
    const { data } = await supabase
      .from("aptitude_tests")
      .select("*")
      .eq("student_id", user!.id)
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false });
    if (data) setTests(data as any);

    // Fetch terminated tests
    const { data: terminated } = await supabase
      .from("aptitude_tests")
      .select("*")
      .eq("student_id", user!.id)
      .eq("status", "terminated")
      .order("created_at", { ascending: false });
    if (terminated) setTerminatedTests(terminated as any);

    setLoading(false);
  };

  const startTest = async (test: AptitudeTest) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError(true);
      toast({ title: "Camera Required", description: "You must enable your camera to take this test", variant: "destructive" });
      return;
    }

    setActiveTest(test);
    setAnswers(new Array(test.questions.length).fill(null));
    setCurrentQ(0);
    setViolations([]);
    violationsRef.current = [];
    setTimeLeft(test.time_limit_minutes * 60);
    setTerminated(false);

    await supabase.from("aptitude_tests").update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    } as any).eq("id", test.id);

    setStarted(true);
    setConfirmStart(false);
  };

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // Proctoring
  useEffect(() => {
    if (!started) return;

    const handleVisibility = () => {
      if (document.hidden) addViolation("tab_switch", "Switched to another tab/window");
    };
    const handleBlur = () => addViolation("window_blur", "Left the test window");
    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); addViolation("copy_attempt", "Attempted to copy content"); };
    const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); addViolation("paste_attempt", "Attempted to paste content"); };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) || e.key === "F12") {
        e.preventDefault();
        addViolation("devtools_attempt", "Attempted to open developer tools or take screenshot");
      }
    };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); addViolation("right_click", "Right-click detected"); };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [started]);

  const addViolation = async (type: string, description: string) => {
    const violation = { type, description, timestamp: new Date().toISOString() };
    violationsRef.current = [...violationsRef.current, violation];
    setViolations([...violationsRef.current]);

    const test = activeTestRef.current;
    if (!test) return;

    // Save violation
    await supabase.from("aptitude_tests").update({
      violations: violationsRef.current,
    } as any).eq("id", test.id);

    // Real-time notification to recruiter
    await supabase.from("notifications").insert({
      user_id: test.recruiter_id,
      title: "🚨 Proctoring Violation",
      message: `${description} (Violation ${violationsRef.current.length}/${MAX_VIOLATIONS})`,
      type: "proctoring_violation",
      related_id: test.id,
    });

    // Check if max violations reached - TERMINATE TEST
    if (violationsRef.current.length >= MAX_VIOLATIONS) {
      toast({
        title: "❌ Test Terminated",
        description: `Your test has been terminated due to ${MAX_VIOLATIONS} malpractice violations. You cannot retake this test.`,
        variant: "destructive",
      });
      await terminateTest(test);
    } else {
      toast({
        title: `⚠️ Violation ${violationsRef.current.length}/${MAX_VIOLATIONS}`,
        description: `${description}. ${MAX_VIOLATIONS - violationsRef.current.length} more will terminate your test.`,
        variant: "destructive",
      });
    }
  };

  const terminateTest = async (test: AptitudeTest) => {
    const currentAnswers = answersRef.current;
    const questions = test.questions;
    let correct = 0;
    currentAnswers.forEach((ans, i) => {
      if (ans !== null && ans === questions[i].correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    await supabase.from("aptitude_tests").update({
      answers: currentAnswers,
      score,
      status: "terminated",
      completed_at: new Date().toISOString(),
      violations: violationsRef.current,
    } as any).eq("id", test.id);

    // Update application
    await supabase.from("applications").update({ status: "Test Terminated" }).eq("id", test.application_id);

    // Notify recruiter
    await supabase.from("notifications").insert({
      user_id: test.recruiter_id,
      title: "❌ Test Terminated - Malpractice",
      message: `Candidate's test was auto-terminated after ${violationsRef.current.length} violations. Score at termination: ${score}%`,
      type: "test_terminated",
      related_id: test.id,
    });

    // Notify college
    const { data: collegeRoles } = await supabase.from("user_roles").select("user_id").eq("role", "college");
    if (collegeRoles) {
      for (const cr of collegeRoles) {
        await supabase.from("notifications").insert({
          user_id: cr.user_id,
          title: "Student Test Terminated",
          message: `A student's aptitude test was terminated due to malpractice (${violationsRef.current.length} violations)`,
          type: "test_terminated",
          related_id: test.id,
        });
      }
    }

    // Cleanup
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setActiveTest(null);
    setStarted(false);
    setTerminated(true);
    fetchTests();
  };

  const handleSubmit = async () => {
    if (!activeTestRef.current || submitting) return;
    setSubmitting(true);
    const test = activeTestRef.current;
    const currentAnswers = answersRef.current;

    const questions = test.questions;
    let correct = 0;
    currentAnswers.forEach((ans, i) => {
      if (ans !== null && ans === questions[i].correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    try {
      await supabase.from("aptitude_tests").update({
        answers: currentAnswers,
        score,
        status: "completed",
        completed_at: new Date().toISOString(),
        violations: violationsRef.current,
      } as any).eq("id", test.id);

      await supabase.from("applications").update({ status: "Test Completed" }).eq("id", test.application_id);

      await supabase.from("notifications").insert({
        user_id: test.recruiter_id,
        title: "Aptitude Test Completed",
        message: `Candidate scored ${score}% (${correct}/${questions.length}). Violations: ${violationsRef.current.length}`,
        type: "test_completed",
        related_id: test.id,
      });

      const { data: collegeRoles } = await supabase.from("user_roles").select("user_id").eq("role", "college");
      if (collegeRoles) {
        for (const cr of collegeRoles) {
          await supabase.from("notifications").insert({
            user_id: cr.user_id,
            title: "Student Test Completed",
            message: `Student completed aptitude test with score ${score}%. Violations: ${violationsRef.current.length}`,
            type: "test_completed",
            related_id: test.id,
          });
        }
      }

      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setActiveTest(null);
      setStarted(false);
      fetchTests();
    } catch (err: any) {
      toast({ title: "Error submitting", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Active test UI
  if (started && activeTest) {
    const q = activeTest.questions[currentQ];
    const answered = answers.filter((a) => a !== null).length;

    return (
      <div className="space-y-4 select-none" onCopy={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <video ref={videoRef} autoPlay muted playsInline className="w-20 h-16 rounded-lg object-cover border-2 border-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-success rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">
                Question {currentQ + 1} of {activeTest.total_questions}
              </p>
              <Progress value={(answered / activeTest.total_questions) * 100} className="h-1.5 w-32 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {violations.length > 0 && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" /> {violations.length}/{MAX_VIOLATIONS} violations
              </Badge>
            )}
            <div className={`flex items-center gap-1.5 font-mono text-lg font-bold ${timeLeft < 300 ? "text-destructive" : "text-card-foreground"}`}>
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-[10px] capitalize">{q.category}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{q.difficulty}</Badge>
          </div>
          <h2 className="text-lg font-semibold text-card-foreground mb-6">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQ] = i;
                  setAnswers(newAnswers);
                }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQ] === i
                    ? "border-primary bg-primary/10 text-card-foreground"
                    : "border-border bg-card hover:border-primary/50 text-card-foreground"
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setCurrentQ((q) => Math.max(0, q - 1))} disabled={currentQ === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="flex flex-wrap gap-1 max-w-md justify-center">
            {activeTest.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`h-7 w-7 rounded text-[10px] font-semibold transition-all ${
                  i === currentQ ? "bg-primary text-primary-foreground"
                    : answers[i] !== null ? "bg-success/20 text-success border border-success/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {currentQ < activeTest.total_questions - 1 ? (
            <Button size="sm" onClick={() => setCurrentQ((q) => q + 1)} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" className="bg-success text-success-foreground gap-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Submit Test
            </Button>
          )}
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-2">{answered}/{activeTest.total_questions} answered</p>
          <Button className="w-full bg-success text-success-foreground" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Test ({answered}/{activeTest.total_questions} answered)
          </Button>
        </div>
      </div>
    );
  }

  // Test list UI
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">Aptitude Tests</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your assigned aptitude tests. Camera must be enabled and proctoring will monitor tab switches, copy-paste, and screen changes. <strong>{MAX_VIOLATIONS} violations = test terminated.</strong>
        </p>
      </div>

      {tests.length === 0 && terminatedTests.length === 0 ? (
        <div className="bg-card rounded-xl p-10 text-center border border-border">
          <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No pending aptitude tests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <div key={test.id} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">Aptitude Test</h3>
                <p className="text-sm text-muted-foreground">
                  {test.total_questions} MCQ questions · {test.time_limit_minutes} minutes
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs"><Camera className="h-3 w-3 mr-1" /> Camera Required</Badge>
                  <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" /> Proctored</Badge>
                  <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" /> {MAX_VIOLATIONS} violations = exit</Badge>
                </div>
              </div>
              <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setConfirmStart(true)}>
                Start Test
              </Button>

              <Dialog open={confirmStart} onOpenChange={setConfirmStart}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>⚠️ Before You Begin</DialogTitle>
                    <DialogDescription className="space-y-2 pt-2">
                      <p>This is a proctored aptitude test. Please note:</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Your <strong>webcam will be active</strong> throughout the test</li>
                        <li><strong>Tab switching</strong> will be detected and reported</li>
                        <li><strong>Copy-paste</strong> is disabled</li>
                        <li><strong>Right-click and screenshots</strong> are blocked</li>
                        <li>All violations are reported to the recruiter in <strong>real-time</strong></li>
                        <li><strong>{MAX_VIOLATIONS} violations will auto-terminate your test</strong></li>
                        <li>Terminated tests <strong>cannot be retaken</strong></li>
                        <li>You have <strong>{test.time_limit_minutes} minutes</strong> to complete {test.total_questions} questions</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={() => setConfirmStart(false)}>Cancel</Button>
                    <Button className="gradient-primary text-primary-foreground border-0" onClick={() => startTest(test)}>
                      I Understand, Start Test
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}

          {/* Terminated tests */}
          {terminatedTests.map((test) => (
            <div key={test.id} className="bg-card rounded-xl p-5 shadow-card border border-destructive/30 opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-destructive" />
                    <h3 className="font-semibold text-destructive">Test Terminated</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This test was terminated due to {(test.violations as any[])?.length || 0} malpractice violations. You cannot retake this test.
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">Terminated</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
    </div>
  );
};

export default StudentAptitudeTest;
