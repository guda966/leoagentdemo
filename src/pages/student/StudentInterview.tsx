import { useState } from "react";
import {
  MessageSquare, Play, RotateCcw, Save, Clock, Star, ChevronRight,
  Mic, MicOff, ThumbsUp, ThumbsDown, Sparkles, History, Code, Users, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import ScoreRing from "@/components/ScoreRing";

const roles = [
  { value: "frontend", label: "Frontend Developer", icon: Code },
  { value: "backend", label: "Backend Developer", icon: Database },
  { value: "fullstack", label: "Full Stack Engineer", icon: Code },
  { value: "ml", label: "ML Engineer", icon: Sparkles },
  { value: "behavioral", label: "Behavioral / HR", icon: Users },
];

const mockQuestions: Record<string, { question: string; difficulty: string }[]> = {
  frontend: [
    { question: "Explain the virtual DOM in React and how it improves performance.", difficulty: "Medium" },
    { question: "What is the difference between useMemo and useCallback?", difficulty: "Medium" },
    { question: "How would you optimize a React application that has slow re-renders?", difficulty: "Hard" },
    { question: "Explain CSS-in-JS and its trade-offs compared to traditional CSS.", difficulty: "Easy" },
    { question: "How do you handle state management in large React applications?", difficulty: "Hard" },
  ],
  backend: [
    { question: "Explain the difference between SQL and NoSQL databases.", difficulty: "Easy" },
    { question: "How would you design a rate limiter for an API?", difficulty: "Hard" },
    { question: "What is the difference between REST and GraphQL?", difficulty: "Medium" },
    { question: "Explain microservices architecture and its pros/cons.", difficulty: "Medium" },
    { question: "How do you handle database migrations in production?", difficulty: "Hard" },
  ],
  fullstack: [
    { question: "Walk through how a request flows from browser to database and back.", difficulty: "Medium" },
    { question: "How would you implement authentication in a full-stack app?", difficulty: "Medium" },
    { question: "Explain the concept of server-side rendering vs client-side rendering.", difficulty: "Easy" },
  ],
  ml: [
    { question: "Explain the bias-variance tradeoff.", difficulty: "Medium" },
    { question: "How do you handle imbalanced datasets?", difficulty: "Medium" },
    { question: "What is the difference between bagging and boosting?", difficulty: "Hard" },
  ],
  behavioral: [
    { question: "Tell me about a time you had a conflict with a team member.", difficulty: "Medium" },
    { question: "Why do you want to work at this company?", difficulty: "Easy" },
    { question: "Describe a project you're most proud of and why.", difficulty: "Easy" },
  ],
};

const interviewHistory = [
  { id: 1, role: "Frontend Developer", date: "Feb 27, 2026", score: 78, questions: 5 },
  { id: 2, role: "Behavioral / HR", date: "Feb 24, 2026", score: 85, questions: 5 },
  { id: 3, role: "Full Stack Engineer", date: "Feb 20, 2026", score: 62, questions: 3 },
];

const StudentInterview = () => {
  const [selectedRole, setSelectedRole] = useState("frontend");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const questions = mockQuestions[selectedRole] || [];
  const isComplete = currentQuestion >= questions.length && interviewStarted;

  const submitAnswer = () => {
    setShowFeedback(true);
    const score = Math.floor(Math.random() * 30) + 60;
    setScores([...scores, score]);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setAnswer("");
    setCurrentQuestion((prev) => prev + 1);
  };

  const resetInterview = () => {
    setInterviewStarted(false);
    setCurrentQuestion(0);
    setAnswer("");
    setShowFeedback(false);
    setScores([]);
  };

  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="space-y-6">
      {!interviewStarted && !showHistory && (
        <>
          {/* Setup */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">AI Mock Interview</h3>
            <p className="text-sm text-muted-foreground mb-6">Practice with role-based questions and get AI-powered feedback on your responses.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Select Role</label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedRole === role.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <role.icon className="h-4 w-4" />
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-xl">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h4 className="font-semibold text-card-foreground mb-1">{roles.find(r => r.value === selectedRole)?.label}</h4>
                <p className="text-sm text-muted-foreground mb-1">{questions.length} questions</p>
                <p className="text-xs text-muted-foreground mb-4">~{questions.length * 3} min estimated</p>
                <Button onClick={() => setInterviewStarted(true)} className="gradient-primary text-primary-foreground border-0">
                  <Play className="h-4 w-4 mr-2" /> Start Interview
                </Button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-card-foreground">Interview History</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {interviewHistory.slice(0, 3).map((h) => (
                <div key={h.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <ScoreRing score={h.score} size={44} strokeWidth={4} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{h.role}</p>
                    <p className="text-xs text-muted-foreground">{h.date} · {h.questions} questions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showHistory && (
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Full Interview History</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>Back</Button>
          </div>
          <div className="space-y-3">
            {interviewHistory.map((h) => (
              <div key={h.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <ScoreRing score={h.score} size={56} strokeWidth={5} />
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{h.role}</p>
                  <p className="text-sm text-muted-foreground">{h.date} · {h.questions} questions</p>
                </div>
                <Button variant="outline" size="sm">Review</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {interviewStarted && !isComplete && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <Badge variant={
                questions[currentQuestion]?.difficulty === "Hard" ? "destructive" :
                questions[currentQuestion]?.difficulty === "Medium" ? "secondary" : "outline"
              }>
                {questions[currentQuestion]?.difficulty}
              </Badge>
            </div>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
          </div>

          {/* Question */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="flex items-start gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <p className="text-base font-medium text-card-foreground">{questions[currentQuestion]?.question}</p>
            </div>

            {!showFeedback ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={submitAnswer} disabled={!answer.trim()} className="gradient-primary text-primary-foreground border-0">
                    Submit Answer
                  </Button>
                  <Button variant="outline" disabled>
                    <Mic className="h-4 w-4 mr-2" /> Voice (Coming Soon)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Your answer */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">YOUR ANSWER</p>
                  <p className="text-sm text-card-foreground">{answer}</p>
                </div>

                {/* AI Feedback */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-card-foreground">AI Feedback</p>
                    <div className="ml-auto flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-sm font-bold text-card-foreground">{scores[scores.length - 1]}/100</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-card-foreground">
                    <p><strong>Strengths:</strong> Good understanding of the core concept. Clear structure in your answer.</p>
                    <p><strong>Areas to improve:</strong> Add specific examples or code snippets to strengthen your response. Mention trade-offs and edge cases.</p>
                    <p><strong>Tip:</strong> Use the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
                  </div>
                </div>

                <Button onClick={nextQuestion} className="gradient-primary text-primary-foreground border-0">
                  {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Interview"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
          <h3 className="text-xl font-bold text-card-foreground mb-2">Interview Complete!</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {roles.find(r => r.value === selectedRole)?.label} · {questions.length} questions
          </p>
          <div className="flex justify-center mb-6">
            <ScoreRing score={avgScore} size={140} />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {avgScore >= 80 ? "Excellent performance! You're well-prepared." :
             avgScore >= 60 ? "Good effort! Practice specific areas to improve." :
             "Keep practicing! Focus on fundamentals and examples."}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={resetInterview} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button className="gradient-primary text-primary-foreground border-0">
              <Save className="h-4 w-4 mr-2" /> Save Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInterview;
