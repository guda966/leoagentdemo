import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, GraduationCap, Code, Award, FolderOpen,
  Briefcase, FileText, CheckCircle, Circle, Plus, X, Save, Upload, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import ScoreRing from "@/components/ScoreRing";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [newSkill, setNewSkill] = useState("");
  const [uploading, setUploading] = useState(false);

  // Local editable state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    place: "",
    bio: "",
    college_name: "",
    department: "",
    graduation_year: "",
    skills: [] as string[],
    certifications: [] as string[],
    linkedin_url: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        place: profile.place || "",
        bio: profile.bio || "",
        college_name: profile.college_name || "",
        department: profile.department || "",
        graduation_year: profile.graduation_year?.toString() || "",
        skills: profile.skills || [],
        certifications: profile.certifications || [],
        linkedin_url: profile.linkedin_url || "",
      });
    }
  }, [profile]);

  const completedSections = [
    !!(form.full_name && form.email),
    !!(form.college_name && form.department),
    form.skills.length > 0,
    form.certifications.length > 0,
    (profile?.projects as any[])?.length > 0,
    (profile?.experience as any[])?.length > 0,
    !!profile?.resume_url,
  ];
  const completionPercent = Math.round((completedSections.filter(Boolean).length / completedSections.length) * 100);
  const readinessScore = Math.min(completionPercent + Math.floor(form.skills.length * 1.5), 100);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          phone: form.phone,
          place: form.place,
          bio: form.bio,
          college_name: form.college_name,
          department: form.department,
          graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
          skills: form.skills,
          certifications: form.certifications,
          linkedin_url: form.linkedin_url,
          profile_completion: completionPercent,
          placement_readiness_score: readinessScore,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Profile saved!", description: "Your changes have been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const filePath = `${user.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({ resume_url: urlData.publicUrl })
        .eq("user_id", user.id);

      await refreshProfile();
      toast({ title: "Resume uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with readiness score */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {(form.full_name || "?").split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-card-foreground">{form.full_name || "Your Name"}</h2>
              <p className="text-sm text-muted-foreground">{form.department || "Department"} · {form.college_name || "College"}</p>
              {form.bio && <p className="text-sm text-muted-foreground mt-2">{form.bio}</p>}
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

      {/* Section tabs */}
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
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={form.email} disabled className="pl-10 opacity-60" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} className="pl-10" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">LinkedIn URL</label>
              <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
          </div>
        )}

        {activeSection === "education" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Education</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">College / University</label>
                <Input value={form.college_name} onChange={(e) => setForm({ ...form, college_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Department</label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1 block">Graduation Year</label>
                <Input value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} placeholder="2026" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
          </div>
        )}

        {activeSection === "skills" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3 gap-1.5">
                  {skill}
                  <button onClick={() => removeSkill(skill)}><X className="h-3 w-3" /></button>
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
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
          </div>
        )}

        {activeSection === "certifications" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Certifications</h3>
            {form.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                <Award className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm font-medium text-card-foreground flex-1">{cert}</span>
                <button onClick={() => setForm({ ...form, certifications: form.certifications.filter((_, j) => j !== i) })}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add certification..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    setForm({ ...form, certifications: [...form.certifications, (e.target as HTMLInputElement).value.trim()] });
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
                className="max-w-sm"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Changes
            </Button>
          </div>
        )}

        {activeSection === "projects" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Projects</h3>
            {((profile?.projects as any[]) || []).map((project: any, i: number) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-card-foreground">{project.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Project management coming soon</p>
          </div>
        )}

        {activeSection === "experience" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Experience</h3>
            {((profile?.experience as any[]) || []).map((exp: any, i: number) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-card-foreground">{exp.role}</h4>
                <p className="text-sm text-muted-foreground">{exp.company} · {exp.duration}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Experience management coming soon</p>
          </div>
        )}

        {activeSection === "resume" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Resume Upload</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-card-foreground">Drag & drop your resume or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOC, DOCX (Max 5MB)</p>
              <label>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                <Button variant="outline" size="sm" className="mt-4" asChild disabled={uploading}>
                  <span>
                    {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                    {uploading ? "Uploading..." : "Upload Resume"}
                  </span>
                </Button>
              </label>
            </div>
            {profile?.resume_url && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Resume uploaded</p>
                  <p className="text-xs text-muted-foreground">Your resume is on file</p>
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
