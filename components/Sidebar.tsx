'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from "@clerk/nextjs";
import {
    LayoutDashboard, FileText, BookOpen, Settings,
    Loader2, ShieldCheck, Crown, Zap, ChevronRight
} from 'lucide-react'

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Mes Analyses', icon: FileText, path: '/analyses' },
    { name: 'Bibliothèque', icon: BookOpen, path: '/bibliotheque' },
    { name: 'Paramètres', icon: Settings, path: '/parametres' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { user, isLoaded } = useUser();

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-[#05070a] flex flex-col border-r border-white/5 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.3)]">
            {/* Logo Section */}
            <div className="p-8 mb-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-all duration-500">
                        <span className="text-white font-black text-xl italic text-shadow">L</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-xl tracking-tighter uppercase leading-none">Lex<span className="text-blue-500 font-black">pacte</span></span>
                        <span className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1">LEGAL INTELLIGENCE</span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <Link key={item.path} href={item.path}
                              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                  isActive
                                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]'
                                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                              }`}>
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-gray-600 group-hover:text-blue-400'} transition-colors`} />
                            <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto flex items-center gap-2">
                                    <div className="w-1 h-4 rounded-full bg-blue-500" />
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* UPSELL CARD */}
            <div className="m-6 p-5 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/5 border border-blue-500/20 relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1 bg-yellow-500/20 rounded-lg">
                            <Crown className="w-4 h-4 text-yellow-500" />
                        </div>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Compte Pro</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4">Débloquez l'IA avancée et l'analyse de masse.</p>
                    <button className="w-full py-2.5 bg-white text-black text-[11px] font-black rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 uppercase">
                        Upgrade
                    </button>
                </div>
                <Zap className="absolute -bottom-6 -right-6 w-24 h-24 text-blue-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>

            {/* User Profile Section */}
            <div className="p-6 border-t border-white/5 bg-[#030508]">
                {!isLoaded ? (
                    <div className="flex items-center gap-3 px-2">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="flex items-center gap-4 group">
                        <UserButton afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "w-11 h-11 ring-2 ring-blue-500/20 group-hover:ring-blue-500/50 transition-all border-none"
                                        }
                                    }}
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13px] text-white font-bold truncate tracking-tight">{user?.firstName || "Maître"}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Maître Vérifié</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}