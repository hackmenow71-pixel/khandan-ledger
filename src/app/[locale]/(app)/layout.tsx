import { Navbar } from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex flex-col transition-colors relative overflow-x-hidden">
      {/* Ambient background glowing orbs for Glassmorphism */}
      <div className="ambient-glow-orb w-[420px] h-[420px] bg-indigo-600/25 top-[-60px] left-[-80px]"></div>
      <div className="ambient-glow-orb w-[450px] h-[450px] bg-emerald-600/20 bottom-[-100px] right-[-100px]"></div>
      <div className="ambient-glow-orb w-[350px] h-[350px] bg-purple-600/20 top-[40%] right-[30%]"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
