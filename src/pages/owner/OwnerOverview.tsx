import { useEffect, useState } from "react";
import { Briefcase, Building2, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/hooks/useAuth";

const OwnerOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ recruiters: 0, colleges: 0, students: 0, jobs: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      // Count recruiters
      const { count: rCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "recruiter");

      // Count colleges
      const { count: cCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "college");

      // Count students
      const { count: sCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      // Count jobs
      const { count: jCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });

      setStats({
        recruiters: rCount || 0,
        colleges: cCount || 0,
        students: sCount || 0,
        jobs: jCount || 0,
      });
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Recruiters" value={stats.recruiters} icon={Briefcase} />
        <StatCard title="Colleges" value={stats.colleges} icon={Building2} />
        <StatCard title="Students" value={stats.students} icon={Users} />
        <StatCard title="Active Jobs" value={stats.jobs} icon={TrendingUp} />
      </div>

      <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
        <h2 className="text-xl font-bold text-card-foreground mb-2">Welcome to Leoaxis Admin</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Manage your placement platform. Add recruiters and colleges from the sidebar, and they'll be able to log in with their credentials.
        </p>
      </div>
    </div>
  );
};

export default OwnerOverview;
