import { useState } from "react";
import {
  User, Mail, Phone, MapPin, GraduationCap, Code, Award, FolderOpen,
  Briefcase, FileText, CheckCircle, Circle, Plus, X, Save, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import ScoreRing from "@/components/ScoreRing";

const initialProfile = {
  name: "Arjun Sharma",
  email: "arjun.sharma@college.edu",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  college: "Indian Institute of Technology",
  department: "Computer Science",
  year: "4th Year",
  cgpa: "8.7",
  bio: "Passionate full-stack developer with interest in AI/ML and cloud computing.",
  skills: ["React", "TypeScript", "Python", "Node.js", "SQL", "Machine Learning", "Docker", "AWS"],
  certifications: [
    { name: "AWS Cloud Practitioner", issuer: "Amazon", year: "2025" },
  ],
  projects: [
    { name: "E-Commerce Platform", description: "Full-stack e-commerce app with React & Node.js", tech: ["React", "Node.js", "MongoDB"] },
    { name: "ML Stock Predictor", description: "Stock price prediction using LSTM neural networks", tech: ["Python", "TensorFlow", "Flask"] },
  ],
  experience: [
    { role: "Frontend Intern", company: "TechStartup", duration: "Jun 2025 – Aug 2025", description: "Built responsive UI components using React and TypeScript" },
  ],
  resumeUploaded: true,
};

const profileSections = [
  { key: "personal", label: "Personal Details", icon: User },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Code },
  { key: "certifications", label: "Certifications", icon: Award },
  { key: "projects", label: "Projects", icon: FolderOpen },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "resume", label: "Resume Upload", icon: FileText },
];

const StudentProfile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [newSkill, setNewSkill] = useState("");
  const [activeSection, setActiveSection] = useState("personal");

  const completedSections = [
    profile.name && profile.email && profile.phone,
    profile.college && profile.department,
    profile.skills.length > 0,
    profile.certifications.length > 0,
    profile.projects.length > 0,
    profile.experience.length > 0,
    profile.resumeUploaded,
  ];
  const completionPercent = Math.round((completedSections.filter(Boolean).length / completedSections.length) * 100);
  const readinessScore = Math.min(completionPercent + Math.floor(profile.skills.length * 1.5), 100);

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  return (
    <div className="space-y-6">
      {/* Header with readiness score */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {profile.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-card-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.department} · {profile.college}</p>
              <p className="text-sm text-muted-foreground mt-1">{profile.year} · CGPA: {profile.cgpa}</p>
              <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Placement Readiness</h3>
          <ScoreRing score={readinessScore} size={110} />
          <div className="mt-3 w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Profile</span>
              <span className="font-medium text-card-foreground">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>
        </div>
      </div>

      {/* Profile completion checklist */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Profile Completion</h3>
        <div className="flex flex-wrap gap-3">
          {profileSections.map((section, i) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.key
                  ? "bg-primary text-primary-foreground"
                  : completedSections[i]
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {completedSections[i] ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active section editor */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        {activeSection === "personal" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Personal Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="pl-10" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">Bio</label>
              <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
            </div>
            <Button className="gradient-primary text-primary-foreground border-0">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        )}

        {activeSection === "education" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Education</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">College / University</label>
                <Input value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Department</label>
                <Input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Year</label>
                <Input value={profile.year} onChange={(e) => setProfile({ ...profile, year: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">CGPA</label>
                <Input value={profile.cgpa} onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })} />
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground border-0">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        )}

        {activeSection === "skills" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3 gap-1.5">
                  {skill}
                  <button onClick={() => removeSkill(skill)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="max-w-xs"
              />
              <Button onClick={addSkill} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">SUGGESTED SKILLS</h4>
              <div className="flex flex-wrap gap-2">
                {["Kubernetes", "GraphQL", "Redis", "CI/CD", "Agile"].filter(s => !profile.skills.includes(s)).map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-xs border-dashed cursor-pointer hover:bg-primary/10"
                    onClick={() => setProfile({ ...profile, skills: [...profile.skills, s] })}
                  >
                    <Plus className="h-3 w-3 mr-1" /> {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "certifications" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Certifications</h3>
            {profile.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                <Award className="h-5 w-5 text-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Certification
            </Button>
          </div>
        )}

        {activeSection === "projects" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Projects</h3>
            {profile.projects.map((project, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-card-foreground">{project.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {project.tech.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Project
            </Button>
          </div>
        )}

        {activeSection === "experience" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Experience</h3>
            {profile.experience.map((exp, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-card-foreground">{exp.role}</h4>
                <p className="text-sm text-muted-foreground">{exp.company} · {exp.duration}</p>
                <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
              </div>
            ))}
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Experience
            </Button>
          </div>
        )}

        {activeSection === "resume" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Resume Upload</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-card-foreground">Drag & drop your resume or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOC, DOCX (Max 5MB)</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Upload className="h-4 w-4 mr-1" /> Upload Resume
              </Button>
            </div>
            {profile.resumeUploaded && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">resume_arjun_sharma_v2.pdf</p>
                  <p className="text-xs text-muted-foreground">Uploaded on Feb 28, 2026</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
