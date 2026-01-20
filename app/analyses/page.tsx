'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Shield, FileText, Calendar, Tag, CheckCircle2, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { decryptData, encryptData } from '@/lib/crypto' // Import du moteur de chiffrement

interface SavedAnalysis {
  id: string
  nom: string
  date: string
  score: string
  type: string
}

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  // CHARGEMENT ET DÉCHIFFREMENT
  useEffect(() => {
    const encryptedData = localStorage.getItem('lexpacte_history')
    if (encryptedData) {
      const decrypted = decryptData(encryptedData)
      if (decrypted) {
        setAnalyses(decrypted)
      }
    }
    setLoading(false)
  }, [])

  const deleteAnalysis = (id: string) => {
    const updated = analyses.filter(a => a.id !== id)
    setAnalyses(updated)
    // On rechiffre après suppression
    localStorage.setItem('lexpacte_history', encryptData(updated))
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
            <h1 className="text-3xl font-bold text-white">Mes Analyses</h1>
            <p className="text-gray-400 mt-1">Historique sécurisé (Chiffrement AES-256 actif)</p>
          </header>

          <div className="flex-1 px-8 py-12 overflow-auto">
            <div className="max-w-7xl mx-auto">

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-1">Analyses totales</p>
                  <p className="text-3xl font-bold text-white">{analyses.length}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-1">Risques Critiques</p>
                  <p className="text-3xl font-bold text-red-400">
                    {analyses.filter(a => a.score === 'CRITIQUE').length}
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-1">Statut Sécurité</p>
                  <p className="text-sm font-bold text-green-400 flex items-center gap-2 mt-2">
                    <Shield className="w-4 h-4" /> Données Chiffrées
                  </p>
                </div>
              </div>

              {/* Tableau */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-500">Déchiffrement de votre coffre-fort...</div>
                ) : analyses.length === 0 ? (
                    <div className="p-20 text-center">
                      <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Aucune analyse sécurisée trouvée.</p>
                      <Link href="/dashboard" className="text-blue-400 hover:underline mt-2 inline-block">Scanner un contrat</Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                      <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50 text-gray-400 text-xs uppercase font-semibold">
                        <th className="px-6 py-4">Document</th>
                        <th className="px-6 py-4">Date d'audit</th>
                        <th className="px-6 py-4">Niveau de Risque</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                      {analyses.map((analyse) => (
                          <tr key={analyse.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-medium text-white">{analyse.nom}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(analyse.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getScoreStyle(analyse.score)}`}>
                            {analyse.score}
                          </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                              <button onClick={() => deleteAnalysis(analyse.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all">Consulter</button>
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