"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Award,
  Globe,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  User,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Endorsement {
  id: string;
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

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  // Edit Profile Form State
  const [fullName, setFullName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Project Form State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectDemo, setProjectDemo] = useState("");
  const [projectIsFeatured, setProjectIsFeatured] = useState(false);
  const [addingProject, setAddingProject] = useState(false);

  // New Skill Form State
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(80);
  const [addingSkill, setAddingSkill] = useState(false);

  // New Social Link Form State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState("GitHub");
  const [socialUrl, setSocialUrl] = useState("");
  const [addingSocial, setAddingSocial] = useState(false);

  // Check auth and load profile on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    setUsername(storedUsername || "");

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Using JWT token authentication details lookup
        const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
        
        const data = response.data;
        setProfile(data);
        
        // Populate profile form states
        setFullName(data.fullName);
        setProfileTitle(data.title);
        setBio(data.bio);
        setEmail(data.email);
        setAvatarUrl(data.avatarUrl || "");
        setResumeUrl(data.resumeUrl || "");
        setBlogUrl(data.blogUrl || "");
      } catch (err: any) {
        console.error(err);
        setError("Profil verileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setUpdatingProfile(true);
    setProfileSuccess(false);
    setError("");

    try {
      await api.put(`/DeveloperProfile/${profile.id}`, {
        id: profile.id,
        fullName,
        title: profileTitle,
        bio,
        email,
        avatarUrl: avatarUrl || null,
        resumeUrl: resumeUrl || null,
        blogUrl: blogUrl || null,
      });

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      
      // Reload profile
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err: any) {
      console.error(err);
      setError("Profil güncellenirken hata oluştu.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Projects CRUD
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setAddingProject(true);
    try {
      await api.post("/Project", {
        developerProfileId: profile.id,
        title: projectTitle,
        description: projectDesc,
        githubUrl: projectGithub || null,
        projectUrl: projectDemo || null,
        displayOrder: profile.projects.length + 1,
        isFeatured: projectIsFeatured,
      });

      // Clear states
      setProjectTitle("");
      setProjectDesc("");
      setProjectGithub("");
      setProjectDemo("");
      setProjectIsFeatured(false);
      setProjectModalOpen(false);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;

    try {
      await api.delete(`/Project/${projectId}`);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Skills CRUD
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setAddingSkill(true);
    try {
      await api.post("/Skill", {
        developerProfileId: profile.id,
        name: skillName,
        proficiencyLevel: skillLevel,
        displayOrder: profile.skills.length + 1,
      });

      setSkillName("");
      setSkillLevel(80);
      setSkillModalOpen(false);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("Bu yeteneği silmek istediğinize emin misiniz?")) return;

    try {
      await api.delete(`/Skill/${skillId}`);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Social Links CRUD
  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setAddingSocial(true);
    try {
      await api.post("/SocialLink", {
        developerProfileId: profile.id,
        platformName: socialPlatform,
        url: socialUrl,
      });

      setSocialUrl("");
      setSocialModalOpen(false);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSocial(false);
    }
  };

  const handleDeleteSocial = async (socialId: string) => {
    if (!confirm("Bu sosyal medya bağlantısını silmek istediğinize emin misiniz?")) return;

    try {
      await api.delete(`/SocialLink/${socialId}`);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <p className="text-slate-400 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 overflow-x-hidden">
      {/* Navbar */}
      <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-violet-500" />
          <span className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Portfolify
          </span>
          <Badge className="bg-violet-950/80 border-violet-850 text-violet-400 font-mono text-[10px] ml-2">
            Kullanıcı Adı: {username}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/?user=${username}`} target="_blank">
            <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 gap-1.5">
              Profilimi Gör <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="ghost" className="text-slate-400 hover:text-red-400 gap-1.5">
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-10 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Yönetim Paneli</h1>
          <p className="text-slate-400 text-sm">Portfolyo kartınızın bilgilerini ve içeriklerini düzenleyin</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-slate-850 p-1.5 rounded-xl">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="projects">Projeler</TabsTrigger>
            <TabsTrigger value="skills">Yetenekler</TabsTrigger>
            <TabsTrigger value="socials">Sosyal Hesaplar</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="pt-6">
            <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-violet-400" /> Kişisel Bilgiler
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Kartınızda görünecek temel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Ad Soyad</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Ünvan</label>
                      <Input
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Hakkımda / Biyografi</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                      rows={4}
                      className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">E-posta</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Profil Fotoğrafı URL</label>
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://gorsel-adresi.com/resim.jpg"
                        className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Özgeçmiş (Resume) URL</label>
                      <Input
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://drive.google.com/cv.pdf"
                        className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Kişisel Web Sitesi URL</label>
                      <Input
                        value={blogUrl}
                        onChange={(e) => setBlogUrl(e.target.value)}
                        placeholder="https://adiniz.dev"
                        className="bg-slate-950 border-slate-850 focus:border-violet-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={updatingProfile}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                    >
                      {updatingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                        </>
                      ) : (
                        "Değişiklikleri Kaydet"
                      )}
                    </Button>
                    {profileSuccess && (
                      <span className="text-emerald-400 text-sm flex items-center gap-1">
                        <Check className="h-4 w-4" /> Başarıyla güncellendi!
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-violet-400" /> Projelerim
              </h2>
              <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
                <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><Plus className="h-4 w-4" /> Yeni Proje</Button>} />
                <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
                  <DialogHeader>
                    <CardTitle className="text-white text-xl">Yeni Proje Ekle</CardTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Proje Adı</label>
                      <Input
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Örn: Portfolify Mobil Uygulaması"
                        required
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Açıklama</label>
                      <Textarea
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Projenin amacını, kullanılan teknolojileri kısaca açıklayın..."
                        required
                        rows={3}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">GitHub URL</label>
                        <Input
                          value={projectGithub}
                          onChange={(e) => setProjectGithub(e.target.value)}
                          placeholder="https://github.com/..."
                          className="bg-slate-950 border-slate-800 text-white text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Demo URL</label>
                        <Input
                          value={projectDemo}
                          onChange={(e) => setProjectDemo(e.target.value)}
                          placeholder="https://demo-adresi.com"
                          className="bg-slate-950 border-slate-800 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={projectIsFeatured}
                        onChange={(e) => setProjectIsFeatured(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 h-4 w-4"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-medium text-slate-300">
                        Bu projeyi öne çıkar (Featured)
                      </label>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setProjectModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        disabled={addingProject}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {addingProject ? "Ekleniyor..." : "Ekle"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.projects.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  Henüz bir proje eklemediniz. Sağ üstten yeni proje ekleyebilirsiniz.
                </div>
              ) : (
                profile?.projects.map((project) => (
                  <Card key={project.id} className="border-slate-850 bg-slate-900/20 backdrop-blur-md">
                    <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-bold text-white">{project.title}</CardTitle>
                          {project.isFeatured && (
                            <Badge className="bg-violet-950 border border-violet-850 text-violet-400 text-[9px] hover:bg-violet-900">
                              Öne Çıkan
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-slate-500 hover:text-red-400 h-8 w-8 rounded-lg"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3">
                      <p className="text-xs md:text-sm text-slate-400 line-clamp-3 leading-relaxed min-h-[50px]">
                        {project.description}
                      </p>
                      <div className="flex gap-2 text-xs pt-1.5 text-slate-400">
                        {project.githubUrl && <span className="underline truncate">GitHub</span>}
                        {project.projectUrl && <span className="underline truncate">Demo</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-400" /> Yeteneklerim
              </h2>
              <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
                <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><Plus className="h-4 w-4" /> Yeni Yetenek</Button>} />
                <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
                  <DialogHeader>
                    <CardTitle className="text-white text-xl">Yeni Yetenek Ekle</CardTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSkill} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Yetenek Adı</label>
                      <Input
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        placeholder="Örn: C# / ASP.NET Core"
                        required
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex justify-between">
                        <span>Yetkinlik Seviyesi</span>
                        <span className="text-violet-400 font-bold">{skillLevel}%</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(Number(e.target.value))}
                        className="w-full accent-violet-600 bg-slate-950 h-2 rounded-lg cursor-pointer"
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSkillModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        disabled={addingSkill}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {addingSkill ? "Ekleniyor..." : "Ekle"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {profile?.skills.length === 0 ? (
                <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  Henüz yetenek eklenmedi.
                </div>
              ) : (
                profile?.skills.map((skill) => (
                  <Card key={skill.id} className="border-slate-850 bg-slate-900/20 backdrop-blur-md p-4 flex items-center justify-between">
                    <div className="flex-1 space-y-2 pr-6">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{skill.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{skill.proficiencyLevel}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-600"
                          style={{ width: `${skill.proficiencyLevel}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-slate-500 hover:text-red-400 h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Socials Tab */}
          <TabsContent value="socials" className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-violet-400" /> Sosyal Medya Hesaplarım
              </h2>
              <Dialog open={socialModalOpen} onOpenChange={setSocialModalOpen}>
                <DialogTrigger render={<Button className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"><Plus className="h-4 w-4" /> Yeni Hesap</Button>} />
                <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
                  <DialogHeader>
                    <CardTitle className="text-white text-xl">Sosyal Hesap Ekle</CardTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSocial} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platform</label>
                      <select
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value)}
                        className="w-full rounded-md border border-slate-800 bg-slate-950 text-slate-100 p-2 focus:border-violet-500 focus:outline-none"
                      >
                        <option value="GitHub">GitHub</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Medium">Medium</option>
                        <option value="Website">Web sitesi / Blog</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Link URL</label>
                      <Input
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSocialModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        disabled={addingSocial}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {addingSocial ? "Ekleniyor..." : "Ekle"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {profile?.socialLinks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  Sosyal medya bağlantısı eklenmemiş.
                </div>
              ) : (
                profile?.socialLinks.map((social) => (
                  <Card key={social.id} className="border-slate-850 bg-slate-900/20 backdrop-blur-md p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{social.platformName}</span>
                      <p className="text-xs text-slate-400 truncate max-w-sm font-mono">{social.url}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSocial(social.id)}
                      className="text-slate-500 hover:text-red-400 h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
