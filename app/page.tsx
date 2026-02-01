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
    setIsProcessing(false)
  }

  return (
      <div className="flex min-h-screen bg-[#020408] text-slate-200 selection:bg-blue-500/30">
        <Sidebar />

        {/* Main Content - On utilise "ml-72" pour le desktop et on gère le responsive */}
        <main className="flex-1 lg:ml-72 flex flex-col relative min-h-screen">

          {/* Background Gradients (Subtils) */}
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -z-10" />

          {/* Header - Plus aéré et raffiné */}
          <header className="px-6 lg:px-12 py-8 lg:py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">LexPacte Intelligence</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-tight">
                Bonjour, <span className="text-slate-400 font-light italic">Maître</span>
              </h1>
            </div>

            {/* Mode Switcher - Design Premium pill */}
            <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
              <button
                  onClick={() => setAnalysisMode('buyer')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${
                      analysisMode === 'buyer'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-500 hover:text-slate-200'
                  }`}
              >
                <ShoppingCart size={14} /> Acheteur
              </button>
              <button
                  onClick={() => setAnalysisMode('seller')}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${
                      analysisMode === 'seller'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-500 hover:text-slate-200'
                  }`}
              >
                <Tag size={14} /> Vendeur
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 px-6 lg:px-12 pb-12 overflow-x-hidden">
            <div className="max-w-[1500px] mx-auto">
              <DragDropZone
                  onFileUpload={handleFileUpload}
                  mode={analysisMode}
              />

              {!uploadedFile && (
                  <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue-500/60" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sécurité AES-256</span>
                    </div>
                    <div className="w-px h-4 bg-white/5 hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-blue-500/60" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Conformité RGPD</span>
                    </div>
                    <div className="w-px h-4 bg-white/5 hidden sm:block" />
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-blue-500/60" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">IA Souveraine</span>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  )
}