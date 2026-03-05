import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Building2, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "student" as const, label: "Student", icon: GraduationCap, path: "/student" },
  { id: "college" as const, label: "College", icon: Building2, path: "/college" },
  { id: "recruiter" as const, label: "Recruiter", icon: Briefcase, path: "/recruiter" },
];

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "college" | "recruiter">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, role: userRole, loading } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user && userRole && !loading) {
    navigate(`/${userRole}`, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName, selectedRole);
        toast({ title: "Account created!", description: "Check your email to verify your account." });
      } else {
        await signIn(email, password);
        // Role-based redirect will happen via auth state change
        const role = roles.find((r) => r.id === selectedRole);
        navigate(role?.path || "/student");
      }
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
            AI-Powered Placement Platform
          </h2>
          <p className="text-primary-foreground/60 leading-relaxed">
            Smart campus hiring connecting students, colleges, and recruiters with AI-driven insights and tools.
          </p>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isSignUp ? "Create Account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? "Select your role and register" : "Select your role and sign in to continue"}
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedRole === role.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <role.icon className={`h-5 w-5 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="mt-1.5" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required minLength={6} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
