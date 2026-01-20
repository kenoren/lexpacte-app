'use client'

import Sidebar from '@/components/Sidebar'
import { BookOpen, Search, Copy, Download, FolderPlus, Scale } from 'lucide-react'

const clausesRepo = [
    { id: 1, titre: "Clause de Force Majeure", categorie: "Standard", description: "Protection en cas d'événements imprévisibles (guerre, pandémie)." },
    { id: 2, titre: "Non-Concurrence (M&A)", categorie: "Sécurité", description: "Interdiction de contracter avec les éditeurs après résiliation." },
    { id: 3, titre: "RGPD & Données", categorie: "Conformité", description: "Traitement des données personnelles selon les normes UE." }
]

export default function BibliothequePage() {
    return (
        <div className="flex min-h-screen bg-[#0a0e1a]">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col">
                <header className="bg-[#0f172a] border-b border-gray-800 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="text-blue-500" /> Bibliothèque Juridique
                    </h1>
                    <p className="text-gray-400 mt-1">Accédez à vos modèles de clauses et référentiels légaux.</p>
                </header>

                <div className="p-8">
                    <div className="flex gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input type="text" placeholder="Rechercher une clause ou un modèle..." className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-blue-500 outline-none" />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                            <FolderPlus className="w-4 h-4" /> Ajouter
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clausesRepo.map((item) => (
                            <div key={item.id} className="bg-gray-900/50 border border-gray-700 p-6 rounded-xl hover:border-blue-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-blue-600/30">
                    {item.categorie}
                  </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 bg-gray-800 rounded hover:text-blue-400"><Copy className="w-4 h-4" /></button>
                                        <button className="p-1.5 bg-gray-800 rounded hover:text-green-400"><Download className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h3 className="text-white font-semibold mb-2">{item.titre}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-500">
                                    <Scale className="w-3 h-3" /> Basé sur le Code Civil (Art. 1218)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}