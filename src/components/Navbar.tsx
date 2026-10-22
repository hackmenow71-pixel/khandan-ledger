"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdown when route changes
  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Click outside listener to close "More" dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLocale = () => {
    const nextLocale = currentLocale === "en" ? "ur" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  const closeDropdowns = () => {
    setMoreOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="glass-nav backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 shadow-sm border-b border-gray-200/50 dark:border-white/10 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" onClick={closeDropdowns} className="font-bold text-xl bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Khandan Ledger
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2 md:space-x-4 sm:rtl:space-x-reverse">
              <Link
                href="/"
                onClick={closeDropdowns}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${pathname === '/' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {t("dashboard")}
              </Link>
              <Link
                href="/persons"
                onClick={closeDropdowns}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${pathname === '/persons' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {t("persons")}
              </Link>
              <Link
                href="/inventory"
                onClick={closeDropdowns}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${pathname === '/inventory' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {t("inventory")}
              </Link>
              <Link
                href="/notes"
                onClick={closeDropdowns}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${pathname === '/notes' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {t("notes")}
              </Link>
              <Link
                href="/reports"
                onClick={closeDropdowns}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${pathname === '/reports' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {t("reports")}
              </Link>
              <Link
                href="/audit"
                onClick={closeDropdowns}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${pathname === '/audit' ? 'border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                Audit Log
              </Link>
              
              {/* More Dropdown Menu */}
              <div ref={moreRef} className="relative flex items-center">
                <button 
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`inline-flex items-center px-2 py-1 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    moreOpen 
                      ? 'bg-white/15 text-indigo-400 dark:text-indigo-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>More</span>
                  <span className={`ml-1 text-[10px] transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {moreOpen && (
                  <div className="absolute top-full mt-2 w-48 right-0 glass-panel backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-white/15 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="py-1.5 p-1 space-y-0.5">
                      <Link 
                        href="/expenses" 
                        onClick={closeDropdowns} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span>📊</span>
                        <span>{t("expenses")}</span>
                      </Link>
                      <Link 
                        href="/calculator" 
                        onClick={closeDropdowns} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span>🧮</span>
                        <span>Calculator</span>
                      </Link>
                      <Link 
                        href="/calendar" 
                        onClick={closeDropdowns} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span>📅</span>
                        <span>Calendar</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        onClick={closeDropdowns} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </Link>
                      <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1"></div>
                      <a 
                        href="/api/backup" 
                        onClick={closeDropdowns} 
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <span>💾</span>
                        <span>{t("backup")}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse flex-shrink-0 ml-4">
            <form action={`/${currentLocale}/search`} method="GET" className="hidden lg:block relative">
              <input 
                type="text" 
                name="q" 
                placeholder={currentLocale === 'en' ? "Global search..." : "تلاش کریں..."} 
                className="w-32 xl:w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-white/15 rounded-xl bg-gray-50/70 dark:bg-slate-800/60 text-gray-900 dark:text-gray-100 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            <ThemeToggle />
            <button
              onClick={toggleLocale}
              className={`px-3 py-1.5 border border-gray-300/80 dark:border-white/15 rounded-xl text-sm font-semibold text-gray-800 hover:text-gray-950 dark:text-gray-200 dark:hover:text-white bg-gray-100/80 hover:bg-gray-200/80 dark:bg-white/5 dark:hover:bg-white/10 shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                currentLocale === "en" ? "font-urdu text-base" : "font-sans text-sm"
              }`}
              title={currentLocale === "en" ? "اردو میں دیکھیں" : "View in English"}
            >
              <span className="text-xs">🌐</span>
              <span>{t("switchLang")}</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: `/${currentLocale}/login` })}
              className="hidden sm:block px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {t("logout")}
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-white/10 glass-panel backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 absolute w-full z-50 shadow-2xl animate-in fade-in duration-150">
          <div className="pt-2 pb-3 space-y-1 px-2">
            <Link href="/" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">{t("dashboard")}</Link>
            <Link href="/persons" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">{t("persons")}</Link>
            <Link href="/inventory" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">{t("inventory")}</Link>
            <Link href="/notes" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">{t("notes")}</Link>
            <Link href="/reports" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">{t("reports")}</Link>
            <Link href="/audit" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">Audit Log</Link>
            <Link href="/expenses" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">{t("expenses")}</Link>
            <Link href="/calculator" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">Calculator</Link>
            <Link href="/calendar" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">Calendar</Link>
            <Link href="/settings" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-500/10">Settings</Link>
            <a href="/api/backup" onClick={closeDropdowns} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-500/10">{t("backup")}</a>
            <button onClick={() => signOut({ callbackUrl: `/${currentLocale}/login` })} className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-500 hover:bg-rose-500/10">{t("logout")}</button>
          </div>
        </div>
      )}
    </nav>
  );
}
