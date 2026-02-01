'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  Upload,
  Download,
  Send,
  X,
  MessageCircle,
  Sparkles
} from 'lucide-react'
import { analyzeContract, generateCorrectedContract, chatWithContract } from '@/lib/actions'
import { ReportGenerator } from './ReportGenerator'
import ReactMarkdown from 'react-markdown'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

const AVAILABLE_CODES = [
  "Code Civil",
  "Code de Commerce",
  "Code du Travail",
  "Propriété Intellectuelle",
  "RGPD"
]

export default function DragDropZone({
                                       onFileUpload,
                                       mode,
                                     }: {
  onFileUpload: (f: File) => void
  mode: 'buyer' | 'seller'
}) {

  /* ======================= STATES ======================= */
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const [analysis, setAnalysis] = useState<string | null>(null)
  const [correctedContract, setCorrectedContract] = useState<string | null>(null)
  const [fullText, setFullText] = useState("")
  const [selectedLaws, setSelectedLaws] = useState<string[]>(["Code Civil"])

  const [currentStep, setCurrentStep] = useState(0)

  const [activeTab, setActiveTab] = useState<'analysis' | 'contract'>('analysis')

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [userInput, setUserInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Loading progression
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState("Initialisation")

  const chatEndRef = useRef<HTMLDivElement>(null)
  const extractionStarted = useRef(false)

  /* ======================= AUTO-SCROLL CHAT ======================= */
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages, isChatLoading])

  /* ======================= LOADING STEPS ======================= */
  const loadingSteps = useMemo(() => [
    "Sécurisation et chiffrement du document",
    "Extraction et lecture du contrat",
    "Analyse juridique par l’IA LexPacte",
    "Optimisation stratégique des clauses",
  ], [])

  /* ======================= SCORE ======================= */
  const dynamicScore = useMemo(() => {
    if (!analysis) return 72
    const match = analysis.match(/(\d{1,3})\s*\/\s*100/)
    return match ? parseInt(match[1]) : 72
  }, [analysis])

  /* ======================= DOWNLOAD DOCX ======================= */
  const handleDownload = async () => {
    if (!correctedContract) return

    const lines = correctedContract.split('\n')
    const doc = new Document({
      sections: [{
        children: lines.map(line => {
          if (line.startsWith('# ')) {
            return new Paragraph({
              text: line.replace('# ', ''),
              heading: HeadingLevel.HEADING_1,
            })
          }
          if (line.startsWith('## ')) {
            return new Paragraph({
              text: line.replace('## ', ''),
              heading: HeadingLevel.HEADING_2,
            })
          }
          return new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: "Times New Roman",
                size: 24,
              }),
            ],
            spacing: { line: 360 },
          })
        }),
      }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `LexPacte_Audit_${mode.toUpperCase()}.docx`)
  }

  /* ======================= CHAT (FONCTIONNEL) ======================= */
  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading) return

    const userMsg = userInput
    setUserInput("")
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsChatLoading(true)

    try {
      const response = await chatWithContract(
          userMsg,
          chatMessages,
          fullText,
          analysis || ""
      )

      if (response) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch (error) {
      console.error("Chat Error:", error)
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre une erreur technique." }])
    } finally {
      setIsChatLoading(false)
    }
  }

  /* ======================= PDF EXTRACTION ======================= */
  const extractTextClient = useCallback(async (file: File) => {
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      document.head.appendChild(script)
      await new Promise(resolve => (script.onload = resolve))
    }

    const pdfjsLib = (window as any).pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ')
    }
    return text
  }, [])

  /* ======================= PROCESS ======================= */
  const startProcess = (file: File) => {
    setUploadedFile(file)
    setIsLoading(true)
    setIsCompleted(false)
    setChatMessages([]) // Reset chat pour un nouveau contrat
    extractionStarted.current = false
    onFileUpload(file)
  }

  useEffect(() => {
    if (!isLoading || isCompleted || !uploadedFile || extractionStarted.current) return

    const run = async () => {
      extractionStarted.current = true

      setCurrentStep(0)
      await new Promise(r => setTimeout(r, 600))

      setCurrentStep(1)
      const text = await extractTextClient(uploadedFile)
      setFullText(text)

      setCurrentStep(2)
      const resAnalysis = await analyzeContract(text, mode, selectedLaws.join(", "))
      setAnalysis(resAnalysis)

      setCurrentStep(3)
      const resDoc = await generateCorrectedContract(text, resAnalysis, selectedLaws.join(", "))
      setCorrectedContract(resDoc)

      setProgress(100)
      setIsLoading(false)
      setIsCompleted(true)
    }

    run()
  }, [isLoading, uploadedFile, mode, selectedLaws, extractTextClient, isCompleted])

  /* ======================= PROGRESS SIMULATION ======================= */
  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      return
    }

    let interval: NodeJS.Timeout

    const simulate = (target: number) => {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= target) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 40)
    }

    setProgressLabel(loadingSteps[currentStep])
    simulate([20, 45, 75, 95][currentStep] ?? 95)

    return () => clearInterval(interval)
  }, [currentStep, isLoading, loadingSteps])

  /* ======================= RENDER ======================= */
  return (
      <div className="w-full">

        {/* ======================= UPLOAD ======================= */}
        {!isLoading && !isCompleted && (
            <section className="min-h-[70vh] flex items-center justify-center px-6">
              <div className="max-w-3xl w-full text-center space-y-14">

                <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-blue-500 font-black">
                Audit Juridique IA
              </span>
                  <h2 className="text-4xl lg:text-5xl font-semibold text-white">
                    Analysez un contrat en toute
                    <span className="italic text-slate-400"> sérénité</span>
                  </h2>
                  <p className="text-slate-400 max-w-xl mx-auto text-sm">
                    Détection des risques, amélioration des clauses et copilote juridique intelligent.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {AVAILABLE_CODES.map(law => (
                      <button
                          key={law}
                          onClick={() =>
                              setSelectedLaws(prev =>
                                  prev.includes(law)
                                      ? prev.filter(l => l !== law)
                                      : [...prev, law]
                              )
                          }
                          className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition
                    ${selectedLaws.includes(law)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                      >
                        {law}
                      </button>
                  ))}
                </div>

                <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault()
                      const f = e.dataTransfer.files[0]
                      if (f?.type === 'application/pdf') startProcess(f)
                    }}
                    onClick={() => document.getElementById('file-input')?.click()}
                    className={`cursor-pointer rounded-3xl p-16 border border-dashed transition
                ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/40'}
              `}
                >
                  <input
                      id="file-input"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && startProcess(e.target.files[0])}
                  />
                  <Upload size={40} className="mx-auto mb-6 text-blue-500" />
                  <p className="text-white font-bold uppercase tracking-widest text-sm">
                    Déposer un contrat PDF
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Glisser-déposer ou cliquer
                  </p>
                </div>

              </div>
            </section>
        )}

        {/* ======================= LOADING ======================= */}
        {isLoading && (
            <section className="min-h-[60vh] flex items-center justify-center px-6">
              <div className="max-w-md w-full space-y-8 text-center">

                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <Sparkles size={26} className="absolute inset-0 m-auto text-blue-500" />
                </div>

                <div>
                  <p className="text-white font-semibold text-lg">Analyse du contrat</p>
                  <p className="text-slate-400 text-sm">{progressLabel}</p>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    {progress} %
                  </p>
                </div>

              </div>
            </section>
        )}

        {/* ======================= RESULT ======================= */}
        {isCompleted && (
            <section className="max-w-6xl mx-auto px-6 space-y-14">

              <div className="bg-[#0b0e14] rounded-3xl p-10 flex flex-col lg:flex-row justify-between gap-10">
                <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Score de risque
              </span>
                  <div className="flex items-end gap-3 mt-2">
                <span className="text-6xl font-semibold text-white">
                  {dynamicScore}
                </span>
                    <span className="text-slate-500 text-xl pb-2">/100</span>
                  </div>
                </div>

                <button
                    onClick={handleDownload}
                    className="px-8 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition"
                >
                  Télécharger le contrat
                </button>
              </div>

              <div>
                <div className="flex gap-8 border-b border-white/5 mb-10">
                  <button
                      onClick={() => setActiveTab('analysis')}
                      className={`pb-4 text-sm font-bold uppercase tracking-widest
                  ${activeTab === 'analysis'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-slate-500'
                      }`}
                  >
                    Analyse
                  </button>
                  <button
                      onClick={() => setActiveTab('contract')}
                      className={`pb-4 text-sm font-bold uppercase tracking-widest
                  ${activeTab === 'contract'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-slate-500'
                      }`}
                  >
                    Contrat
                  </button>
                </div>

                {activeTab === 'analysis' && (
                    <div className="prose prose-invert max-w-none">
                      <ReportGenerator analysisMarkdown={analysis!} mode={mode} />
                    </div>
                )}

                {activeTab === 'contract' && (
                    <div className="bg-white text-black rounded-xl p-16 shadow-inner max-w-3xl mx-auto">
                      <article className="prose max-w-none font-serif">
                        <ReactMarkdown>{correctedContract || ''}</ReactMarkdown>
                      </article>
                    </div>
                )}
              </div>

            </section>
        )}

        {/* ======================= CHAT (UNIQUEMENT À LA FIN) ======================= */}
        {isCompleted && (
            <>
              <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={() => setIsChatOpen(prev => !prev)}
                    className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  {isChatOpen ? <X /> : <MessageCircle />}
                </button>
              </div>

              {isChatOpen && (
                  <div className="fixed bottom-28 right-8 z-[60] w-[360px] max-w-[90vw] h-[520px]
              bg-[#0b0e14] border border-white/10 rounded-3xl shadow-2xl
              flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">

                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  Assistant LexPacte
                </span>
                      <button onClick={() => setIsChatOpen(false)} className="p-2 text-slate-400">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm scrollbar-thin">
                      {chatMessages.length === 0 && (
                          <p className="text-center text-slate-500 text-[10px] uppercase tracking-widest mt-10">Posez vos questions sur le contrat</p>
                      )}
                      {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl
                      ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                            }`}>
                              <ReactMarkdown >{msg.content}</ReactMarkdown>
                            </div>
                          </div>
                      ))}
                      {isChatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white/5 px-4 py-2 rounded-2xl animate-pulse text-xs text-slate-500">L'IA réfléchit...</div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/5">
                      <div className="relative">
                        <input
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Posez une question juridique…"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12
                      text-white text-xs outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isChatLoading}
                            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
              )}
            </>
        )}

      </div>
  )
}