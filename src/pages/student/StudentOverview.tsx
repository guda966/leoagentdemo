import {
  ClipboardList, MessageSquare, CheckCircle, TrendingUp, BookOpen
} from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const skills = ["React", "TypeScript", "Python", "Node.js", "SQL", "Machine Learning", "Docker", "AWS"];

const StudentOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Applications" value={12} icon={ClipboardList} trend={{ value: 20, positive: true }} />
        <StatCard title="Interviews" value={4} icon={MessageSquare} trend={{ value: 33, positive: true }} />
        <StatCard title="Offers" value={1} icon={CheckCircle} />
        <StatCard title="Profile Views" value={48} icon={TrendingUp} trend={{ value: 15, positive: true }} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Readiness score */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Placement Readiness</h3>
          <ScoreRing score={78} size={140} />
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Complete certifications to reach 85%+
          </p>
        </div>

        {/* Profile completion */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Profile Completion</h3>
          <div className="space-y-3">
            {[
              { label: "Personal Details", done: true },
              { label: "Education", done: true },
              { label: "Skills", done: true },
              { label: "Projects", done: true },
              { label: "Certifications", done: false },
              { label: "Experience", done: false },
              { label: "Resume Upload", done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ${item.done ? "bg-success" : "bg-muted"}`}>
                  {item.done && <CheckCircle className="h-3 w-3 text-success-foreground" />}
                </div>
                <span className={`text-sm ${item.done ? "text-card-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-card-foreground">71%</span>
            </div>
            <Progress value={71} className="h-2" />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
          </div>
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">SUGGESTED SKILLS</h4>
            <div className="flex flex-wrap gap-2">
              {["Kubernetes", "GraphQL", "Redis"].map((s) => (
                <Badge key={s} variant="outline" className="text-xs border-dashed">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
