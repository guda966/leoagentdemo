import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = [
  { id: "student", label: "Student", icon: GraduationCap, path: "/student" },
  { id: "college", label: "College", icon: Building2, path: "/college" },
  { id: "recruiter", label: "Recruiter", icon: Briefcase, path: "/recruiter" },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find((r) => r.id === selectedRole);
    if (role) navigate(role.path);
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

      {/* Right - login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Select your role and sign in to continue</p>

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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@college.edu" defaultValue="demo@leoaxis.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" defaultValue="password" className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo: click Sign In with any role to explore
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
