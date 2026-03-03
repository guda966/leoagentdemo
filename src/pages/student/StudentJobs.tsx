import { useState } from "react";
import {
  Search, MapPin, Briefcase, IndianRupee, Filter, SlidersHorizontal,
  Bookmark, BookmarkCheck, ExternalLink, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScoreRing from "@/components/ScoreRing";

const allJobs = [
  { id: 1, title: "Frontend Developer", company: "TechCorp", match: 92, location: "Bangalore", salary: "₹8-12 LPA", type: "Full-time", skills: ["React", "TypeScript", "CSS"], posted: "2 days ago", description: "Build modern web interfaces using React and TypeScript for our enterprise SaaS platform." },
  { id: 2, title: "Full Stack Engineer", company: "InnovateLabs", match: 85, location: "Hyderabad", salary: "₹10-15 LPA", type: "Full-time", skills: ["Node.js", "React", "SQL", "Docker"], posted: "3 days ago", description: "End-to-end development of cloud-native applications with microservices architecture." },
  { id: 3, title: "ML Engineer", company: "DataMinds", match: 78, location: "Remote", salary: "₹12-18 LPA", type: "Full-time", skills: ["Python", "Machine Learning", "TensorFlow"], posted: "1 day ago", description: "Develop and deploy ML models for real-time data processing and prediction systems." },
  { id: 4, title: "Backend Developer", company: "CloudScale", match: 71, location: "Pune", salary: "₹7-11 LPA", type: "Full-time", skills: ["Node.js", "Docker", "AWS", "PostgreSQL"], posted: "5 days ago", description: "Design and build scalable backend services and APIs for our cloud infrastructure." },
  { id: 5, title: "SDE Intern", company: "MegaTech", match: 88, location: "Bangalore", salary: "₹40K/month", type: "Internship", skills: ["React", "Python", "SQL"], posted: "1 day ago", description: "6-month internship working on product features across the stack." },
  { id: 6, title: "DevOps Engineer", company: "InfraCloud", match: 62, location: "Mumbai", salary: "₹9-14 LPA", type: "Full-time", skills: ["Docker", "Kubernetes", "AWS", "CI/CD"], posted: "4 days ago", description: "Manage cloud infrastructure and implement CI/CD pipelines for rapid deployment." },
  { id: 7, title: "Data Analyst", company: "InsightPro", match: 55, location: "Delhi", salary: "₹6-9 LPA", type: "Full-time", skills: ["Python", "SQL", "Tableau", "Statistics"], posted: "6 days ago", description: "Analyze business data and create dashboards for executive decision-making." },
  { id: 8, title: "React Native Developer", company: "AppForge", match: 80, location: "Remote", salary: "₹8-13 LPA", type: "Full-time", skills: ["React", "TypeScript", "Mobile Development"], posted: "2 days ago", description: "Build cross-platform mobile apps using React Native for iOS and Android." },
];

const StudentJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const filteredJobs = allJobs
    .filter((job) => {
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLocation = locationFilter === "all" || job.location === locationFilter;
      const matchesType = typeFilter === "all" || job.type === typeFilter;
      return matchesSearch && matchesLocation && matchesType;
    })
    .sort((a, b) => b.match - a.match);

  const toggleSave = (id: number) => {
    setSavedJobs((prev) => prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Search & filters */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px]">
              <MapPin className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Briefcase className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-xs text-muted-foreground">Jobs are AI-ranked by match with your profile skills</p>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground">{filteredJobs.length} jobs found</p>
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow">
            <div className="flex items-start gap-5">
              <ScoreRing score={job.match} size={56} strokeWidth={5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <button onClick={() => toggleSave(job.id)} className="shrink-0">
                    {savedJobs.includes(job.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" /> {job.salary}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {job.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{job.posted}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {job.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                  ))}
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Details
                    </Button>
                    <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentJobs;
