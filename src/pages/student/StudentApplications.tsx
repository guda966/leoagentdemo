import { useState } from "react";
import {
  Send, BookOpen, MessageSquare, CheckCircle, XCircle, Clock,
  Filter, ChevronDown, ExternalLink, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const applications = [
  { id: 1, company: "TechCorp", role: "Frontend Developer", status: "Interview", date: "Feb 28", logo: "TC", salary: "₹8-12 LPA", nextStep: "Technical round on Mar 5", notes: "Cleared coding round" },
  { id: 2, company: "InnovateLabs", role: "Full Stack Engineer", status: "Shortlisted", date: "Feb 25", logo: "IL", salary: "₹10-15 LPA", nextStep: "Awaiting interview schedule", notes: "Profile reviewed" },
  { id: 3, company: "DataMinds", role: "ML Engineer", status: "Applied", date: "Feb 22", logo: "DM", salary: "₹12-18 LPA", nextStep: "Under review", notes: "" },
  { id: 4, company: "Acme Inc", role: "SDE Intern", status: "Selected", date: "Feb 15", logo: "AI", salary: "₹40K/month", nextStep: "Joining on Mar 15", notes: "Offer accepted" },
  { id: 5, company: "StartupXYZ", role: "Backend Dev", status: "Rejected", date: "Feb 10", logo: "SX", salary: "₹7-11 LPA", nextStep: "—", notes: "Position filled" },
  { id: 6, company: "MegaTech", role: "SDE Intern", status: "Interview", date: "Feb 8", logo: "MT", salary: "₹35K/month", nextStep: "HR round on Mar 2", notes: "Cleared technical round" },
  { id: 7, company: "CloudBase", role: "DevOps Engineer", status: "Applied", date: "Feb 5", logo: "CB", salary: "₹9-13 LPA", nextStep: "Under review", notes: "" },
  { id: 8, company: "FinServe", role: "Full Stack Dev", status: "Shortlisted", date: "Feb 3", logo: "FS", salary: "₹11-16 LPA", nextStep: "Assignment due Mar 4", notes: "Take-home assignment sent" },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode; step: number }> = {
  Applied: { color: "bg-muted text-muted-foreground", icon: <Send className="h-3.5 w-3.5" />, step: 1 },
  Shortlisted: { color: "bg-primary/10 text-primary", icon: <BookOpen className="h-3.5 w-3.5" />, step: 2 },
  Interview: { color: "bg-accent/15 text-accent", icon: <MessageSquare className="h-3.5 w-3.5" />, step: 3 },
  Selected: { color: "bg-success/10 text-success", icon: <CheckCircle className="h-3.5 w-3.5" />, step: 4 },
  Rejected: { color: "bg-destructive/10 text-destructive", icon: <XCircle className="h-3.5 w-3.5" />, step: -1 },
};

const statusFlow = ["Applied", "Shortlisted", "Interview", "Selected"];

const StudentApplications = () => {
  const [filter, setFilter] = useState("all");

  const filtered = applications.filter((app) => filter === "all" || app.status === filter);

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "Applied").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    selected: applications.filter((a) => a.status === "Selected").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

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

      {/* Application cards */}
      <div className="space-y-4">
        {filtered.map((app) => {
          const config = statusConfig[app.status];
          return (
            <div key={app.id} className="bg-card rounded-xl p-5 shadow-card border border-border">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {app.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{app.role}</h3>
                      <p className="text-sm text-muted-foreground">{app.company} · {app.salary}</p>
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
                      <span className="mr-3"><Clock className="h-3 w-3 inline mr-1" />{app.date}</span>
                      {app.nextStep && <span className="text-card-foreground font-medium">Next: {app.nextStep}</span>}
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                    </Button>
                  </div>
                  {app.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">Note: {app.notes}</p>
                  )}
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
