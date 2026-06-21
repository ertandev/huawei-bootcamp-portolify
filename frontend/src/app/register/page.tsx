"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, Mail, Loader2, ArrowLeft, Globe, User, Briefcase } from "lucide-react";

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
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 overflow-y-auto py-12 px-4 font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/20 blur-[120px] pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Button variant="ghost" className="text-slate-400 hover:text-slate-100 gap-2">
            <ArrowLeft className="h-4 w-4" /> Ana Sayfa
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Hesap Oluştur
            </CardTitle>
            <CardDescription className="text-slate-400">
              Kendi dijital kartvizit alanınızı ve portfolyonuzu saniyeler içinde kurun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Kullanıcı Adı (Username)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="vortex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())}
                    required
                    className="pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Profil Adresiniz: <span className="text-violet-400 font-mono">http://localhost:3000/?user={username || "kullanici-adi"}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Ad Soyad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="v0rteX"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Ünvan</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Senior C# Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="ornek@portfolify.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Şifre (Min. 6 Karakter)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium shadow-lg hover:shadow-violet-500/20 transition-all duration-300 py-6 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Hesap oluşturuluyor...
                  </>
                ) : (
                  "Hesap Oluştur ve Başla"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-400">
            <div>
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium underline underline-offset-4">
                Giriş Yapın
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
