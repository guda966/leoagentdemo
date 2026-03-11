import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Building2, Briefcase, Brain, BarChart3, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Brain,
    title: "AI Resume Analyzer",
    desc: "Get instant ATS scoring, keyword analysis, and improvement suggestions powered by AI.",
  },
  {
    icon: BarChart3,
    title: "Placement Analytics",
    desc: "Real-time dashboards tracking readiness scores, department heatmaps, and hiring funnels.",
  },
  {
    icon: Users,
    title: "Smart Candidate Matching",
    desc: "AI ranks candidates by skill match %, so recruiters find the best fit instantly.",
  },
  {
    icon: Sparkles,
    title: "Mock Interview AI",
    desc: "Role-based practice interviews with AI feedback and scoring to boost confidence.",
  },
];

const roles = [
  {
    icon: GraduationCap,
    title: "Students",
    desc: "Build your profile, track applications, ace interviews.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "Colleges",
    desc: "Monitor students, manage drives, view analytics.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Briefcase,
    title: "Recruiters",
    desc: "Post jobs, match candidates, track hiring pipeline.",
    color: "bg-success/10 text-success",
  },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">L</span>
          </div>
          <span className="font-bold text-lg text-foreground">Leoaxis</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/get-started">
            <Button size="sm" className="gradient-primary text-primary-foreground border-0">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative pt-16 overflow-hidden">
      <div className="gradient-hero min-h-[85vh] flex items-center relative">
        <img
          src={heroBg}
          alt="Campus hiring network"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-lighten"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold text-primary-foreground/80">AI-Powered Campus Hiring</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-primary-foreground mb-6">
              Smart Placements,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(185,84%,45%)] to-[hsl(38,92%,55%)]">
                Brilliant Careers
              </span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 leading-relaxed max-w-lg">
              End-to-end AI platform connecting students, colleges, and recruiters for smarter campus hiring and placement readiness.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/get-started">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 gap-2">
                  Get Started as Student <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Roles */}
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold text-foreground mb-3">Built for Every Stakeholder</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Three powerful dashboards tailored for each role in the placement ecosystem.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="bg-card rounded-xl p-8 shadow-card border border-border hover:shadow-elevated transition-shadow"
          >
            <div className={`h-12 w-12 rounded-xl ${r.color} flex items-center justify-center mb-5`}>
              <r.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">{r.title}</h3>
            <p className="text-muted-foreground text-sm">{r.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="py-20 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground mb-3">AI-Powered Features</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Intelligent tools that transform the hiring process from end to end.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="gradient-hero rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Campus Hiring?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
            Join colleges and recruiters already using Leoaxis for smarter placements.
          </p>
          <Link to="/get-started">
            <Button size="lg" className="gradient-accent text-accent-foreground border-0 gap-2 font-semibold">
              Get Started Today <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">L</span>
          </div>
          <span className="text-sm font-semibold text-foreground">Leoaxis Technologies</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Leoaxis Technologies. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default Landing;
