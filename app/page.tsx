'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import DragDropZone from '@/components/DragDropZone'
import { Shield, Lock, Zap, ShoppingCart, Tag } from 'lucide-react'

export default function Dashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  // Nouvel état pour le mode d'analyse
  const [analysisMode, setAnalysisMode] = useState<'buyer' | 'seller'>('buyer')

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)

    // Ici, tu pourras passer `analysisMode` à ton API ou ton composant d'analyse
    console.log(`Analyse lancée en mode : ${analysisMode}`)

    setIsProcessing(false)
  }

  return (
      <div className="flex min-h-screen bg-[#0a0e1a]">
        <Sidebar />

        <main className="flex-1 ml-64 flex flex-col">
          {/* Header */}
          <header className="bg-[#0f172a] border-b border-gray-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              Bienvenue, Maître
            </h1>
            <p className="text-gray-400 mt-1">
              Analysez vos contrats en toute sécurité avec Lexpacte.ai
            </p>
          </header>

          {/* Main Content */}
          <div className="flex-1 px-8 py-12 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Nouvelle analyse
                  </h2>
                  <p className="text-gray-400">
                    Sélectionnez votre posture puis téléchargez le contrat
                  </p>
                </div>

                {/* Sélecteur de Mode */}
                <div className="flex bg-[#0f172a] p-1 rounded-xl border border-gray-800">
                  <button
                      onClick={() => setAnalysisMode('buyer')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          analysisMode === 'buyer'
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Audit Acheteur (Buy-side)
                  </button>
                  <button
                      onClick={() => setAnalysisMode('seller')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          analysisMode === 'seller'
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <Tag className="w-4 h-4" />
                    Audit Vendeur (VDD)
                  </button>
                </div>
              </div>

              {/* Zone de Drag & Drop */}
              <DragDropZone
                  onFileUpload={handleFileUpload}
                  mode={analysisMode} // On passe le mode au composant si besoin
              />

              {/* Aide contextuelle selon le mode */}
              <div className="mt-6 p-4 rounded-lg border border-blue-900/30 bg-blue-900/10">
                <p className="text-sm text-blue-300">
                  {analysisMode === 'buyer'
                      ? "💡 Mode Acheteur : L'IA se focalisera sur les risques critiques, les clauses léonines et les leviers de négociation du prix."
                      : "💡 Mode Vendeur : L'IA identifiera les points de friction potentiels et suggérera des correctifs pour fluidifier la vente."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Footer Reassurance Banner */}
          <footer className="bg-[#0a0e1a] border-t border-gray-800 px-8 py-4 mt-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Hébergement Souverain France</span>
                </div>
                <div className="w-px h-4 bg-gray-700" />
                <div className="flex items-center gap-2 text-gray-400">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Chiffrement AES-256</span>
                </div>
                <div className="w-px h-4 bg-gray-700" />
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Mistral AI</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
  )
}