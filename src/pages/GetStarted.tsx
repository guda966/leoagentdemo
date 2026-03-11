import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const GetStarted = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp, user, role: userRole, loading } = useAuth();
  const { toast } = useToast();

  if (user && userRole && !loading) {
    navigate(`/${userRole}`, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signUp(email, password, fullName, "student");
      toast({
        title: "Account created!",
        description: "Check your email to verify your account, then sign in.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - brand panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">L</span>
            </div>
            <span className="text-2xl font-bold text-primary-foreground">Leoaxis</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4 leading-tight">
            Launch Your Career with Leoaxis
          </h2>
          <p className="text-primary-foreground/60 leading-relaxed">
            Create your student account to explore job opportunities, build your profile, get AI-powered resume analysis, and apply to top companies hiring on campus.
          </p>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Student Account</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Get Started</h1>
          <p className="text-muted-foreground mb-8">
            Create your student account to explore jobs and build your career
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required minLength={6} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
