'use client'

import Sidebar from '@/components/Sidebar'
import { Shield, FileText, Calendar, Tag, CheckCircle2, Eye } from 'lucide-react'

// Données fictives pour les analyses
const analysesData = [
  {
    id: 1,
    nom: 'Contrat de travail CDI - TechCorp',
    date: '2024-01-15',
    type: 'CDI',
    statut: 'Protégé'
  },
  {
    id: 2,
    nom: 'Accord de confidentialité - StartupXYZ',
    date: '2024-01-10',
    type: 'NDA',
    statut: 'Protégé'
  },
  {
    id: 3,
    nom: 'Contrat de prestation de service - Client ABC',
    date: '2024-01-05',
    type: 'Prestation',
    statut: 'Protégé'
  }
]

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Fonction pour obtenir la couleur du badge selon le type
const getTypeColor = (type: string) => {
  switch (type) {
    case 'CDI':
      return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
    case 'NDA':
      return 'bg-purple-600/20 text-purple-400 border-purple-600/30'
    case 'Prestation':
      return 'bg-green-600/20 text-green-400 border-green-600/30'
    default:
      return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
  }
}

export default function AnalysesPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0e1a]">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-[#0f172a] border-b border-gray-800 px-8 py-6">
          <h1 className="text-3xl font-bold text-white">
            Mes Analyses
          </h1>
          <p className="text-gray-400 mt-1">
            Gérez et consultez toutes vos analyses de contrats
          </p>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-8 py-12 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total analyses</p>
                    <p className="text-3xl font-bold text-white">{analysesData.length}</p>
                  </div>
                  <div className="p-3 bg-blue-600/20 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Documents protégés</p>
                    <p className="text-3xl font-bold text-white">{analysesData.length}</p>
                  </div>
                  <div className="p-3 bg-green-600/20 rounded-lg">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Ce mois</p>
                    <p className="text-3xl font-bold text-white">{analysesData.length}</p>
                  </div>
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des analyses */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Liste des analyses</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Nom du contrat
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Type
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Statut
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {analysesData.map((analyse, index) => (
                      <tr 
                        key={analyse.id} 
                        className="hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {analyse.nom}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: #{analyse.id.toString().padStart(4, '0')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-300">
                            {formatDate(analyse.date)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(analyse.type)}`}>
                            {analyse.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400 font-medium">
                              {analyse.statut}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            onClick={() => {
                              // TODO: Naviguer vers la page de détail de l'analyse
                              console.log('Voir analyse:', analyse.id)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Consulter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer du tableau */}
              <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Affichage de {analysesData.length} analyse{analysesData.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      disabled
                    >
                      Précédent
                    </button>
                    <span className="text-sm text-gray-400">1</span>
                    <button
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      disabled
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
