'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Shield, FileText, Trash2, Loader2, Cloud } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

// Interface alignée sur ta table Supabase
interface SavedAnalysis {
  id: string
  nom: string
  created_at: string
  score: string
  content: string // Ce contenu reste chiffré en AES-256 dans la DB
}

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()

  // CHARGEMENT DEPUIS SUPABASE
  useEffect(() => {
    async function fetchAnalyses() {
      if (!userId) return

      try {
        const { data, error } = await supabase
            .from('analyse')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setAnalyses(data)
      } catch (e) {
        console.error("Erreur lors de la récupération des données:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [userId])

  // SUPPRESSION DANS SUPABASE
  const deleteAnalysis = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet audit de votre coffre-fort ?")) return

    try {
      const { error } = await supabase
          .from('analyse')
          .delete()
          .eq('id', id)

      if (error) throw error

      // Mise à jour de l'interface locale
      setAnalyses(analyses.filter(a => a.id !== id))
    } catch (e) {
      alert("Erreur lors de la suppression")
    }
  }

  const getScoreStyle = (score: string) => {
    switch (score?.toUpperCase()) {
      case 'CRITIQUE': return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'ÉLEVÉ': return 'bg-orange-600/20 text-orange-400 border-orange-600/30'
      case 'MODÉRÉ': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      default: return 'bg-green-600/20 text-green-400 border-green-600/30'
    }
  }

  return (
      <div className="flex min-h-screen bg-[#0a0e1a]">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col">
          <header className="bg-[#0f172a] border-b border-gray-800 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white font-sans tracking-tight">Mes Analyses</h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  Synchronisation Cloud sécurisée active
                </p>
              </div>
              <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full">
              <span className="text-blue-400 text-xs font-bold flex items-center gap-2">
                <Shield className="w-4 h-4" /> AES-256 BIT ENCRYPTION
              </span>
              </div>
            </div>
          </header>

          <div className="flex-1 px-8 py-12 overflow-auto font-sans">
            <div className="max-w-7xl mx-auto">

              {/* Stats Dynamiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Analyses Cloud</p>
                  <p className="text-3xl font-bold text-white">{analyses.length}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Alertes Critiques</p>
                  <p className="text-3xl font-bold text-red-500">
                    {analyses.filter(a => a.score === 'CRITIQUE').length}
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Statut Confidentialité</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-green-400 uppercase">Protégé</span>
                  </div>
                </div>
              </div>

              {/* Tableau des Analyses */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden backdrop-blur-sm">
                {loading ? (
                    <div className="p-32 text-center">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                      <p className="text-gray-400 animate-pulse">Accès au coffre-fort sécurisé...</p>
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="p-32 text-center">
                      <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-white text-xl font-semibold mb-2">Votre historique est vide</p>
                      <p className="text-gray-500 mb-8">Commencez par analyser votre premier contrat pour le sécuriser ici.</p>
                      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                        Scanner un contrat
                      </Link>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                      <tr className="border-b border-gray-800 bg-gray-800/30 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                        <th className="px-8 py-5">Nom du document</th>
                        <th className="px-8 py-5">Date d'audit</th>
                        <th className="px-8 py-5">Score de Risque</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                      {analyses.map((analyse) => (
                          <tr key={analyse.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                  <FileText className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{analyse.nom}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                              {new Date(analyse.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-black border tracking-tighter ${getScoreStyle(analyse.score)}`}>
                            {analyse.score}
                          </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteAnalysis(analyse.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="bg-white text-black hover:bg-blue-500 hover:text-white px-5 py-2 rounded-lg text-xs font-black transition-all">
                                  CONSULTER
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
  )
}