'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  Upload, CheckCircle2, Download, MessageSquare, Send,
  ShieldCheck, X, Maximize2, FileEdit, Sparkles,
  ChevronLeft, ChevronRight, FileSearch, Scale
} from 'lucide-react'
import { analyzeContract, generateCorrectedContract, chatWithContract } from '@/lib/actions'
import { ReportGenerator } from './ReportGenerator'
import ReactMarkdown from 'react-markdown'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

const AVAILABLE_CODES = ["Code Civil", "Code de Commerce", "Code du Travail", "Propriété Intellectuelle", "RGPD"]

export default function DragDropZone({ onFileUpload, mode }: { onFileUpload: (f: File) => void, mode: 'buyer' | 'seller' }) {
  // --- ÉTATS ---
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showReport, setShowReport] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
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
    { id: 1, message: 'Sécurisation de la session' },
    { id: 2, message: 'Analyse structurelle' },
    { id: 3, message: 'Audit des clauses' },
    { id: 4, message: 'Optimisation finale' },
  ], []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMessages])

  // --- LOGIQUE EXPORT DOCX ---
  const handleDownload = async () => {
    if (!correctedContract) return;
    const lines = correctedContract.split('\n');
    const doc = new Document({
      sections: [{
        properties: {},
        children: lines.map(line => {
          if (line.startsWith('# ')) {
            return new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
          }
          if (line.startsWith('## ')) {
            return new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
          }
          return new Paragraph({
            children: [new TextRun({ text: line, font: "Times New Roman", size: 24 })],
            spacing: { line: 360 },
          });
        }),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Lexpacte_Audit_${mode.toUpperCase()}.docx`);
  };

  // --- LOGIQUE CHAT ---
  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading) return
    const msg = userInput;
    setUserInput("");
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsChatLoading(true)
    try {
      const response = await chatWithContract(`Context: ${selectedLaws.join(", ")}\nQ: ${msg}`, chatMessages, fullText, analysis || "")
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (e) { console.error(e) } finally { setIsChatLoading(false) }
  }

  // --- EXTRACTION PDF (CLIENT-SIDE) ---
  const extractTextClient = useCallback(async (file: File) => {
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script);
      await new Promise((resolve) => { script.onload = resolve })
    }
    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ')
    }
    return text
  }, [])

  const startProcess = (file: File) => {
    setUploadedFile(file); setIsLoading(true); setIsCompleted(false); setChatMessages([]); extractionStarted.current = false; onFileUpload(file)
  }

  // --- WORKFLOW IA ---
  useEffect(() => {
    if (!isLoading || isCompleted || !uploadedFile || extractionStarted.current) return
    const run = async () => {
      extractionStarted.current = true;
      setCurrentStep(0); await new Promise(r => setTimeout(r, 600)); setCompletedSteps([1])
      setCurrentStep(1); const text = await extractTextClient(uploadedFile); setFullText(text); setCompletedSteps(prev => [...prev, 2])
      setCurrentStep(2); const resAnalysis = await analyzeContract(text, mode, selectedLaws.join(", ")); setAnalysis(resAnalysis); setCompletedSteps(prev => [...prev, 3])
      setCurrentStep(3); const resDoc = await generateCorrectedContract(text, resAnalysis, selectedLaws.join(", ")); setCorrectedContract(resDoc); setCompletedSteps(prev => [...prev, 4])
      setIsLoading(false); setIsCompleted(true)
    }
    run()
  }, [isLoading, uploadedFile, mode, selectedLaws, extractTextClient, isCompleted])

  return (
      <div className="w-full h-full text-slate-200">
        {/* 1. SELECTION & UPLOAD */}
        {!isLoading && !isCompleted && (
            <div className="max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-[#0f111a] border border-white/5 rounded-[2.5rem] p-12 shadow-2xl">
                <div className="text-center space-y-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <Scale size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Référentiels Juridiques</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Configuration de l'Audit</h2>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {AVAILABLE_CODES.map(law => (
                          <button key={law} onClick={() => setSelectedLaws(prev => prev.includes(law) ? prev.filter(l => l !== law) : [...prev, law])}
                                  className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                                      selectedLaws.includes(law) ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20 scale-105' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                  }`}>
                            {law}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                       onDragLeave={() => setIsDragging(false)}
                       onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') startProcess(f) }}
                       onClick={() => document.getElementById('file-input')?.click()}
                       className={`border-2 border-dashed rounded-[2rem] p-20 transition-all duration-500 cursor-pointer ${
                           isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/5'
                       }`}>
                    <input id="file-input" type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && startProcess(e.target.files[0])} />
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/40 group-hover:scale-110 transition-transform">
                        <Upload className="text-white w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-white">Glissez le contrat PDF</p>
                        <p className="text-sm text-slate-500 italic">Analyse immédiate par IA souveraine</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* 2. LOADING SCREEN */}
        {isLoading && (
            <div className="max-w-xl mx-auto mt-24 text-center space-y-12 animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <FileSearch className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">Analyse Lexpacte</h2>
                <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                  {loadingSteps.map((s, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${i === currentStep ? 'bg-blue-600/10 border-blue-500/30 translate-x-2' : 'bg-white/5 border-white/5 opacity-30'}`}>
                        {completedSteps.includes(i + 1) ? <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{s.message}</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}

        {/* 3. WORKSTATION (FINAL) */}
        {isCompleted && (
            <div className="flex h-[88vh] gap-6 animate-in zoom-in-95 duration-700">
              {/* RAPPORT D'AUDIT */}
              <div className={`${showReport ? 'w-[420px]' : 'w-0'} transition-all duration-500 flex flex-col bg-[#0f111a] border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl`}>
                {showReport && (
                    <div className="p-8 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="text-blue-500 w-5 h-5" />
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Audit Stratégique</h4>
                        </div>
                        <button onClick={() => setShowReport(false)} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-colors"><ChevronLeft size={20} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        {analysis && <ReportGenerator analysisMarkdown={analysis} mode={mode} />}
                      </div>
                    </div>
                )}
              </div>

              {!showReport && (
                  <button onClick={() => setShowReport(true)} className="flex items-center justify-center w-14 h-full bg-[#0f111a] border border-white/5 rounded-[1.5rem] hover:bg-blue-600/10 group transition-all">
                    <ChevronRight size={24} className="text-slate-500 group-hover:text-blue-500" />
                  </button>
              )}

              {/* DOCUMENT RÉVISÉ */}
              <div className="flex-1 flex flex-col bg-[#0f111a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                      <FileEdit className="text-blue-500 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Document de Sortie</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-tighter">Révision augmentée • Mistral Large</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsMaximized(true)} className="p-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all"><Maximize2 size={18}/></button>
                    <button onClick={handleDownload}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black text-[10px] transition-all uppercase tracking-[0.15em] shadow-xl active:scale-95">
                      <Download size={18} /> Exporter .DOCX
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 bg-black/40 scrollbar-thin">
                  <div className="mx-auto w-full max-w-4xl bg-[#0d1117] border border-white/5 p-20 rounded-2xl shadow-2xl min-h-full">
                    <article className="prose prose-invert prose-slate max-w-none font-serif text-[16px] leading-[1.8] text-slate-300 selection:bg-blue-500/30">
                      <ReactMarkdown>{correctedContract || ""}</ReactMarkdown>
                    </article>
                  </div>
                </div>
              </div>

              {/* CHAT IA */}
              <div className="w-[450px] flex flex-col bg-[#0f111a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-7 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">IA Stratégique</span>
                  </div>
                  <Sparkles size={18} className="text-blue-400" />
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin bg-black/10">
                  {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
                        <MessageSquare size={50} className="mb-6 text-blue-500" />
                        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed text-white">Posez vos questions sur les risques ou demandez des modifications spécifiques.</p>
                      </div>
                  )}
                  {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[90%] p-6 rounded-[1.8rem] text-[13px] leading-relaxed shadow-lg ${
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                                : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-sm'
                        }`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                  ))}
                  {isChatLoading && <div className="flex gap-2 p-4"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" /><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" /></div>}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-8 bg-white/[0.02] border-t border-white/5">
                  <div className="relative group">
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                           placeholder="Interroger le contrat..."
                           className="w-full bg-black/60 border border-white/10 text-white rounded-[1.5rem] py-5 pl-7 pr-16 text-sm focus:ring-2 focus:ring-blue-500/40 outline-none transition-all placeholder:text-slate-600 shadow-inner" />
                    <button onClick={handleSendMessage} className="absolute right-2.5 top-2.5 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-900/40">
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* FULLSCREEN MODAL */}
        {isMaximized && (
            <div className="fixed inset-0 z-[100] bg-[#05070a]/98 backdrop-blur-2xl p-12 flex flex-col animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-12 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Lecture Focus</h3>
                </div>
                <button onClick={() => setIsMaximized(false)} className="p-4 bg-white/5 hover:bg-red-500/20 text-white rounded-2xl transition-all"><X size={28} /></button>
              </div>
              <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full bg-[#0d1117] p-24 rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <article className="prose prose-invert prose-2xl font-serif text-slate-200 leading-relaxed">
                  <ReactMarkdown>{correctedContract || ""}</ReactMarkdown>
                </article>
              </div>
            </div>
        )}
      </div>
  )
}