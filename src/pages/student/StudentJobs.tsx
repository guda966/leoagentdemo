import { useState, useEffect } from "react";
import {
  Search, MapPin, Briefcase, IndianRupee, Bookmark, BookmarkCheck,
  ExternalLink, Sparkles, Loader2, Send, FileText, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ScoreRing from "@/components/ScoreRing";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary_range: string | null;
  experience: string | null;
  skills_required: string[] | null;
  description: string | null;
  status: string | null;
  created_at: string;
  recruiter_id: string;
}

const StudentJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    if (user) fetchAppliedJobs();
  }, [user]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && data) setJobs(data);
    setLoading(false);
  };

  const fetchAppliedJobs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("applications")
      .select("job_id")
      .eq("student_id", user.id);
    if (data) setAppliedJobIds(data.map((a) => a.job_id));
  };

  const calculateMatch = (job: Job): number => {
    if (!profile?.skills || !job.skills_required) return 50;
    const studentSkills = profile.skills.map((s) => s.toLowerCase());
    const jobSkills = job.skills_required.map((s) => s.toLowerCase());
    if (jobSkills.length === 0) return 60;
    const matched = jobSkills.filter((s) => studentSkills.includes(s)).length;
    return Math.round((matched / jobSkills.length) * 100);
  };

  const handleApply = async () => {
    if (!applyingJob || !user) return;
    setSubmitting(true);
    try {
      const matchScore = calculateMatch(applyingJob);

      // 1. Create application
      const { error: appError } = await supabase.from("applications").insert({
        job_id: applyingJob.id,
        student_id: user.id,
        match_score: matchScore,
        status: "Applied",
      });
      if (appError) throw appError;

      // 2. Notify recruiter
      await supabase.from("notifications").insert({
        user_id: applyingJob.recruiter_id,
        title: "New Application",
        message: `${profile?.full_name || "A student"} applied for ${applyingJob.title} (${matchScore}% match)`,
        type: "application",
        related_id: applyingJob.id,
      });

      // 3. Notify college if student was created by a college
      if (profile?.created_by) {
        await supabase.from("notifications").insert({
          user_id: profile.created_by,
          title: "Student Applied",
          message: `${profile.full_name || "A student"} applied for ${applyingJob.title} at ${applyingJob.company}`,
          type: "application",
          related_id: applyingJob.id,
        });
      }

      setAppliedJobIds((prev) => [...prev, applyingJob.id]);
      toast({ title: "Application Submitted!", description: `Applied to ${applyingJob.title} at ${applyingJob.company}` });
      setApplyingJob(null);
      setCoverLetter("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))];

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.skills_required || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLocation = locationFilter === "all" || job.location === locationFilter;
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => calculateMatch(b) - calculateMatch(a));

  const toggleSave = (id: string) => {
    setSavedJobs((prev) => prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & filters */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px]">
              <MapPin className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc!}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-xs text-muted-foreground">Jobs are ranked by skill match with your profile</p>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">{filteredJobs.length} jobs found</p>

      {filteredJobs.length === 0 && (
        <div className="bg-card rounded-xl p-10 text-center border border-border">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No jobs posted yet. Check back soon!</p>
        </div>
      )}

      <div className="grid gap-4">
        {filteredJobs.map((job) => {
          const match = calculateMatch(job);
          const alreadyApplied = appliedJobIds.includes(job.id);
          return (
            <div key={job.id} className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-5">
                <ScoreRing score={match} size={56} strokeWidth={5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <button onClick={() => toggleSave(job.id)} className="shrink-0">
                      {savedJobs.includes(job.id) ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {job.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                    )}
                    {job.salary_range && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" /> {job.salary_range}
                      </span>
                    )}
                    {job.experience && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {job.experience}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo(job.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {(job.skills_required || []).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                    ))}
                    <div className="ml-auto flex gap-2">
                      {alreadyApplied ? (
                        <Button size="sm" disabled className="text-xs gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Applied
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="gradient-primary text-primary-foreground border-0 text-xs"
                          onClick={() => setApplyingJob(job)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" /> Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply dialog */}
      <Dialog open={!!applyingJob} onOpenChange={(open) => !open && setApplyingJob(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply to {applyingJob?.title}</DialogTitle>
            <DialogDescription>
              {applyingJob?.company} · {applyingJob?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Application steps */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-card-foreground">Application Process</h4>
              <div className="space-y-1.5">
                {[
                  "Profile & resume reviewed by AI",
                  "Application sent to recruiter",
                  "College notified of your application",
                  "Recruiter screens with AI match score",
                  "Shortlisted candidates get interview call",
                  "Technical & HR interview rounds",
                  "Offer letter if selected",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile check */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-card-foreground mb-2">Your Profile</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  {profile?.full_name ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                  <span>Name: {profile?.full_name || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {(profile?.skills?.length || 0) > 0 ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                  <span>Skills: {profile?.skills?.length || 0} listed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {profile?.resume_url ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                  <span>Resume: {profile?.resume_url ? "Uploaded" : "Not uploaded"}</span>
                </div>
              </div>
              {applyingJob && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-medium">Match Score:</span>
                  <Badge variant="secondary" className="text-xs">{calculateMatch(applyingJob)}%</Badge>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">Cover Note (optional)</label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a good fit for this role?"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyingJob(null)}>Cancel</Button>
            <Button
              className="gradient-primary text-primary-foreground border-0 gap-2"
              onClick={handleApply}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentJobs;
