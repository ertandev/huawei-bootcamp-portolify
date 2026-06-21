"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Loader2, ArrowLeft, Globe, User, Briefcase, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Username validation
    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      setError("Kullanıcı adı sadece küçük harf, rakam ve tire (-) içerebilir.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/Auth/register", {
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        title,
      });

      const { token, userId, username: resolvedUsername } = response.data;

      // Store in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", resolvedUsername);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data || 
        "Kayıt işlemi başarısız. Bilgilerinizi kontrol edip tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-transparent text-foreground overflow-y-auto py-16 px-4 font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

      {/* Top Navbar */}
      <div className="absolute top-8 left-8 right-8 z-10 flex justify-between items-center">
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-1.5 rounded-full hover:bg-accent px-4 py-2 text-xs font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Ana Sayfa
          </Button>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> Portfolify
        </Link>
      </div>

      {/* Register Form Container */}
      <div className="w-full max-w-xl relative z-10">
        <div className="bg-card text-card-foreground rounded-xl p-8 md:p-10 shadow-lg border border-border space-y-8 animate-apple-in">
          <div className="space-y-2 text-center">
            <h1 className="text-2.5xl font-semibold tracking-tight">
              Hesap Oluştur
            </h1>
            <p className="text-xs text-muted-foreground">
              Kendi dijital kartvizit alanınızı ve portfolyonuzu saniyeler içinde kurun
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Kullanıcı Adı (Username)</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="vortex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())}
                  required
                  className="pl-11 py-5 bg-background border-input rounded-lg focus-visible:ring-ring focus-visible:ring-1 text-xs text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>
              <div className="bg-accent/40 border border-border rounded-lg p-2.5 flex items-center justify-between text-[11px] text-muted-foreground ml-0.5">
                <span>Profil Adresiniz:</span>
                <span className="text-foreground font-mono select-all">/?user={username || "kullanici-adi"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="v0rteX"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-11 py-5 bg-background border-input rounded-lg focus-visible:ring-ring focus-visible:ring-1 text-xs text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Ünvan</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Senior C# Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="pl-11 py-5 bg-background border-input rounded-lg focus-visible:ring-ring focus-visible:ring-1 text-xs text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="ornek@portfolify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 py-5 bg-background border-input rounded-lg focus-visible:ring-ring focus-visible:ring-1 text-xs text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground ml-0.5">Şifre (En Az 6 Karakter)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-11 py-5 bg-background border-input rounded-lg focus-visible:ring-ring focus-visible:ring-1 text-xs text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-5 text-xs mt-4 font-semibold shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Hesap oluşturuluyor
                </>
              ) : (
                "Hesap Oluştur ve Başla"
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-foreground hover:underline underline-offset-4 font-semibold ml-1">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
