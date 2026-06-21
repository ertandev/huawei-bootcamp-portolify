"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Mail,
  Loader2,
  Share2,
  ExternalLink,
  Award,
  Heart,
  Sparkles,
  BookOpen,
  Check,
  UserCheck,
  UserPlus,
  ArrowRight,
} from "lucide-react";

interface Endorsement {
  id: string;
  endorsedById: string;
  endorsedByName: string;
  comment: string;
}

interface Skill {
  id: string;
  name: string;
  proficiencyLevel: number;
  endorsements: Endorsement[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  githubUrl: string | null;
  projectUrl: string | null;
  isFeatured: boolean;
}

interface SocialLink {
  id: string;
  platformName: string;
  url: string;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  location: string | null;
  displayOrder: number;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  displayOrder: number;
}

interface ProfileDetails {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  email: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
  blogUrl: string | null;
  projects: Project[];
  socialLinks: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
}

export default function Home() {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Endorsement Modal State
  const [selectedSkill, setSelectedSkill] = useState<{ id: string; name: string } | null>(null);
  const [endorseModalOpen, setEndorseModalOpen] = useState(false);
  const [endorserProfileId, setEndorserProfileId] = useState("");
  const [endorseComment, setEndorseComment] = useState("");
  const [submittingEndorsement, setSubmittingEndorsement] = useState(false);

  // Share State
  const [copied, setCopied] = useState(false);

  // Resolve username context on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get("user");
      setUsername(userParam);
    }
  }, []);

  // Fetch developer profile if username resolved
  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<ProfileDetails>(`/DeveloperProfile/details?username=${username}`);
        setProfile(response.data);
        
        // Setup initial dummy follower values
        const isVortex = username.toLowerCase() === "vortex";
        setFollowerCount(isVortex ? 154 : 42);
      } catch (err: any) {
        console.error(err);
        setError("Profil yüklenirken bir hata oluştu veya kullanıcı bulunamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profile || !username) return;
    
    // Toggle locally first
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowerCount((prev) => (nextState ? prev + 1 : prev - 1));

    try {
      const followerId = username.toLowerCase() === "vortex" 
        ? "44444444-4444-4444-4444-444444444444" // John Doe
        : "33333333-3333-3333-3333-333333333333"; // v0rteX

      const endpoint = nextState ? "/Follow" : "/Follow/unfollow";
      await api.post(endpoint, {
        followerId,
        followedId: profile.id,
      });
    } catch (err) {
      console.error("Takip etme isteği başarısız oldu:", err);
    }
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEndorseDialog = (skillId: string, skillName: string) => {
    if (!username) return;
    setSelectedSkill({ id: skillId, name: skillName });
    // Pick first opposite profile as default endorser
    const defaultEndorser = username.toLowerCase() === "vortex" 
      ? "44444444-4444-4444-4444-444444444444" 
      : "33333333-3333-3333-3333-333333333333";
    setEndorserProfileId(defaultEndorser);
    setEndorseComment("");
    setEndorseModalOpen(true);
  };

  const handleEndorseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedSkill || !username) return;

    setSubmittingEndorsement(true);
    try {
      await api.post("/Skill/endorse", {
        skillId: selectedSkill.id,
        endorsedById: endorserProfileId,
        comment: endorseComment,
      });

      // Reload profile details to show new endorsements
      const response = await api.get<ProfileDetails>(`/DeveloperProfile/details?username=${username}`);
      setProfile(response.data);
      setEndorseModalOpen(false);
    } catch (err) {
      console.error("Referans eklenemedi:", err);
    } finally {
      setSubmittingEndorsement(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <GithubIcon className="h-4 w-4" />;
    if (p.includes("linkedin")) return <LinkedinIcon className="h-4 w-4" />;
    if (p.includes("twitter")) return <TwitterIcon className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const [activeTab, setActiveTab] = useState("projects");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="text-muted-foreground tracking-wide text-xs uppercase font-medium">Portfolify Yükleniyor</p>
        </div>
      </div>
    );
  }

  // 2. Profile Details View
  if (username && profile) {
    const sortedProjects = [...profile.projects].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return (
      <div className="relative min-h-screen bg-transparent text-foreground py-12 px-4 md:px-8 font-sans overflow-x-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:100px_100px] opacity-10 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Dashboard Link for owner */}
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 relative z-10">
          <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Portfolify
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs border-border">
              Profili Yönet (Giriş)
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <Card className="bg-card/70 border-border rounded-xl shadow-lg backdrop-blur-md overflow-hidden">
            <div className="p-8 md:p-12 space-y-8">
              {/* Profile Main info */}
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                <Avatar className="h-28 w-28 md:h-32 md:w-32 border border-border shadow-2xl ring-4 ring-muted/10">
                  <AvatarImage src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="object-cover" />
                  <AvatarFallback className="bg-muted text-3xl font-light text-muted-foreground">
                    {profile.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                      {profile.fullName}
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-muted-foreground">
                      {profile.title}
                    </p>
                  </div>

                  <p className="text-foreground/90 leading-relaxed max-w-2xl text-[14px] font-normal">
                    {profile.bio}
                  </p>

                  {/* Skills Tech Stack Badges */}
                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                      {profile.skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="secondary"
                          className="px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border border-border bg-muted/40 text-foreground"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Followers & Metrics */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 text-[13px] text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-3.5 py-1.5 rounded-full border border-border">
                      <Heart className="h-3.5 w-3.5 text-foreground/70 fill-foreground/10" />
                      <span className="font-semibold text-foreground">{followerCount}</span> <span className="text-muted-foreground ml-0.5">Takipçi</span>
                    </div>
                    {profile.blogUrl && (
                      <a
                        href={profile.blogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-muted/30 hover:bg-muted/60 hover:text-foreground px-3.5 py-1.5 rounded-full border border-border transition-colors text-muted-foreground"
                      >
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Web sitesi
                      </a>
                    )}
                    <div className="flex items-center gap-1.5 bg-muted/30 px-3.5 py-1.5 rounded-full border border-border">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {profile.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 border-t border-border pt-8">
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  className="px-6 py-2.5 text-xs select-none cursor-pointer rounded-lg font-semibold"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Takip Ediliyor
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Takip Et
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="px-6 py-2.5 text-xs select-none cursor-pointer rounded-lg border-border"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 mr-1.5" /> Paylaş
                    </>
                  )}
                </Button>

                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="px-6 py-2.5 text-xs select-none cursor-pointer rounded-lg border-border">
                      Özgeçmiş <ExternalLink className="h-3.5 w-3.5 ml-1.5 text-muted-foreground" />
                    </Button>
                  </a>
                )}

                {/* Social Links Icons */}
                <div className="md:ml-auto flex items-center gap-2 mt-4 md:mt-0">
                  {profile.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-muted/40 rounded-full border border-border hover:border-muted-foreground/30 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-300"
                      title={link.platformName}
                    >
                      {getSocialIcon(link.platformName)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Main Portfolio Tabs */}
          <div className="w-full space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="flex bg-muted/60 p-1 rounded-lg max-w-lg mx-auto border border-border backdrop-blur-md">
                <TabsTrigger
                  value="projects"
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer"
                >
                  Projeler ({profile.projects.length})
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer"
                >
                  Yetenekler ({profile.skills.length})
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer"
                >
                  Deneyim & Eğitim ({profile.experiences.length + profile.educations.length})
                </TabsTrigger>
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects" className="outline-none focus:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedProjects.length === 0 ? (
                    <div className="col-span-2 py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                      Henüz proje yüklenmemiş.
                    </div>
                  ) : (
                    sortedProjects.map((project) => (
                      <Card
                        key={project.id}
                        className={`relative border border-border bg-card/40 backdrop-blur-xs hover:border-muted-foreground/30 transition-all duration-300 rounded-xl p-6 space-y-6 flex flex-col justify-between ${
                          project.isFeatured ? "ring-1 ring-ring/40" : ""
                        }`}
                      >
                        {project.isFeatured && (
                          <span className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-primary/10 border border-primary/20 text-[9px] font-bold text-foreground tracking-wider uppercase">
                              Öne Çıkan
                            </Badge>
                          </span>
                        )}
                        <div className="space-y-2">
                          <h2 className="text-lg font-semibold text-foreground pr-20">{project.title}</h2>
                          <p className="text-[13px] text-muted-foreground leading-relaxed min-h-[60px] font-normal">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex gap-2.5 pt-2">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full py-2 text-xs select-none cursor-pointer border-border"
                              >
                                <GithubIcon className="h-3.5 w-3.5 mr-1.5" /> GitHub
                              </Button>
                            </a>
                          )}
                          {project.projectUrl && (
                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button className="w-full py-2 text-xs select-none cursor-pointer">
                                Demoyu Gör <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="outline-none focus:outline-none">
                <div className="space-y-6">
                  {profile.skills.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                      Henüz yetenek eklenmemiş.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {profile.skills.map((skill) => (
                        <Card key={skill.id} className="border border-border bg-card/40 backdrop-blur-xs p-6 rounded-xl space-y-4">
                          {/* Skill info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="h-4.5 w-4.5 text-muted-foreground" />
                              <span className="text-base font-semibold text-foreground">{skill.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs font-semibold text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded">
                                {skill.proficiencyLevel}%
                              </Badge>
                              <Button
                                onClick={() => openEndorseDialog(skill.id, skill.name)}
                                variant="outline"
                                size="sm"
                                className="px-3 py-1.5 text-xs select-none cursor-pointer border-border"
                              >
                                <Heart className="h-3 w-3 text-muted-foreground mr-1.5" /> Referans Ol ({skill.endorsements.length})
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${skill.proficiencyLevel}%` }}
                            />
                          </div>

                          {/* Endorsements List */}
                          {skill.endorsements.length > 0 && (
                            <div className="pt-2 space-y-3">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                                Referans Yorumları
                              </span>
                              <div className="flex flex-col gap-2.5">
                                {skill.endorsements.map((end) => (
                                  <div
                                    key={end.id}
                                    className="bg-muted/20 border border-border p-4 rounded-lg space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-foreground">
                                        {end.endorsedByName}
                                      </span>
                                    </div>
                                    <p className="text-[13px] text-muted-foreground font-light italic">
                                      &ldquo;{end.comment}&rdquo;
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="outline-none focus:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Experiences Timeline */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground tracking-tight pl-2 border-l-2 border-primary">İş Deneyimi</h3>
                    {profile.experiences.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                        Henüz iş deneyimi eklenmemiş.
                      </div>
                    ) : (
                      <div className="relative border-l border-border ml-3 pl-6 space-y-8 py-2">
                        {profile.experiences.map((exp) => (
                          <div key={exp.id} className="relative space-y-1.5">
                            {/* Timeline dot */}
                            <div className="absolute left-[-29px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase font-semibold">
                              {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "Devam Ediyor"}
                            </span>
                            <h4 className="text-sm font-semibold text-foreground leading-none">
                              {exp.title}
                            </h4>
                            <div className="text-xs text-muted-foreground font-medium">
                              {exp.company} {exp.location ? `• ${exp.location}` : ""}
                            </div>
                            {exp.description && (
                              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1 whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Educations Timeline */}
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground tracking-tight pl-2 border-l-2 border-primary">Eğitim Geçmişi</h3>
                    {profile.educations.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                        Henüz eğitim bilgisi eklenmemiş.
                      </div>
                    ) : (
                      <div className="relative border-l border-border ml-3 pl-6 space-y-8 py-2">
                        {profile.educations.map((edu) => (
                          <div key={edu.id} className="relative space-y-1.5">
                            {/* Timeline dot */}
                            <div className="absolute left-[-29px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase font-semibold">
                              {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : "Devam Ediyor"}
                            </span>
                            <h4 className="text-sm font-semibold text-foreground leading-none">
                              {edu.degree}
                            </h4>
                            <div className="text-xs text-muted-foreground font-medium">
                              {edu.school} • {edu.fieldOfStudy}
                            </div>
                            {edu.description && (
                              <p className="text-xs text-muted-foreground font-light leading-relaxed pt-1 whitespace-pre-line">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Skill Endorsement Dialog */}
        <Dialog open={endorseModalOpen} onOpenChange={setEndorseModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="space-y-1">
              <DialogTitle>Yetenek Referansı Ekle</DialogTitle>
              <DialogDescription>
                Geliştiricinin &ldquo;<span className="text-foreground font-medium">{selectedSkill?.name}</span>&rdquo; yeteneğine referans olun.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEndorseSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Hangi kimlikle onaylayacaksınız?</label>
                <select
                  value={endorserProfileId}
                  onChange={(e) => setEndorserProfileId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background text-foreground p-3 focus:border-ring focus:outline-none text-xs transition-all"
                >
                  {username.toLowerCase() === "vortex" ? (
                    <option value="44444444-4444-4444-4444-444444444444" className="bg-popover text-popover-foreground">John Doe (Full Stack Engineer)</option>
                  ) : (
                    <option value="33333333-3333-3333-3333-333333333333" className="bg-popover text-popover-foreground">v0rteX Software Engineer (Senior Backend Architect)</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Yorumunuz</label>
                <Textarea
                  value={endorseComment}
                  onChange={(e) => setEndorseComment(e.target.value)}
                  placeholder="Bu alandaki yetkinliğini onaylıyorum, çünkü..."
                  required
                  rows={4}
                  className="bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus:border-ring transition-all text-xs p-3.5"
                />
              </div>

              <DialogFooter className="pt-2 gap-2 flex flex-row justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEndorseModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-full text-xs"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={submittingEndorsement}
                  className="px-5 py-2 text-xs select-none cursor-pointer"
                >
                  {submittingEndorsement ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Gönderiliyor
                    </>
                  ) : (
                    "Referans Ol"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // 3. SaaS Landing Page
  return (
    <div className="relative min-h-screen bg-transparent text-foreground font-sans overflow-x-hidden">

      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:120px_120px] opacity-[0.04] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-foreground" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Portfolify
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full px-4 py-2 text-xs font-semibold transition-colors select-none cursor-pointer">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-5 py-2 text-xs select-none cursor-pointer rounded-full font-semibold">
                Kayıt Ol
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32 space-y-32">
        <section className="text-center space-y-8 max-w-4xl mx-auto flex flex-col items-center">
          <Badge variant="secondary" className="bg-muted/80 border border-border text-muted-foreground px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase">
            ✨ Dijital Kartvizit Platformu
          </Badge>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-foreground leading-[1.05] max-w-3xl mx-auto">
            Yazılımcılar için <br />
            Akıllı Portfolyo Kartları.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            Kendinize özel kullanıcı adınızla çalışan, projelerinizi sergileyebileceğiniz ve diğer yazılımcılardan doğrulanmış yetenek referansları toplayabileceğiniz SaaS dijital iş kartı.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link href="/register">
              <Button className="px-8 py-6 text-sm select-none cursor-pointer font-semibold shadow-lg rounded-full">
                Profilini Hemen Oluştur <ArrowRight className="h-4 w-4 ml-1.5 inline-block" />
              </Button>
            </Link>
            <Link href="/?user=vortex">
              <Button variant="outline" className="px-8 py-6 text-sm select-none cursor-pointer font-semibold border border-border rounded-full">
                Örnek Kartı İncele
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Sections in a premium visual row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <Card className="border border-border bg-card/45 backdrop-blur-sm p-8 rounded-xl space-y-5 hover:border-muted-foreground/30 transition-all duration-300">
            <div className="h-10 w-10 bg-muted border border-border rounded-full flex items-center justify-center">
              <Globe className="h-5 w-5 text-foreground/80" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">Özel Profil Adresi</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed text-[13px] font-normal">
              Kendi belirlediğiniz kullanıcı adıyla (<span className="text-foreground font-mono">/?user=adiniz</span>) benzersiz ve profesyonel portfolyonuzu anında paylaşın.
            </CardDescription>
          </Card>

          <Card className="border border-border bg-card/45 backdrop-blur-sm p-8 rounded-xl space-y-5 hover:border-muted-foreground/30 transition-all duration-300">
            <div className="h-10 w-10 bg-muted border border-border rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-foreground/80" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">Akıllı Proje Sergileme</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed text-[13px] font-normal">
              Öne çıkarmak istediğiniz projelerinizi bağlantıları ve detaylarıyla birlikte en güncel minimalizmde listeleyin.
            </CardDescription>
          </Card>

          <Card className="border border-border bg-card/45 backdrop-blur-sm p-8 rounded-xl space-y-5 hover:border-muted-foreground/30 transition-all duration-300">
            <div className="h-10 w-10 bg-muted border border-border rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-foreground/80" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">Yetenek Referanslama</CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed text-[13px] font-normal">
              Diğer geliştiricilerden doğrulanmış yetenek referansları alarak dijital dünyada güvenilirliğinizi ve imajınızı kanıtlayın.
            </CardDescription>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-16 text-center text-muted-foreground text-xs tracking-wider uppercase font-medium">
        <p>© 2026 Portfolify SaaS. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}

function HeartHandshake(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.85.85 2.23.85 3.08 0L15 8" />
      <path d="m8 11-1.96-1.96a2.17 2.17 0 0 0-3.08 0v0c-.85.85-.85 2.23 0 3.08L7 16" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
