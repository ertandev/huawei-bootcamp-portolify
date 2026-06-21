"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
}

export default function Home() {
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

  // Helper to render platform icons
  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <GithubIcon className="h-5 w-5" />;
    if (p.includes("linkedin")) return <LinkedinIcon className="h-5 w-5" />;
    if (p.includes("twitter")) return <TwitterIcon className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <p className="text-slate-400 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // 2. Profile Details View
  if (username && profile) {
    const sortedProjects = [...profile.projects].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 py-12 px-4 md:px-8 font-sans overflow-x-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/10 blur-[150px] pointer-events-none" />

        {/* Dashboard Link for owner */}
        <div className="max-w-4xl mx-auto flex justify-end mb-6">
          <Link href="/login">
            <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300">
              Profili Yönet (Giriş)
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Decorative Card Header line */}
            <div className="h-2 w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600" />
            <CardContent className="p-6 md:p-10 space-y-6">
              {/* Profile Main info */}
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
                <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-slate-800 shadow-xl ring-2 ring-violet-500/20">
                  <AvatarImage src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} />
                  <AvatarFallback className="bg-slate-800 text-3xl font-bold text-slate-300">
                    {profile.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                      {profile.fullName}
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-violet-400">
                      {profile.title}
                    </p>
                  </div>

                  <p className="text-slate-300 leading-relaxed max-w-2xl text-sm md:text-base">
                    {profile.bio}
                  </p>

                  {/* Followers & Metrics */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
                      <Heart className="h-4 w-4 text-fuchsia-500 fill-fuchsia-500" />
                      <span className="font-bold text-white">{followerCount}</span> Takipçi
                    </div>
                    {profile.blogUrl && (
                      <a
                        href={profile.blogUrl}
                        target="_blank"
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Globe className="h-4 w-4" /> Web sitesi
                      </a>
                    )}
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {profile.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 border-t border-slate-800/80 pt-6">
                <Button
                  onClick={handleFollowToggle}
                  className={`px-6 py-5 rounded-xl font-medium shadow-md transition-all duration-300 ${
                    isFollowing
                      ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750"
                      : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white hover:shadow-violet-500/10"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" /> Takip Ediliyor
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Takip Et
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="border-slate-800 bg-slate-950/40 hover:bg-slate-800 text-slate-300 px-6 py-5 rounded-xl gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" /> Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" /> Paylaş
                    </>
                  )}
                </Button>

                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank">
                    <Button variant="ghost" className="text-slate-400 hover:text-white rounded-xl py-5 gap-1">
                      Özgeçmişi İncele <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}

                {/* Social Links Icons */}
                <div className="ml-auto flex items-center gap-2">
                  {profile.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 hover:border-violet-500/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200"
                      title={link.platformName}
                    >
                      {getSocialIcon(link.platformName)}
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Portfolio Tabs */}
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-850 p-1.5 rounded-xl">
              <TabsTrigger value="projects" className="py-2.5 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Projeler ({profile.projects.length})
              </TabsTrigger>
              <TabsTrigger value="skills" className="py-2.5 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Yetenekler & Tavsiyeler ({profile.skills.length})
              </TabsTrigger>
            </TabsList>

            {/* Projects tab */}
            <TabsContent value="projects" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedProjects.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    Henüz proje yüklenmemiş.
                  </div>
                ) : (
                  sortedProjects.map((project) => (
                    <Card
                      key={project.id}
                      className={`relative border-slate-800 bg-slate-900/30 backdrop-blur-md hover:border-slate-700 transition-all duration-300 overflow-hidden ${
                        project.isFeatured ? "ring-2 ring-violet-600/40" : ""
                      }`}
                    >
                      {project.isFeatured && (
                        <span className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none text-[10px] text-white">
                            Öne Çıkan
                          </Badge>
                        </span>
                      )}
                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-bold text-white pr-20">{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 space-y-4">
                        <p className="text-sm text-slate-400 leading-relaxed min-h-[60px]">
                          {project.description}
                        </p>
                        <div className="flex gap-2.5 pt-2">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:text-white text-xs gap-1.5 py-2.5"
                              >
                                <GithubIcon className="h-4 w-4" /> GitHub
                              </Button>
                            </a>
                          )}
                          {project.projectUrl && (
                            <a href={project.projectUrl} target="_blank" className="flex-1">
                              <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5 py-2.5">
                                <ExternalLink className="h-4 w-4" /> Demoyu Gör
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Skills tab */}
            <TabsContent value="skills" className="pt-6 space-y-6">
              {profile.skills.length === 0 ? (
                <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  Henüz yetenek eklenmemiş.
                </div>
              ) : (
                <div className="space-y-6">
                  {profile.skills.map((skill) => (
                    <Card key={skill.id} className="border-slate-850 bg-slate-900/20 backdrop-blur-md p-6">
                      <div className="space-y-4">
                        {/* Skill info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-violet-400" />
                            <span className="text-lg font-bold text-white">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-400">{skill.proficiencyLevel}%</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEndorseDialog(skill.id, skill.name)}
                              className="border-slate-850 hover:border-violet-600/30 bg-slate-950/50 text-slate-400 hover:text-white text-xs gap-1.5"
                            >
                              <Heart className="h-3 w-3 text-red-500" /> Referans Ol ({skill.endorsements.length})
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                            style={{ width: `${skill.proficiencyLevel}%` }}
                          />
                        </div>

                        {/* Endorsements List */}
                        {skill.endorsements.length > 0 && (
                          <div className="pt-2 space-y-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                              Meslektaş Referansları
                            </span>
                            <div className="flex flex-col gap-2.5">
                              {skill.endorsements.map((end) => (
                                <div
                                  key={end.id}
                                  className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-violet-300">
                                      {end.endorsedByName}
                                    </span>
                                  </div>
                                  <p className="text-xs md:text-sm text-slate-400 italic">
                                    &ldquo;{end.comment}&rdquo;
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Skill Endorsement Dialog */}
        <Dialog open={endorseModalOpen} onOpenChange={setEndorseModalOpen}>
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Yetenek Referansı Ekle</DialogTitle>
              <DialogDescription className="text-slate-400">
                Geliştiricinin &ldquo;<span className="text-violet-400 font-semibold">{selectedSkill?.name}</span>&rdquo; yeteneğine referans olun.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEndorseSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Hangi kimlikle onaylayacaksınız?</label>
                <select
                  value={endorserProfileId}
                  onChange={(e) => setEndorserProfileId(e.target.value)}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 text-slate-100 p-2 focus:border-violet-500 focus:outline-none"
                >
                  {username.toLowerCase() === "vortex" ? (
                    <option value="44444444-4444-4444-4444-444444444444">John Doe (Full Stack Engineer)</option>
                  ) : (
                    <option value="33333333-3333-3333-3333-333333333333">v0rteX Software Engineer (Senior Backend Architect)</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Yorumunuz</label>
                <Textarea
                  value={endorseComment}
                  onChange={(e) => setEndorseComment(e.target.value)}
                  placeholder="Bu alandaki yetkinliğini onaylıyorum, çünkü..."
                  required
                  rows={4}
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-violet-500"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEndorseModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={submittingEndorsement}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                >
                  {submittingEndorsement ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gönderiliyor...
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-violet-900/10 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-fuchsia-900/10 blur-[160px] pointer-events-none" />

      {/* Navbar */}
      <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500" />
          <span className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Portfolify
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              Giriş Yap
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/10 transition-all duration-300">
              Kayıt Ol
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 space-y-24">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge className="bg-violet-950 border border-violet-800 text-violet-300 px-3 py-1 rounded-full text-xs font-semibold">
            ✨ Dijital Kartvizit Platformu
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Yazılımcılar İçin <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Akıllı Portfolyo Kartları
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Kendinize özel kullanıcı adınızla çalışan, projelerinizi sergileyebileceğiniz ve diğer yazılımcılardan doğrulanmış yetenek referansları toplayabileceğiniz SaaS dijital iş kartı.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium text-lg px-8 py-7 rounded-2xl shadow-xl hover:shadow-violet-500/20 transition-all duration-300">
                Profilini Hemen Oluştur
              </Button>
            </Link>
            <Link href="/?user=vortex">
              <Button variant="outline" className="border-slate-800 bg-slate-900/30 hover:bg-slate-800 text-slate-300 text-lg px-8 py-7 rounded-2xl gap-2">
                Örnek Kartı İncele <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          <Card className="border-slate-850 bg-slate-900/20 backdrop-blur-md hover:border-slate-800 transition-colors">
            <CardHeader className="space-y-3">
              <Globe className="h-10 w-10 text-violet-500" />
              <CardTitle className="text-xl font-bold text-white">Özel Profil Adresi</CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Her geliştirici kendi belirlediği kullanıcı adıyla (örneğin <span className="text-violet-400">http://localhost:3000/?user=adiniz</span>) yayın yapar.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-850 bg-slate-900/20 backdrop-blur-md hover:border-slate-800 transition-colors">
            <CardHeader className="space-y-3">
              <BookOpen className="h-10 w-10 text-fuchsia-500" />
              <CardTitle className="text-xl font-bold text-white">Akıllı Proje Sergileme</CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Öne çıkarmak istediğiniz Github bağlantılı projelerinizi özelleştirilmiş tasarım şablonuyla harika şekilde listeleyin.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-850 bg-slate-900/20 backdrop-blur-md hover:border-slate-800 transition-colors">
            <CardHeader className="space-y-3">
              <HeartHandshake className="h-10 w-10 text-indigo-500" />
              <CardTitle className="text-xl font-bold text-white">Yetenek Referanslama</CardTitle>
              <CardDescription className="text-slate-400 leading-relaxed">
                Diğer yetkili geliştiricilerin yeteneklerinizin altına bırakacağı dijital onay yorumlarıyla profesyonel imajınızı güçlendirin.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Portfolify SaaS. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}

// Dummy Icon for HeartHandshake (fallback helper)
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
