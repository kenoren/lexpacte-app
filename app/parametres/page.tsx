'use client'

import Sidebar from '@/components/Sidebar'
import { User, Lock, Bell, Database, ShieldCheck, CreditCard } from 'lucide-react'

export default function ParametresPage() {
    return (
        <div className="flex min-h-screen bg-[#0a0e1a]">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col">
                <header className="bg-[#0f172a] border-b border-gray-800 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white">Paramètres</h1>
                    <p className="text-gray-400 mt-1">Gérez votre compte et vos préférences de sécurité.</p>
                </header>

                <div className="max-w-4xl p-8 space-y-8">
                    {/* Section Profil */}
                    <section className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-white font-semibold flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-blue-500" /> Informations Personnelles
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Nom Complet</label>
                                <input type="text" defaultValue="Utilisateur Lexpacte" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase mb-2">Email</label>
                                <input type="email" defaultValue="contact@lexpacte.ai" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </section>

                    {/* Section Sécurité & Données */}
                    <section className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-5 h-5 text-green-500" /> Sécurité des Données
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                                <div>
                                    <p className="text-white text-sm font-medium">Chiffrement LocalStorage</p>
                                    <p className="text-xs text-gray-500">Les analyses sont stockées localement sur votre machine.</p>
                                </div>
                                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if(confirm("Effacer tout l'historique ?")) {
                                        localStorage.removeItem('lexpacte_history');
                                        window.location.reload();
                                    }
                                }}
                                className="text-red-400 text-sm hover:underline flex items-center gap-2"
                            >
                                <Database className="w-4 h-4" /> Effacer toutes les données d'analyse
                            </button>
                        </div>
                    </section>

                    {/* Bouton Sauvegarder */}
                    <div className="flex justify-end">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg transition-all shadow-lg shadow-blue-500/20">
                            Enregistrer les modifications
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}