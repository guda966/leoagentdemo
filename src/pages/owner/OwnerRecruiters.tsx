import { useState, useEffect } from "react";
import { Plus, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface RecruiterProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
}

const OwnerRecruiters = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "", company_name: "",
  });

  const fetchRecruiters = async () => {
    setLoading(true);
    // Get all recruiter user_ids
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "recruiter");

    if (roles && roles.length > 0) {
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
      setRecruiters((profiles as RecruiterProfile[]) || []);
    } else {
      setRecruiters([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecruiters(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-managed-user", {
        body: { ...form, role: "recruiter" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Recruiter created!", description: `${form.full_name} can now log in.` });
      setForm({ full_name: "", email: "", password: "", phone: "", company_name: "" });
      setDialogOpen(false);
      fetchRecruiters();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">Manage recruiter accounts. Each recruiter gets their own dashboard.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 gap-2">
              <Plus className="h-4 w-4" /> Add Recruiter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Recruiter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Recruiter name" className="mt-1.5" required />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name" className="mt-1.5" required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="mt-1.5" />
              </div>
              <div>
                <Label>Email (Login)</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="recruiter@company.com" className="mt-1.5" required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password" className="mt-1.5" required minLength={6} />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Recruiter
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : recruiters.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card border border-border text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recruiters added yet. Click "Add Recruiter" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recruiters.map((r) => (
            <div key={r.id} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{(r.full_name || "R")[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{r.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{r.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {r.company_name && <Badge variant="secondary">{r.company_name}</Badge>}
                {r.phone && <span className="text-sm text-muted-foreground">{r.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerRecruiters;
