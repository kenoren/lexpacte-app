'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, FileText, BookOpen, Settings, Loader2, Crown, Zap, Menu, X } from 'lucide-react'

const menuItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
    { name: 'Mes Analyses', icon: FileText, path: '/analyses' },
    { name: 'Bibliothèque', icon: BookOpen, path: '/bibliotheque' },
    { name: 'Paramètres', icon: Settings, path: '/parametres' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { user, isLoaded } = useUser()
    const [isOpen, setIsOpen] = useState(false) // État pour le menu mobile

    return (
        <>
            {/* BOUTON HAMBURGER (Visible uniquement sur mobile/tablette) */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-[60] p-3 bg-blue-600 text-white rounded-xl shadow-lg"
            >
                <Menu size={24} />
            </button>

            {/* OVERLAY (Ferme le menu quand on clique à côté) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ASIDE (La Sidebar) */}
            <aside className={`
                fixed left-0 top-0 h-screen w-72 bg-[#020408] flex flex-col border-r border-white/5 z-[70]
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-10 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.3)]">
                            <span className="text-white font-black text-2xl italic">L</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-black text-xl tracking-tighter uppercase leading-none italic">Lex<span className="text-blue-500">pacte</span></span>
                            <span className="text-[9px] text-slate-500 font-bold tracking-[0.3em] mt-1 uppercase">M&A Strategy</span>
                        </div>
                    </div>
                    {/* Bouton fermer sur mobile */}
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path
                        return (
                            <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)}
                                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                                      isActive ? 'bg-blue-600/10 text-white border border-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/[0.02]'
                                  }`}>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-600 group-hover:text-blue-400'}`} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* UPSELL CARD */}
                <div className="m-8 p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-white/5 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown className="w-4 h-4 text-yellow-500/80" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Prestige Access</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-4 font-medium uppercase tracking-tighter">Accédez à Mistral Large & GPT-4o pour vos audits.</p>
                        <button className="w-full py-3 bg-white text-black text-[10px] font-black rounded-xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-widest shadow-xl">
                            Upgrade
                        </button>
                    </div>
                    <Zap className="absolute -bottom-4 -right-4 w-20 h-20 text-blue-500/5 rotate-12" />
                </div>

                {/* User Profile */}
                <div className="p-8 border-t border-white/5 bg-black/20">
                    {!isLoaded ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
                    ) : (
                        <div className="flex items-center gap-4">
                            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 ring-2 ring-white/5" } }} />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm text-white font-bold truncate tracking-tight">{user?.firstName || "Maître"}</span>
                                <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" /> Maître Vérifié
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}