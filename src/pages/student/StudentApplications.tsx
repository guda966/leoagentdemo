import { useState, useEffect } from "react";
import {
  Send, BookOpen, MessageSquare, CheckCircle, XCircle, Clock,
  Eye, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationWithJob {
  id: string;
  status: string;
  match_score: number | null;
  applied_at: string;
  updated_at: string;
  job: {
    id: string;
    title: string;
    company: string;
    salary_range: string | null;
    location: string | null;
  };
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; step: number }> = {
  Applied: { color: "bg-muted text-muted-foreground", icon: <Send className="h-3.5 w-3.5" />, step: 1 },
  Shortlisted: { color: "bg-primary/10 text-primary", icon: <BookOpen className="h-3.5 w-3.5" />, step: 2 },
  Interview: { color: "bg-accent/15 text-accent", icon: <MessageSquare className="h-3.5 w-3.5" />, step: 3 },
  Selected: { color: "bg-success/10 text-success", icon: <CheckCircle className="h-3.5 w-3.5" />, step: 4 },
  Rejected: { color: "bg-destructive/10 text-destructive", icon: <XCircle className="h-3.5 w-3.5" />, step: -1 },
};

const statusFlow = ["Applied", "Shortlisted", "Interview", "Selected"];

const StudentApplications = () => {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*, job:jobs(id, title, company, salary_range, location)")
      .eq("student_id", user!.id)
      .order("applied_at", { ascending: false });

    if (!error && data) {
      setApplications(
        data.map((a: any) => ({
          id: a.id,
          status: a.status,
          match_score: a.match_score,
          applied_at: a.applied_at,
          updated_at: a.updated_at,
          job: a.job,
        }))
      );
    }
    setLoading(false);
  };

  const filtered = applications.filter((app) => filter === "all" || app.status === filter);

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "Applied").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    selected: applications.filter((a) => a.status === "Selected").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
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
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", count: counts.total, key: "all" },
          { label: "Applied", count: counts.applied, key: "Applied" },
          { label: "Shortlisted", count: counts.shortlisted, key: "Shortlisted" },
          { label: "Interview", count: counts.interview, key: "Interview" },
          { label: "Selected", count: counts.selected, key: "Selected" },
          { label: "Rejected", count: counts.rejected, key: "Rejected" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`rounded-xl p-3 text-center transition-colors border ${
              filter === item.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-muted/50"
            }`}
          >
            <p className="text-2xl font-bold">{item.count}</p>
            <p className="text-xs font-medium">{item.label}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl p-10 text-center border border-border">
          <Send className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No applications yet. Browse jobs to get started!</p>
        </div>
      )}

      {/* Application cards */}
      <div className="space-y-4">
        {filtered.map((app) => {
          const config = statusConfig[app.status] || statusConfig.Applied;
          const logo = app.job.company.slice(0, 2).toUpperCase();
          const dateStr = new Date(app.applied_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

          return (
            <div key={app.id} className="bg-card rounded-xl p-5 shadow-card border border-border">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{app.job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.job.company}
                        {app.job.salary_range && ` · ${app.job.salary_range}`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}>
                      {config.icon} {app.status}
                    </span>
                  </div>

                  {/* Status flow */}
                  {app.status !== "Rejected" && (
                    <div className="flex items-center gap-1 mt-3">
                      {statusFlow.map((step, i) => {
                        const active = config.step >= i + 1;
                        return (
                          <div key={step} className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${active ? "bg-primary" : "bg-border"}`} />
                            <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                              {step}
                            </span>
                            {i < statusFlow.length - 1 && (
                              <div className={`h-px w-4 ${active ? "bg-primary" : "bg-border"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-muted-foreground">
                      <span className="mr-3"><Clock className="h-3 w-3 inline mr-1" />{dateStr}</span>
                      {app.match_score && (
                        <Badge variant="secondary" className="text-[10px]">{app.match_score}% match</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentApplications;
