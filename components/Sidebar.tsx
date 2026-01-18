'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Settings,
  Scale
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0C2A4D] flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
      <img 
              src={ "/logo-sombre.webp" } 
              alt="Lexpacte.ai Logo" 
              className="h-10 w-auto"
            />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          © 2024 Lexpacte
        </p>
      </div>
    </aside>
  )
}
