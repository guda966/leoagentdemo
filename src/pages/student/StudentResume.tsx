import { useState } from "react";
import {
  FileText, Download, Save, Plus, Trash2, Eye, Sparkles, Target,
  AlertTriangle, CheckCircle, Lightbulb, Copy, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ScoreRing from "@/components/ScoreRing";

const resumeVersions = [
  { id: 1, name: "General Resume v2", updated: "Feb 28, 2026", score: 72 },
  { id: 2, name: "Frontend Developer", updated: "Feb 20, 2026", score: 85 },
  { id: 3, name: "ML Engineer", updated: "Feb 15, 2026", score: 68 },
];

const resumeSections = [
  { id: "summary", title: "Professional Summary", content: "Results-driven Computer Science student with hands-on experience in full-stack development and machine learning. Proven ability to deliver scalable web applications using React, Node.js, and cloud services." },
  { id: "education", title: "Education", content: "B.Tech in Computer Science\nIndian Institute of Technology, Bangalore\n2022 – 2026 | CGPA: 8.7/10" },
  { id: "experience", title: "Experience", content: "Frontend Development Intern | TechStartup\nJun 2025 – Aug 2025\n• Built responsive UI components using React and TypeScript\n• Improved page load time by 40% through code splitting\n• Collaborated with backend team on API integration" },
  { id: "projects", title: "Projects", content: "E-Commerce Platform\n• Full-stack app with React frontend and Node.js backend\n• Implemented JWT auth, Stripe payments, and real-time notifications\n\nML Stock Predictor\n• LSTM-based stock price prediction model\n• Built Flask API and React dashboard for visualization" },
  { id: "skills", title: "Technical Skills", content: "Languages: JavaScript, TypeScript, Python, SQL\nFrameworks: React, Node.js, Express, Flask, TensorFlow\nTools: Docker, AWS, Git, CI/CD, MongoDB, PostgreSQL" },
  { id: "certifications", title: "Certifications", content: "• AWS Cloud Practitioner – Amazon (2025)\n• React Advanced Patterns – Udemy (2025)" },
];

const aiSuggestions = [
  { type: "improvement", text: "Add quantifiable achievements (e.g., 'Improved load time by 40%')", section: "experience" },
  { type: "keyword", text: "Include keywords: CI/CD, Agile, REST API, Microservices", section: "skills" },
  { type: "improvement", text: "Add a professional summary section highlighting your strengths", section: "summary" },
  { type: "gap", text: "Missing: System Design, Data Structures, Problem Solving keywords", section: "skills" },
  { type: "improvement", text: "Use stronger action verbs: Led, Architected, Optimized, Spearheaded", section: "experience" },
];

const keywordMatches = [
  { keyword: "React", found: true },
  { keyword: "TypeScript", found: true },
  { keyword: "Node.js", found: true },
  { keyword: "REST API", found: false },
  { keyword: "Agile", found: false },
  { keyword: "CI/CD", found: true },
  { keyword: "System Design", found: false },
  { keyword: "Microservices", found: false },
  { keyword: "Docker", found: true },
  { keyword: "AWS", found: true },
];

const skillGaps = [
  { skill: "System Design", importance: "High", suggestion: "Take a system design course and add to projects" },
  { skill: "Agile/Scrum", importance: "Medium", suggestion: "Get Scrum certification or mention agile experience" },
  { skill: "REST API Design", importance: "High", suggestion: "Document API projects and mention in experience" },
  { skill: "Testing", importance: "Medium", suggestion: "Add unit testing experience with Jest/Pytest" },
];

const StudentResume = () => {
  const [sections, setSections] = useState(resumeSections);
  const [activeVersion, setActiveVersion] = useState(1);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const resumeText = sections.map(s => `${s.title}\n${s.content}`).join("\n\n");
      const { data, error } = await supabase.functions.invoke("ai-resume-analyzer", {
        body: { resumeText, jobDescription: jobDescription || undefined },
      });
      if (error) throw error;
      if (data?.analysis) {
        setAiResult(data.analysis);
        setAnalyzed(true);
      }
    } catch (err: any) {
      console.error("AI analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="builder">Resume Builder</TabsTrigger>
          <TabsTrigger value="analyzer">AI Resume Analyzer</TabsTrigger>
          <TabsTrigger value="linkedin">AI LinkedIn Analyzer</TabsTrigger>
        </TabsList>

        {/* Resume Builder */}
        <TabsContent value="builder" className="space-y-6">
          {/* Version selector */}
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">Versions:</h3>
            {resumeVersions.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVersion(v.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeVersion === v.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {v.name}
              </button>
            ))}
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> New Version</Button>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Editor */}
            <div className="md:col-span-3 space-y-4">
              {sections.map((section, i) => (
                <div key={section.id} className="bg-card rounded-xl p-5 shadow-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-card-foreground">{section.title}</h4>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={section.content}
                    onChange={(e) => {
                      const updated = [...sections];
                      updated[i] = { ...section, content: e.target.value };
                      setSections(updated);
                    }}
                    rows={section.content.split("\n").length + 1}
                    className="text-sm font-mono"
                  />
                </div>
              ))}
              <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Section</Button>
            </div>

            {/* Preview & actions */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-card rounded-xl p-5 shadow-card border border-border sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-card-foreground">Actions</h4>
                </div>
                <div className="space-y-2">
                  <Button className="w-full gradient-primary text-primary-foreground border-0">
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" /> Preview
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Save className="h-4 w-4 mr-2" /> Save Version
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-card-foreground mb-3">ATS Score</h4>
                  <div className="flex justify-center">
                    <ScoreRing score={resumeVersions.find(v => v.id === activeVersion)?.score || 72} size={100} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Based on ATS-friendly formatting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* AI Resume Analyzer */}
        <TabsContent value="analyzer" className="space-y-6">
          {/* Job description input */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Paste Job Description for AI Analysis</h3>
            <Textarea
              placeholder="Paste the job description here to match your resume against it..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
            />
            <Button onClick={handleAnalyze} className="mt-3 gradient-primary text-primary-foreground border-0" disabled={analyzing}>
              {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {analyzing ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </div>

          {analyzed && aiResult && (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Overall score */}
                <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-card-foreground mb-4">Resume Score</h3>
                  <ScoreRing score={aiResult.score || 0} size={130} />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {aiResult.score >= 80 ? "Great score!" : "Improve keywords to reach 85+"}
                  </p>
                </div>

                {/* Keyword match */}
                <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                  <h3 className="text-sm font-semibold text-card-foreground mb-4">Keyword Match</h3>
                  <div className="space-y-2">
                    {(aiResult.matchedKeywords || []).map((kw: string) => (
                      <div key={kw} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        <span className="text-sm text-card-foreground">{kw}</span>
                      </div>
                    ))}
                    {(aiResult.missingKeywords || []).map((kw: string) => (
                      <div key={kw} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
                        <span className="text-sm text-muted-foreground">{kw}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Match Rate</span>
                      <span className="font-medium text-card-foreground">
                        {Math.round(((aiResult.matchedKeywords?.length || 0) / Math.max((aiResult.matchedKeywords?.length || 0) + (aiResult.missingKeywords?.length || 0), 1)) * 100)}%
                      </span>
                    </div>
                    <Progress value={Math.round(((aiResult.matchedKeywords?.length || 0) / Math.max((aiResult.matchedKeywords?.length || 0) + (aiResult.missingKeywords?.length || 0), 1)) * 100)} className="h-2" />
                  </div>
                </div>

                {/* Skill gaps */}
                <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                  <h3 className="text-sm font-semibold text-card-foreground mb-4">Skill Gaps</h3>
                  <div className="space-y-3">
                    {(aiResult.skillGaps || []).map((gap: any) => (
                      <div key={gap.skill} className="p-2.5 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-3.5 w-3.5 text-accent" />
                          <span className="text-sm font-medium text-card-foreground">{gap.skill}</span>
                          <Badge variant={gap.importance === "High" ? "destructive" : "secondary"} className="text-[10px] ml-auto">
                            {gap.importance}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{gap.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="text-sm font-semibold text-card-foreground mb-4">
                  <Lightbulb className="h-4 w-4 inline mr-2 text-accent" />
                  AI Improvement Suggestions
                </h3>
                <div className="space-y-3">
                  {(aiResult.suggestions || []).map((s: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="h-6 w-6 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-card-foreground">{s.text}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{s.section}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* LinkedIn Analyzer */}
        <TabsContent value="linkedin" className="space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">LinkedIn Profile Analyzer</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter your LinkedIn profile URL for AI-powered analysis</p>
            <div className="flex gap-3">
              <Input placeholder="https://linkedin.com/in/your-profile" className="flex-1" />
              <Button className="gradient-primary text-primary-foreground border-0">
                <Sparkles className="h-4 w-4 mr-2" /> Analyze
              </Button>
            </div>
          </div>

          {/* Simulated results */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Profile Strength</h3>
              <ScoreRing score={65} size={120} />
              <p className="text-xs text-muted-foreground mt-3">Intermediate</p>
            </div>

            <div className="md:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Keyword Suggestions</h3>
              <div className="space-y-3">
                {[
                  "Add 'Full-Stack Developer' to your headline",
                  "Include industry keywords: SaaS, Scalable Architecture, API Design",
                  "Add a custom LinkedIn URL for better SEO",
                  "Write a detailed About section with accomplishments",
                  "Request recommendations from supervisors/professors",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-card-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentResume;
