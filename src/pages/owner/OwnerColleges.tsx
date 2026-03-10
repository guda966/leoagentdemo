import { useState, useEffect } from "react";
import { Plus, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface CollegeProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  college_name: string | null;
  address: string | null;
  place: string | null;
  created_at: string;
}

const OwnerColleges = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [colleges, setColleges] = useState<CollegeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "", college_name: "", address: "", place: "",
  });

  const fetchColleges = async () => {
    setLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "college");

    if (roles && roles.length > 0) {
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);
      setColleges((profiles as CollegeProfile[]) || []);
    } else {
      setColleges([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchColleges(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-managed-user", {
        body: { ...form, role: "college" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "College created!", description: `${form.college_name} can now log in.` });
      setForm({ full_name: "", email: "", password: "", phone: "", college_name: "", address: "", place: "" });
      setDialogOpen(false);
      fetchColleges();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">Manage college accounts. Each college gets their own portal to manage students.</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 gap-2">
              <Plus className="h-4 w-4" /> Add College
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New College</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div>
                <Label>College Name</Label>
                <Input value={form.college_name} onChange={(e) => setForm({ ...form, college_name: e.target.value })} placeholder="College name" className="mt-1.5" required />
              </div>
              <div>
                <Label>Admin Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Admin full name" className="mt-1.5" required />
              </div>
              <div>
                <Label>Place</Label>
                <Input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="City" className="mt-1.5" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" className="mt-1.5" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="mt-1.5" />
              </div>
              <div>
                <Label>Email (Login)</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@college.edu" className="mt-1.5" required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password" className="mt-1.5" required minLength={6} />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create College
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : colleges.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card border border-border text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No colleges added yet. Click "Add College" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {colleges.map((c) => (
            <div key={c.id} className="bg-card rounded-xl p-5 shadow-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">{(c.college_name || "C")[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{c.college_name || c.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {c.place && <Badge variant="secondary">{c.place}</Badge>}
                {c.phone && <span className="text-sm text-muted-foreground">{c.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerColleges;
