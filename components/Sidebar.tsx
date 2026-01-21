
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from "@clerk/nextjs";
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    Settings,
    Loader2
} from 'lucide-react'

const menuItems = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: '/'
    },
    {
        name: 'Mes Analyses',
        icon: FileText,
        path: '/analyses'
    },
    {
        name: 'Bibliothèque',
        icon: BookOpen,
        path: '/bibliotheque'
    },
    {
        name: 'Paramètres',
        icon: Settings,
        path: '/parametres'
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { user, isLoaded } = useUser();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0C2A4D] flex flex-col border-r border-gray-800 z-50">
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-6 py-8">
                <img
                    src="/logo-sombre.webp"
                    alt="Lexpacte.ai Logo"
                    className="h-10 w-auto"
                />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }
              `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-gray-800 bg-[#0a2340]">
                {!isLoaded ? (
                    <div className="flex items-center gap-3 px-2">
                        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                        <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-2">
                        <div className="scale-110">
                            {/* UserButton gère automatiquement l'avatar et le menu de déconnexion */}
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-9 h-9 border border-blue-500/30"
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
              <span className="text-sm text-white font-semibold truncate">
                {user?.firstName || "Utilisateur"}
              </span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  Plan Gratuit
                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="px-6 py-4 bg-[#091e36]">
                <p className="text-[10px] text-gray-500 font-medium">
                    © 2026 LEXPACTE.AI <br />
                    <span className="opacity-50 tracking-tighter text-[9px]">SÉCURITÉ AES-256 ACTIVÉE</span>
                </p>
            </div>
        </aside>
    )
}