'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import DragDropZone from '@/components/DragDropZone'
import { Shield, Lock, Zap } from 'lucide-react'

export default function Dashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    
    // Le composant DragDropZone gère désormais l'extraction et l'analyse
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
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Nouvelle analyse
              </h2>
              <p className="text-gray-400">
                Téléchargez un contrat PDF pour commencer l'analyse automatisée
              </p>
            </div>

            <DragDropZone onFileUpload={handleFileUpload} />
          </div>
        </div>

        {/* Footer Reassurance Banner */}
        <footer className="bg-navy-dark border-t border-gray-800 px-8 py-4">
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
