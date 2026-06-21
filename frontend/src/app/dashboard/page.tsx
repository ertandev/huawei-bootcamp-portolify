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
  BookOpen,
  Pencil,
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
  displayOrder: number;
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

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

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

  // New Experience Form State
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [expCompany, setExpCompany] = useState("");
  const [expTitle, setExpTitle] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  const [expLocation, setExpLocation] = useState("");
  const [addingExperience, setAddingExperience] = useState(false);

  // New Education Form State
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduFieldOfStudy, setEduFieldOfStudy] = useState("");
  const [eduStartDate, setEduStartDate] = useState("");
  const [eduEndDate, setEduEndDate] = useState("");
  const [eduIsCurrent, setEduIsCurrent] = useState(false);
  const [eduDescription, setEduDescription] = useState("");
  const [addingEducation, setAddingEducation] = useState(false);

  // Editing Item States
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);

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
      if (editingProjectId) {
        await api.put(`/Project/${editingProjectId}`, {
          id: editingProjectId,
          title: projectTitle,
          description: projectDesc,
          githubUrl: projectGithub || null,
          projectUrl: projectDemo || null,
          isFeatured: projectIsFeatured,
          displayOrder: profile.projects.find(p => p.id === editingProjectId)?.displayOrder || 1,
        });
      } else {
        await api.post("/Project", {
          developerProfileId: profile.id,
          title: projectTitle,
          description: projectDesc,
          githubUrl: projectGithub || null,
          projectUrl: projectDemo || null,
          displayOrder: profile.projects.length + 1,
          isFeatured: projectIsFeatured,
        });
      }

      // Clear states
      setProjectTitle("");
      setProjectDesc("");
      setProjectGithub("");
      setProjectDemo("");
      setProjectIsFeatured(false);
      setProjectModalOpen(false);
      setEditingProjectId(null);

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
      if (editingSocialId) {
        await api.put(`/SocialLink/${editingSocialId}`, {
          id: editingSocialId,
          platformName: socialPlatform,
          url: socialUrl,
        });
      } else {
        await api.post("/SocialLink", {
          developerProfileId: profile.id,
          platformName: socialPlatform,
          url: socialUrl,
        });
      }

      setSocialUrl("");
      setSocialModalOpen(false);
      setEditingSocialId(null);

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

  // Experiences CRUD
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setAddingExperience(true);
    try {
      const displayOrder = editingExperienceId 
        ? (profile.experiences.find(x => x.id === editingExperienceId)?.displayOrder || 1)
        : (profile.experiences.length + 1);

      const body = {
        developerProfileId: profile.id,
        company: expCompany,
        title: expTitle,
        startDate: new Date(expStartDate).toISOString(),
        endDate: expIsCurrent ? null : new Date(expEndDate).toISOString(),
        description: expDescription || null,
        location: expLocation || null,
        displayOrder
      };

      if (editingExperienceId) {
        await api.put(`/Experience/${editingExperienceId}`, {
          ...body,
          id: editingExperienceId
        });
      } else {
        await api.post("/Experience", body);
      }

      // Clear states
      setExpCompany("");
      setExpTitle("");
      setExpStartDate("");
      setExpEndDate("");
      setExpIsCurrent(false);
      setExpDescription("");
      setExpLocation("");
      setExperienceModalOpen(false);
      setEditingExperienceId(null);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingExperience(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!confirm("Bu iş deneyimini silmek istediğinize emin misiniz?")) return;

    try {
      await api.delete(`/Experience/${expId}`);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Educations CRUD
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setAddingEducation(true);
    try {
      const displayOrder = editingEducationId 
        ? (profile.educations.find(x => x.id === editingEducationId)?.displayOrder || 1)
        : (profile.educations.length + 1);

      const body = {
        developerProfileId: profile.id,
        school: eduSchool,
        degree: eduDegree,
        fieldOfStudy: eduFieldOfStudy,
        startDate: new Date(eduStartDate).toISOString(),
        endDate: eduIsCurrent ? null : new Date(eduEndDate).toISOString(),
        description: eduDescription || null,
        displayOrder
      };

      if (editingEducationId) {
        await api.put(`/Education/${editingEducationId}`, {
          ...body,
          id: editingEducationId
        });
      } else {
        await api.post("/Education", body);
      }

      // Clear states
      setEduSchool("");
      setEduDegree("");
      setEduFieldOfStudy("");
      setEduStartDate("");
      setEduEndDate("");
      setEduIsCurrent(false);
      setEduDescription("");
      setEducationModalOpen(false);
      setEditingEducationId(null);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingEducation(false);
    }
  };

  const handleDeleteEducation = async (eduId: string) => {
    if (!confirm("Bu eğitim bilgisini silmek istediğinize emin misiniz?")) return;

    try {
      await api.delete(`/Education/${eduId}`);

      // Reload
      const response = await api.get<ProfileDetails>("/DeveloperProfile/details");
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="text-muted-foreground tracking-wide text-xs uppercase font-medium">Paneli Yükleniyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground font-sans pb-16 overflow-x-hidden relative">

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-foreground" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Portfolify
            </span>
            <Badge className="bg-muted border border-border text-muted-foreground font-mono text-[9px] ml-2 px-2.5 py-0.5 rounded-full select-all">
              @{username}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/?user=${username}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs border-border">
                Profilimi Gör <ExternalLink className="h-3 w-3 ml-1 text-muted-foreground" />
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-semibold px-3 py-2 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-12 space-y-8 relative z-10">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2.5xl md:text-3xl font-semibold tracking-tight text-foreground">Yönetim Paneli</h1>
          <p className="text-muted-foreground text-xs font-normal">Dijital kartvizit profilinizin detaylarını ve portfolyo içeriklerinizi yönetin.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs text-center font-medium animate-apple-in">
            {error}
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full space-y-6">
          <TabsList className="flex bg-muted/65 border border-border p-1 rounded-lg max-w-2xl mx-auto md:mx-0 backdrop-blur-md">
            <TabsTrigger value="profile" className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer">Profil</TabsTrigger>
            <TabsTrigger value="projects" className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer">Projeler</TabsTrigger>
            <TabsTrigger value="skills" className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer">Yetenekler</TabsTrigger>
            <TabsTrigger value="socials" className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer">Sosyal Hesaplar</TabsTrigger>
            <TabsTrigger value="experiences" className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer">Deneyimler</TabsTrigger>
            <TabsTrigger value="educations" className="flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all select-none cursor-pointer">Eğitim</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="pt-2 animate-apple-in">
            <Card className="border-border bg-card/45 backdrop-blur-xs rounded-xl overflow-hidden">
              <CardHeader className="border-b border-border p-6 md:p-8">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-muted-foreground" /> Kişisel Bilgiler
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Kartınızda sergilenecek ana kimlik ve biyografi bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Ad Soyad</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Ünvan</label>
                      <Input
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        required
                        className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Hakkımda / Biyografi</label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                      rows={4}
                      className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                    />
                  </div>

                  {/* Active Skills Preview (Visual Stack) */}
                  {profile && profile.skills.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center ml-0.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Yetenekler (Aktif Stack Önizleme)</label>
                        <span className="text-[10px] text-muted-foreground/80 font-medium">Üstteki &ldquo;Yetenekler&rdquo; sekmesinden yönetebilirsiniz</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-3.5 bg-muted/20 border border-border rounded-xl">
                        {profile.skills.map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="secondary"
                            className="bg-secondary border border-border text-foreground px-2.5 py-1 rounded-full text-[10px] font-medium"
                          >
                            {skill.name} ({skill.proficiencyLevel}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">E-posta</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Profil Fotoğrafı URL</label>
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://gorsel-adresi.com/resim.jpg"
                        className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Özgeçmiş (Resume) URL</label>
                      <Input
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://drive.google.com/cv.pdf"
                        className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Kişisel Web Sitesi URL</label>
                      <Input
                        value={blogUrl}
                        onChange={(e) => setBlogUrl(e.target.value)}
                        placeholder="https://adiniz.dev"
                        className="bg-background border-input rounded-lg focus-visible:ring-ring text-xs text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={updatingProfile}
                      className="px-6 py-2.5 text-xs font-semibold shadow-sm select-none cursor-pointer rounded-lg"
                    >
                      {updatingProfile ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Kaydediliyor
                        </>
                      ) : (
                        "Değişiklikleri Kaydet"
                      )}
                    </Button>
                    {profileSuccess && (
                      <span className="text-emerald-500 text-xs flex items-center gap-1 font-medium animate-apple-in">
                        <Check className="h-4 w-4" /> Değişiklikler kaydedildi!
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="pt-2 space-y-4 animate-apple-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-muted-foreground" /> Projelerim
              </h2>
              <Dialog open={projectModalOpen} onOpenChange={(open) => {
                setProjectModalOpen(open);
                if (!open) {
                  setEditingProjectId(null);
                  setProjectTitle("");
                  setProjectDesc("");
                  setProjectGithub("");
                  setProjectDemo("");
                  setProjectIsFeatured(false);
                }
              }}>
                <DialogTrigger
                  render={
                    <button 
                      onClick={() => {
                        setEditingProjectId(null);
                        setProjectTitle("");
                        setProjectDesc("");
                        setProjectGithub("");
                        setProjectDemo("");
                        setProjectIsFeatured(false);
                      }}
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Yeni Proje
                    </button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProjectId ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProject} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Proje Adı</label>
                      <Input
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Örn: Portfolify Mobil Uygulaması"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Açıklama</label>
                      <Textarea
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Projenin amacını, kullanılan teknolojileri kısaca açıklayın..."
                        required
                        rows={3}
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">GitHub URL</label>
                        <Input
                          value={projectGithub}
                          onChange={(e) => setProjectGithub(e.target.value)}
                          placeholder="https://github.com/..."
                          className="bg-background border-input text-[11px] rounded-lg focus-visible:ring-ring text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Demo URL</label>
                        <Input
                          value={projectDemo}
                          onChange={(e) => setProjectDemo(e.target.value)}
                          placeholder="https://demo-adresi.com"
                          className="bg-background border-input text-[11px] rounded-lg focus-visible:ring-ring text-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 ml-0.5">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={projectIsFeatured}
                        onChange={(e) => setProjectIsFeatured(e.target.checked)}
                        className="rounded border-input bg-background text-primary focus:ring-ring h-4 w-4 accent-primary cursor-pointer"
                      />
                      <label htmlFor="isFeatured" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                        Bu projeyi öne çıkar (Featured)
                      </label>
                    </div>
                    <DialogFooter className="pt-2 gap-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setProjectModalOpen(false)}
                        className="text-muted-foreground hover:text-foreground rounded-full text-xs"
                      >
                        İptal
                      </Button>
                      <button
                        type="submit"
                        disabled={addingProject}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold select-none cursor-pointer rounded-lg"
                      >
                        {addingProject ? "Kaydediliyor..." : (editingProjectId ? "Kaydet" : "Proje Ekle")}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.projects.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                  Henüz bir proje eklemediniz. Sağ üstten yeni proje ekleyebilirsiniz.
                </div>
              ) : (
                profile?.projects.map((project) => (
                  <Card key={project.id} className="border-border bg-card/45 rounded-xl overflow-hidden shadow-sm">
                    <CardHeader className="p-5 pb-2 flex flex-row items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base font-semibold text-foreground">{project.title}</CardTitle>
                          {project.isFeatured && (
                            <Badge className="bg-secondary border border-border text-foreground text-[8px] hover:bg-secondary/80 font-bold uppercase tracking-wider">
                              Öne Çıkan
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProjectId(project.id);
                            setProjectTitle(project.title);
                            setProjectDesc(project.description);
                            setProjectGithub(project.githubUrl || "");
                            setProjectDemo(project.projectUrl || "");
                            setProjectIsFeatured(project.isFeatured);
                            setProjectModalOpen(true);
                          }}
                          className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                          title="Projeyi Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          title="Proje Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-4">
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[50px] font-normal">
                        {project.description}
                      </p>
                      <div className="flex gap-2.5 text-[11px] pt-1 text-muted-foreground">
                        {project.githubUrl && <span className="bg-muted border border-border px-2 py-0.5 rounded font-mono truncate">GitHub</span>}
                        {project.projectUrl && <span className="bg-muted border border-border px-2 py-0.5 rounded font-mono truncate">Demo</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="pt-2 space-y-4 animate-apple-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-muted-foreground" /> Yeteneklerim
              </h2>
              <Dialog open={skillModalOpen} onOpenChange={setSkillModalOpen}>
                <DialogTrigger
                  render={
                    <button className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Yeni Yetenek
                    </button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Yeni Yetenek Ekle</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSkill} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Yetenek Adı</label>
                      <Input
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        placeholder="Örn: C# / ASP.NET Core"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-muted-foreground flex justify-between ml-0.5">
                        <span>Yetkinlik Seviyesi</span>
                        <span className="text-foreground font-bold">{skillLevel}%</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(Number(e.target.value))}
                        className="w-full accent-primary bg-muted h-1.5 rounded-lg cursor-pointer border border-border"
                      />
                    </div>
                    <DialogFooter className="pt-2 gap-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSkillModalOpen(false)}
                        className="text-muted-foreground hover:text-foreground rounded-full text-xs"
                      >
                        İptal
                      </Button>
                      <button
                        type="submit"
                        disabled={addingSkill}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold select-none cursor-pointer rounded-lg"
                      >
                        {addingSkill ? "Ekleniyor..." : "Yetenek Ekle"}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {profile?.skills.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                  Henüz yetenek eklenmedi.
                </div>
              ) : (
                profile?.skills.map((skill) => (
                  <Card key={skill.id} className="border-border bg-card/45 rounded-xl p-4.5 flex items-center justify-between shadow-sm">
                    <div className="flex-1 space-y-2 pr-6">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{skill.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/40 border border-border px-2 py-0.5 rounded">{skill.proficiencyLevel}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${skill.proficiencyLevel}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      title="Yetenek Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Socials Tab */}
          <TabsContent value="socials" className="pt-2 space-y-4 animate-apple-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-muted-foreground" /> Sosyal Medya Bağlantıları
              </h2>
              <Dialog open={socialModalOpen} onOpenChange={(open) => {
                setSocialModalOpen(open);
                if (!open) {
                  setEditingSocialId(null);
                  setSocialUrl("");
                  setSocialPlatform("GitHub");
                }
              }}>
                <DialogTrigger
                  render={
                    <button 
                      onClick={() => {
                        setEditingSocialId(null);
                        setSocialUrl("");
                        setSocialPlatform("GitHub");
                      }}
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Yeni Hesap
                    </button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSocialId ? "Sosyal Hesabı Düzenle" : "Sosyal Hesap Ekle"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSocial} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Platform</label>
                      <select
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value)}
                        className="w-full rounded-md border border-input bg-background text-foreground p-3 focus:border-ring focus:outline-none text-xs transition-all"
                      >
                        <option value="GitHub" className="bg-popover text-popover-foreground">GitHub</option>
                        <option value="LinkedIn" className="bg-popover text-popover-foreground">LinkedIn</option>
                        <option value="Twitter" className="bg-popover text-popover-foreground">Twitter</option>
                        <option value="Medium" className="bg-popover text-popover-foreground">Medium</option>
                        <option value="Website" className="bg-popover text-popover-foreground">Web sitesi / Blog</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Link URL</label>
                      <Input
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <DialogFooter className="pt-2 gap-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSocialModalOpen(false)}
                        className="text-muted-foreground hover:text-foreground rounded-full text-xs"
                      >
                        İptal
                      </Button>
                      <button
                        type="submit"
                        disabled={addingSocial}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold select-none cursor-pointer rounded-lg"
                      >
                        {addingSocial ? "Kaydediliyor..." : (editingSocialId ? "Kaydet" : "Hesap Ekle")}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {profile?.socialLinks.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                  Sosyal medya bağlantısı eklenmemiş.
                </div>
              ) : (
                profile?.socialLinks.map((social) => (
                  <Card key={social.id} className="border-border bg-card/45 rounded-xl p-4.5 flex items-center justify-between shadow-sm">
                    <div className="space-y-1 truncate pr-4">
                      <span className="font-semibold text-xs text-foreground block">{social.platformName}</span>
                      <p className="text-[10px] text-muted-foreground font-mono truncate max-w-sm">{social.url}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingSocialId(social.id);
                          setSocialPlatform(social.platformName);
                          setSocialUrl(social.url);
                          setSocialModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        title="Sosyal Hesabı Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSocial(social.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Sosyal Medya Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value="experiences" className="pt-2 space-y-4 animate-apple-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-muted-foreground" /> Deneyimlerim
              </h2>
              <Dialog open={experienceModalOpen} onOpenChange={(open) => {
                setExperienceModalOpen(open);
                if (!open) {
                  setEditingExperienceId(null);
                  setExpCompany("");
                  setExpTitle("");
                  setExpStartDate("");
                  setExpEndDate("");
                  setExpIsCurrent(false);
                  setExpDescription("");
                  setExpLocation("");
                }
              }}>
                <DialogTrigger
                  render={
                    <button 
                      onClick={() => {
                        setEditingExperienceId(null);
                        setExpCompany("");
                        setExpTitle("");
                        setExpStartDate("");
                        setExpEndDate("");
                        setExpIsCurrent(false);
                        setExpDescription("");
                        setExpLocation("");
                      }}
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Yeni Deneyim
                    </button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingExperienceId ? "Deneyimi Düzenle" : "Yeni Deneyim Ekle"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddExperience} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Şirket / Kurum</label>
                      <Input
                        value={expCompany}
                        onChange={(e) => setExpCompany(e.target.value)}
                        placeholder="Örn: Google / Freelance"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Pozisyon / Ünvan</label>
                      <Input
                        value={expTitle}
                        onChange={(e) => setExpTitle(e.target.value)}
                        placeholder="Örn: Senior Software Engineer"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Lokasyon (Opsiyonel)</label>
                      <Input
                        value={expLocation}
                        onChange={(e) => setExpLocation(e.target.value)}
                        placeholder="Örn: İstanbul, Türkiye / Remote"
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Başlangıç Tarihi</label>
                        <Input
                          type="date"
                          value={expStartDate}
                          onChange={(e) => setExpStartDate(e.target.value)}
                          required
                          className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Bitiş Tarihi</label>
                        <Input
                          type="date"
                          value={expEndDate}
                          onChange={(e) => setExpEndDate(e.target.value)}
                          disabled={expIsCurrent}
                          required={!expIsCurrent}
                          className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 ml-0.5">
                      <input
                        type="checkbox"
                        id="expIsCurrent"
                        checked={expIsCurrent}
                        onChange={(e) => setExpIsCurrent(e.target.checked)}
                        className="rounded border-input bg-background text-primary focus:ring-ring h-4 w-4 accent-primary cursor-pointer"
                      />
                      <label htmlFor="expIsCurrent" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                        Şu an burada çalışıyorum
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Açıklama (Opsiyonel)</label>
                      <Textarea
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        placeholder="Yaptığınız işler, kullanılan teknolojiler..."
                        rows={3}
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <DialogFooter className="pt-2 gap-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setExperienceModalOpen(false)}
                        className="text-muted-foreground hover:text-foreground rounded-full text-xs"
                      >
                        İptal
                      </Button>
                      <button
                        type="submit"
                        disabled={addingExperience}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold select-none cursor-pointer rounded-lg"
                      >
                        {addingExperience ? "Kaydediliyor..." : (editingExperienceId ? "Kaydet" : "Deneyim Ekle")}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {profile?.experiences.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                  Henüz bir iş deneyimi eklemediniz.
                </div>
              ) : (
                profile?.experiences.map((exp) => (
                  <Card key={exp.id} className="border-border bg-card/45 rounded-xl p-4.5 flex items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-0 pr-4 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{exp.title}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">@{exp.company}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap font-mono">
                        <span>{formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "Devam Ediyor"}</span>
                        {exp.location && <span className="text-muted-foreground/60">• {exp.location}</span>}
                      </div>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1 whitespace-pre-line font-normal">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingExperienceId(exp.id);
                          setExpCompany(exp.company);
                          setExpTitle(exp.title);
                          setExpStartDate(exp.startDate ? exp.startDate.split('T')[0] : "");
                          setExpEndDate(exp.endDate ? exp.endDate.split('T')[0] : "");
                          setExpIsCurrent(!exp.endDate);
                          setExpDescription(exp.description || "");
                          setExpLocation(exp.location || "");
                          setExperienceModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        title="Deneyimi Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Deneyimi Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Educations Tab */}
          <TabsContent value="educations" className="pt-2 space-y-4 animate-apple-in">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-muted-foreground" /> Eğitim Geçmişim
              </h2>
              <Dialog open={educationModalOpen} onOpenChange={(open) => {
                setEducationModalOpen(open);
                if (!open) {
                  setEditingEducationId(null);
                  setEduSchool("");
                  setEduDegree("");
                  setEduFieldOfStudy("");
                  setEduStartDate("");
                  setEduEndDate("");
                  setEduIsCurrent(false);
                  setEduDescription("");
                }
              }}>
                <DialogTrigger
                  render={
                    <button 
                      onClick={() => {
                        setEditingEducationId(null);
                        setEduSchool("");
                        setEduDegree("");
                        setEduFieldOfStudy("");
                        setEduStartDate("");
                        setEduEndDate("");
                        setEduIsCurrent(false);
                        setEduDescription("");
                      }}
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold gap-1.5 rounded-lg cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Yeni Eğitim
                    </button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEducationId ? "Eğitimi Düzenle" : "Yeni Eğitim Ekle"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddEducation} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Okul / Üniversite</label>
                      <Input
                        value={eduSchool}
                        onChange={(e) => setEduSchool(e.target.value)}
                        placeholder="Örn: Boğaziçi Üniversitesi"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Derece / Diploma</label>
                      <Input
                        value={eduDegree}
                        onChange={(e) => setEduDegree(e.target.value)}
                        placeholder="Örn: Lisans / Yüksek Lisans"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Bölüm / Alan</label>
                      <Input
                        value={eduFieldOfStudy}
                        onChange={(e) => setEduFieldOfStudy(e.target.value)}
                        placeholder="Örn: Bilgisayar Mühendisliği"
                        required
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Başlangıç Tarihi</label>
                        <Input
                          type="date"
                          value={eduStartDate}
                          onChange={(e) => setEduStartDate(e.target.value)}
                          required
                          className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Bitiş Tarihi</label>
                        <Input
                          type="date"
                          value={eduEndDate}
                          onChange={(e) => setEduEndDate(e.target.value)}
                          disabled={eduIsCurrent}
                          required={!eduIsCurrent}
                          className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 ml-0.5">
                      <input
                        type="checkbox"
                        id="eduIsCurrent"
                        checked={eduIsCurrent}
                        onChange={(e) => setEduIsCurrent(e.target.checked)}
                        className="rounded border-input bg-background text-primary focus:ring-ring h-4 w-4 accent-primary cursor-pointer"
                      />
                      <label htmlFor="eduIsCurrent" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                        Hala bu kurumda okuyorum
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Açıklama (Opsiyonel)</label>
                      <Textarea
                        value={eduDescription}
                        onChange={(e) => setEduDescription(e.target.value)}
                        placeholder="Kulüp faaliyetleri, aldığınız projeler veya not ortalaması..."
                        rows={3}
                        className="bg-background border-input text-xs rounded-lg focus-visible:ring-ring text-foreground"
                      />
                    </div>
                    <DialogFooter className="pt-2 gap-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEducationModalOpen(false)}
                        className="text-muted-foreground hover:text-foreground rounded-full text-xs"
                      >
                        İptal
                      </Button>
                      <button
                        type="submit"
                        disabled={addingEducation}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 text-xs font-semibold select-none cursor-pointer rounded-lg"
                      >
                        {addingEducation ? "Kaydediliyor..." : (editingEducationId ? "Kaydet" : "Eğitim Ekle")}
                      </button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {profile?.educations.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-card/20">
                  Henüz bir eğitim bilgisi eklemediniz.
                </div>
              ) : (
                profile?.educations.map((edu) => (
                  <Card key={edu.id} className="border-border bg-card/45 rounded-xl p-4.5 flex items-center justify-between shadow-sm">
                    <div className="flex-1 min-w-0 pr-4 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{edu.degree}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">@{edu.school}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        <span>{formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : "Devam Ediyor"}</span>
                        <span className="text-muted-foreground/60"> • {edu.fieldOfStudy}</span>
                      </div>
                      {edu.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1 whitespace-pre-line font-normal">
                          {edu.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingEducationId(edu.id);
                          setEduSchool(edu.school);
                          setEduDegree(edu.degree);
                          setEduFieldOfStudy(edu.fieldOfStudy);
                          setEduStartDate(edu.startDate ? edu.startDate.split('T')[0] : "");
                          setEduEndDate(edu.endDate ? edu.endDate.split('T')[0] : "");
                          setEduIsCurrent(!edu.endDate);
                          setEduDescription(edu.description || "");
                          setEducationModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        title="Eğitimi Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Eğitimi Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
