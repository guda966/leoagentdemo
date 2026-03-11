import { useState, useEffect } from "react";
import {
  ClipboardList, MessageSquare, CheckCircle, TrendingUp, Bell, Loader2
} from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const StudentOverview = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ applications: 0, interviews: 0, offers: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchNotifications();
    }
  }, [user]);

  const fetchStats = async () => {
    const { data } = await supabase
      .from("applications")
      .select("status")
      .eq("student_id", user!.id);

    if (data) {
      setStats({
        applications: data.length,
        interviews: data.filter((a) => a.status === "Interview").length,
        offers: data.filter((a) => a.status === "Selected").length,
      });
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setNotifications(data);
  };

  // Calculate profile completion
  const completionItems = [
    { label: "Personal Details", done: !!(profile?.full_name && profile?.email) },
    { label: "Education", done: !!(profile?.college_name || (profile?.education as any[])?.length > 0) },
    { label: "Skills", done: (profile?.skills?.length || 0) > 0 },
    { label: "Projects", done: (profile?.projects as any[])?.length > 0 },
    { label: "Certifications", done: (profile?.certifications?.length || 0) > 0 },
    { label: "Experience", done: (profile?.experience as any[])?.length > 0 },
    { label: "Resume Upload", done: !!profile?.resume_url },
  ];
  const completionPercent = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);
  const readinessScore = profile?.placement_readiness_score || completionPercent;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Applications" value={stats.applications} icon={ClipboardList} />
        <StatCard title="Interviews" value={stats.interviews} icon={MessageSquare} />
        <StatCard title="Offers" value={stats.offers} icon={CheckCircle} />
        <StatCard title="Profile" value={`${completionPercent}%`} icon={TrendingUp} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Readiness score */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Placement Readiness</h3>
          <ScoreRing score={readinessScore} size={140} />
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Complete your profile to improve your score
          </p>
        </div>

        {/* Profile completion */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Profile Completion</h3>
          <div className="space-y-3">
            {completionItems.map((item) => (
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
              <span className="font-medium text-card-foreground">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
        </div>

        {/* Notifications / Skills */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Recent Notifications
          </h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-lg border text-xs ${n.is_read ? "bg-muted/30 border-border" : "bg-primary/5 border-primary/20"}`}>
                  <p className="font-medium text-card-foreground">{n.title}</p>
                  <p className="text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          )}

          {(profile?.skills?.length || 0) > 0 && (
            <div className="mt-5">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">YOUR SKILLS</h4>
              <div className="flex flex-wrap gap-2">
                {profile!.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
