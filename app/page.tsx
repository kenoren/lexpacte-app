'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import DragDropZone from '@/components/DragDropZone'
import { Shield, Lock, Zap, ShoppingCart, Tag, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<'buyer' | 'seller'>('buyer')

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    // Le traitement est géré par le useEffect interne de DragDropZone
    setIsProcessing(false)
  }

  return (
      <div className="flex min-h-screen bg-[#05070a] text-white selection:bg-blue-500/30">
        <Sidebar />

        <main className="flex-1 ml-72 flex flex-col relative overflow-hidden">
          {/* Decorative Background Grains/Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] -z-10" />

          {/* Header */}
          <header className="px-12 py-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Workspace Privé</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white italic">
                Bonjour, Maître
              </h1>
            </div>

            <div className="flex bg-[#0f1115] p-1.5 rounded-[1.25rem] border border-white/5 shadow-2xl">
              <button
                  onClick={() => setAnalysisMode('buyer')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                      analysisMode === 'buyer'
                          ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-105'
                          : 'text-gray-500 hover:text-white'
                  }`}
              >
                <ShoppingCart size={14} /> Acheteur
              </button>
              <button
                  onClick={() => setAnalysisMode('seller')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                      analysisMode === 'seller'
                          ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-105'
                          : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Tag size={14} /> Vendeur
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 px-12 pb-12 overflow-auto">
            <div className="max-w-[1600px] mx-auto">
              {/* L'interface d'audit intelligente */}
              <DragDropZone
                  onFileUpload={handleFileUpload}
                  mode={analysisMode}
              />

              {/* Info bar conditionnelle */}
              {!uploadedFile && (
                  <div className="mt-12 flex justify-center animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
                    <div className="flex items-center gap-6 px-10 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Confidentialité AES-256</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-blue-500" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Souveraineté France</span>
                      </div>
                      <div className="w-px h-4 bg-white/10" />
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Audit Mistral AI</span>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  )
}