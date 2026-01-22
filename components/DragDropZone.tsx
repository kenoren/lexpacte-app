'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Upload, CheckCircle2, Download, RefreshCw, MessageSquare, Send, FileText, ShieldCheck, Zap, AlertCircle, X, Maximize2, Printer } from 'lucide-react'
import { analyzeContract, generateCorrectedContract, chatWithContract } from '@/lib/actions'
import { ReportGenerator } from './ReportGenerator'
import ReactMarkdown from 'react-markdown'

const AVAILABLE_CODES = ["Code Civil", "Code de Commerce", "Code du Travail", "Code de Propriété Intellectuelle", "RGPD"]

export default function DragDropZone({ onFileUpload, mode }: { onFileUpload: (f: File) => void, mode: 'buyer' | 'seller' }) {
  // --- ETATS ---
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false) // Pour la popup
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [correctedContract, setCorrectedContract] = useState<string | null>(null)
  const [fullText, setFullText] = useState<string>("")
  const [selectedLaws, setSelectedLaws] = useState<string[]>(["Code Civil"])
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [userInput, setUserInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const extractionStarted = useRef(false)

  const loadingSteps = useMemo(() => [
    { id: 1, message: 'Sécurisation du tunnel AES-256...' },
    { id: 2, message: 'Extraction textuelle et OCR...' },
    { id: 3, message: 'Analyse contextuelle par Lexpacte...' },
    { id: 4, message: 'Génération des correctifs juridiques...' },
  ], []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMessages])

  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading) return
    const msg = userInput
    setUserInput("")
    setChatMessages(prev => [...prev, { role: 'user', content: msg }])
    setIsChatLoading(true)
    try {
      const response = await chatWithContract(msg, chatMessages, fullText, analysis || "")
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (e) { console.error(e) } finally { setIsChatLoading(false) }
  }

  const extractTextClient = useCallback(async (file: File) => {
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script); await new Promise((resolve) => { script.onload = resolve })
    }
    const pdfjsLib = (window as any).pdfjsLib; pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    const arrayBuffer = await file.arrayBuffer(); const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const content = await page.getTextContent(); text += content.items.map((item: any) => item.str).join(' ') }
    return text
  }, [])

  const startProcess = (file: File) => {
    setUploadedFile(file); setIsLoading(true); setIsCompleted(false); setChatMessages([]); onFileUpload(file)
  }

  useEffect(() => {
    if (!isLoading || isCompleted || !uploadedFile) return
    const run = async () => {
      setCurrentStep(0); setProgress(15); await new Promise(r => setTimeout(r, 800)); setCompletedSteps([1])
      setCurrentStep(1); setProgress(35); const text = await extractTextClient(uploadedFile); setFullText(text); setCompletedSteps(prev => [...prev, 2])
      setCurrentStep(2); setProgress(65); const resAnalysis = await analyzeContract(text, mode, selectedLaws.join(", ")); setAnalysis(resAnalysis); setCompletedSteps(prev => [...prev, 3])
      setCurrentStep(3); setProgress(90); const resDoc = await generateCorrectedContract(text, resAnalysis, selectedLaws.join(", ")); setCorrectedContract(resDoc); setCompletedSteps(prev => [...prev, 4])
      setProgress(100); await new Promise(r => setTimeout(r, 500)); setIsLoading(false); setIsCompleted(true)
    }
    if (!extractionStarted.current) { extractionStarted.current = true; run() }
  }, [isLoading, uploadedFile, mode, selectedLaws, extractTextClient, isCompleted])

  return (
      <div className={`w-full transition-all duration-700 ${isCompleted ? 'max-w-7xl' : 'max-w-2xl'} mx-auto`}>

        {/* 1. INITIAL STATE */}
        {!isLoading && !isCompleted && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-blue-400" /> Référentiels d'analyse
                </h3>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CODES.map(law => (
                      <button key={law} onClick={() => setSelectedLaws(prev => prev.includes(law) ? prev.filter(l => l !== law) : [...prev, law])}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${selectedLaws.includes(law) ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                        {law}
                      </button>
                  ))}
                </div>
              </div>

              <div onDragOver={(e) => {e.preventDefault(); setIsDragging(true)}} onDragLeave={() => setIsDragging(false)}
                   onDrop={(e) => {e.preventDefault(); const f = e.dataTransfer.files[0]; if(f?.type === 'application/pdf') startProcess(f)}}
                   onClick={() => document.getElementById('file-input')?.click()}
                   className={`relative group border-2 border-dashed rounded-3xl p-20 transition-all cursor-pointer overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900/20 hover:border-blue-500/50 hover:bg-gray-800/30'}`}>
                <input id="file-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && startProcess(e.target.files[0])} />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xl font-semibold text-white">Glissez votre contrat PDF</p>
                  <p className="text-gray-500 mt-2 text-sm">Analyse sécurisée basée sur {selectedLaws.length} codes</p>
                </div>
              </div>
            </div>
        )}

        {/* 2. LOADING STATE */}
        {isLoading && (
            <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Analyse Lexpacte</h3>
                  <p className="text-blue-400 text-sm font-medium animate-pulse">Intelligence Artificielle en action...</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-blue-600">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-12">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {loadingSteps.map((step, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${i === currentStep ? 'bg-blue-600/10 border-blue-500/50 scale-105' : 'bg-transparent border-gray-800 opacity-40'}`}>
                      {completedSteps.includes(i+1) ? <ShieldCheck className="text-green-500 w-6 h-6" /> : <RefreshCw className={`w-6 h-6 ${i === currentStep ? 'text-blue-500 animate-spin' : 'text-gray-600'}`} />}
                      <span className={`font-medium ${i === currentStep ? 'text-white' : 'text-gray-500'}`}>{step.message}</span>
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* 3. COMPLETED STATE : TRIPLE COLUMN WORKSTATION */}
        {isCompleted && (
            <div className="flex flex-col xl:flex-row gap-6 h-[85vh] animate-in slide-in-from-bottom-12 duration-1000">

              {/* COLUMN 1 : ACTIONS */}
              <div className="xl:w-1/4 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                      <CheckCircle2 className="text-green-500 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Audit Terminé</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{mode === 'buyer' ? 'Poste Acheteur' : 'Poste Vendeur'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => {const b = new Blob([correctedContract || ""], {type: 'application/msword'}); const l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = "Contrat_Lexpacte_Revision.doc"; l.click();}}
                            className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 group">
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4 group-hover:bounce" /> <span>Version .doc</span>
                      </div>
                    </button>
                    <button onClick={() => {setIsCompleted(false); extractionStarted.current = false;}} className="w-full p-3 border border-gray-800 text-gray-500 hover:bg-gray-800 rounded-xl text-xs font-medium transition-all">
                      Nouvelle Analyse
                    </button>
                  </div>
                </div>

                <div className="bg-blue-900/10 border border-blue-900/20 rounded-2xl p-6">
                  <h5 className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-tighter flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Codes de référence
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedLaws.map(law => (
                        <span key={law} className="text-[10px] text-blue-200/60 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/10 italic">
                    {law}
                  </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUMN 2 : REPORT CONTENT (CENTER) */}
              <div className="xl:flex-1 bg-gray-900/30 border border-gray-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl group relative">

                {/* Overlay Agrandir au survol */}
                <button
                    onClick={() => setIsMaximized(true)}
                    className="absolute top-4 right-4 z-20 p-2.5 bg-blue-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-2xl flex items-center gap-2 text-xs font-bold active:scale-95"
                >
                  <Maximize2 className="w-4 h-4" /> Mode Lecture
                </button>

                <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Rapport d'Audit Stratégique
              </span>
                </div>

                <div
                    onClick={() => setIsMaximized(true)}
                    className="flex-1 overflow-y-auto p-8 scrollbar-thin cursor-zoom-in hover:bg-white/[0.01] transition-colors"
                >
                  <div className="pointer-events-none select-none">
                    {analysis && <ReportGenerator analysisMarkdown={analysis} mode={mode} />}
                  </div>
                </div>
              </div>

              {/* COLUMN 3 : AI COPILOT (RIGHT) */}
              <div className="xl:w-[380px] bg-[#0f172a] border border-gray-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-gray-800 bg-[#131c2f] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-tight">Expert Lexpacte AI</span>
                  </div>
                  <Zap className="w-4 h-4 text-blue-500" />
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                  {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
                        <MessageSquare className="w-10 h-10 text-gray-600 mb-4" />
                        <p className="text-[11px] text-gray-400 leading-relaxed">Une question sur une clause ? Demandez l'interprétation juridique.</p>
                      </div>
                  )}
                  {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-gray-800/80 text-gray-200 rounded-tl-none border border-gray-700'}`}>
                          <div className="prose prose-invert max-w-none text-[11px]">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                  ))}
                  {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800/40 p-3 rounded-xl flex gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-[#131c2f] border-t border-gray-800">
                  <div className="relative group">
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                           placeholder="Posez une question juridique..."
                           className="w-full bg-[#0a0e1a] border border-gray-700 text-white rounded-2xl py-4 pl-5 pr-14 text-[11px] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600" />
                    <button onClick={handleSendMessage} className="absolute right-2.5 top-2.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
        )}

        {/* 4. MODAL POPUP : LISEUSE PLEIN ECRAN */}
        {isMaximized && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-[#050810]/98 backdrop-blur-xl" onClick={() => setIsMaximized(false)} />

              <div className="relative w-full max-w-5xl h-full bg-[#0a0e1a] border border-gray-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header Liseuse */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-600/20">
                      <FileText className="text-blue-500 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg tracking-tight">Rapport d'Audit Stratégique</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{mode === 'buyer' ? 'Poste Acheteur' : 'Poste Vendeur'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => window.print()} className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-gray-700">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsMaximized(false)} className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all border border-blue-600/20">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Corps du Rapport */}
                <div className="flex-1 overflow-y-auto p-12 md:p-20 bg-[#0a0e1a] scrollbar-thin">
                  <div className="max-w-3xl mx-auto shadow-inner">
                    {analysis && <ReportGenerator analysisMarkdown={analysis} mode={mode} />}
                  </div>
                </div>

                {/* Footer Liseuse */}
                <div className="p-4 border-t border-gray-800 bg-[#0f172a] flex justify-center gap-4">
                  <button
                      onClick={() => setIsMaximized(false)}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                  >
                    Revenir à la station de travail
                  </button>
                </div>
              </div>
            </div>
        )}

      </div>
  )
}