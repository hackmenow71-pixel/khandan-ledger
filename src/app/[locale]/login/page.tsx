"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push(`/${currentLocale}`);
    }
  };

  const toggleLanguage = () => {
    const nextLocale = currentLocale === "en" ? "ur" : "en";
    router.replace(`/${nextLocale}/login`);
  };

  return (
    <div 
      suppressHydrationWarning 
      className="relative min-h-screen w-screen flex items-center justify-center p-4 bg-slate-50/80 dark:bg-slate-950 overflow-hidden text-gray-900 dark:text-slate-100 transition-colors"
    >
      {/* Top right quick controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={toggleLanguage}
          className={`px-3 py-1.5 border border-gray-300/80 dark:border-white/15 rounded-xl text-xs font-semibold text-gray-800 hover:text-gray-950 dark:text-gray-200 dark:hover:text-white bg-white/80 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentLocale === "en" ? "font-urdu text-sm" : "font-sans text-xs"
          }`}
          title={currentLocale === "en" ? "اردو میں دیکھیں" : "View in English"}
        >
          <span>🌐</span>
          <span>{currentLocale === "en" ? "اردو" : "English"}</span>
        </button>
      </div>

      {/* Ambient background glowing orbs */}
      <div className="ambient-glow-orb w-[450px] h-[450px] bg-indigo-500/15 dark:bg-indigo-600/30 top-[-80px] left-[-80px]"></div>
      <div className="ambient-glow-orb w-[400px] h-[400px] bg-emerald-500/15 dark:bg-emerald-600/25 bottom-[-80px] right-[-80px]"></div>
      <div className="ambient-glow-orb w-[300px] h-[300px] bg-purple-500/15 dark:bg-purple-600/20 top-[40%] right-[30%]"></div>

      <div 
        suppressHydrationWarning 
        className="z-10 w-full max-w-md overflow-hidden rounded-3xl glass-panel shadow-2xl border border-gray-200/80 dark:border-white/15 backdrop-blur-2xl bg-white/85 dark:bg-slate-900/60"
      >
        <div suppressHydrationWarning className="flex flex-col items-center justify-center space-y-2 border-b border-gray-200/60 dark:border-white/10 px-6 py-8 text-center bg-gray-50/60 dark:bg-white/5">
          <div suppressHydrationWarning className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-emerald-500/20 mb-2">
            <div suppressHydrationWarning className="w-full h-full bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center backdrop-blur-sm text-xl shadow-inner">
              💰
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 dark:from-emerald-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
            Khandan Ledger
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-300/80 font-urdu">
            مشترکہ خاندانی اخراجات • Sign In
          </p>
        </div>

        <div suppressHydrationWarning className="flex flex-col space-y-4 px-6 py-8 sm:px-10">
          <form suppressHydrationWarning onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div suppressHydrationWarning>
              <label suppressHydrationWarning className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                suppressHydrationWarning
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-gray-300/80 dark:border-white/15 bg-white/90 dark:bg-white/10 px-3.5 py-2.5 text-sm placeholder-gray-400 dark:placeholder-slate-400 text-gray-900 dark:text-white shadow-sm backdrop-blur-md focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            <div suppressHydrationWarning>
              <label suppressHydrationWarning className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                suppressHydrationWarning
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-gray-300/80 dark:border-white/15 bg-white/90 dark:bg-white/10 px-3.5 py-2.5 text-sm placeholder-gray-400 dark:placeholder-slate-400 text-gray-900 dark:text-white shadow-sm backdrop-blur-md focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-600 dark:hover:from-emerald-600 dark:hover:to-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In • لاگ ان کریں"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
