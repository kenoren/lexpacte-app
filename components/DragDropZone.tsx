'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react'
import { analyzeContract } from '@/lib/actions'
import { ReportGenerator } from './ReportGenerator'
import { encryptData, decryptData } from '@/lib/crypto' // Import du moteur de chiffrement

interface DragDropZoneProps {
  onFileUpload: (file: File) => void
}

type LoadingStep = {
  id: number
  message: string
  duration: number
  completed: boolean
}

const loadingSteps: Omit<LoadingStep, 'completed'>[] = [
  { id: 1, message: 'Chiffrement du document (standard AES-256)...', duration: 1500 },
  { id: 2, message: 'Extraction sécurisée du texte...', duration: 2000 },
  { id: 3, message: 'Analyse des clauses par Lexpacte.ai...', duration: 4000 },
  { id: 4, message: 'Génération du rapport de conformité...', duration: 1500 },
]

export default function DragDropZone({ onFileUpload }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const extractionStarted = useRef(false)

  // SAUVEGARDE CHIFFRÉE DANS L'HISTORIQUE
  const saveAnalysisToHistory = useCallback((filename: string, markdown: string) => {
    try {
      const scoreMatch = markdown.match(/(?:Score|NIVEAU)\s*:\s*(CRITIQUE|ÉLEVÉ|MODÉRÉ|FAIBLE)/i)
      const score = scoreMatch ? scoreMatch[1].toUpperCase() : 'MODÉRÉ'

      const newEntry = {
        id: Date.now().toString(),
        nom: filename,
        date: new Date().toISOString(),
        score: score,
        type: "AUDIT PDF",
        content: markdown
      }

      // Récupération de l'historique chiffré existant
      const encryptedHistory = localStorage.getItem('lexpacte_history')
      let history = []

      if (encryptedHistory) {
        const decrypted = decryptData(encryptedHistory)
        history = decrypted || []
      }

      const updatedHistory = [newEntry, ...history]

      // Chiffrement du nouvel historique global
      localStorage.setItem('lexpacte_history', encryptData(updatedHistory))
    } catch (e) {
      console.error("Erreur sauvegarde historique chiffré:", e)
    }
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const startLoading = useCallback((file: File) => {
    setUploadedFile(file)
    setIsLoading(true)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsCompleted(false)
    setProgress(0)
    setAnalysis(null)
    extractionStarted.current = false
    onFileUpload(file)
  }, [onFileUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    if (pdfFile) startLoading(pdfFile)
  }, [startLoading])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') startLoading(file)
    }
  }, [startLoading])

  const handleRemove = useCallback(() => {
    setUploadedFile(null)
    setIsLoading(false)
    setIsCompleted(false)
    setAnalysis(null)
    extractionStarted.current = false
  }, [])

  const extractTextClient = useCallback(async (file: File) => {
    try {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        document.head.appendChild(script)
        await new Promise((resolve) => { script.onload = resolve })
      }
      const pdfjsLib = (window as any).pdfjsLib
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item: any) => item.str).join(' ')
      }
      return text
    } catch (e: any) {
      throw e
    }
  }, [])

  useEffect(() => {
    if (!isLoading || isCompleted || !uploadedFile) return

    let stepIndex = 0
    let timeoutId: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    const processNextStep = async () => {
      if (stepIndex >= loadingSteps.length) {
        setIsCompleted(true)
        setIsLoading(false)
        setProgress(100)
        return
      }

      const step = loadingSteps[stepIndex]
      setCurrentStep(stepIndex)

      const stepProgress = 100 / loadingSteps.length
      const startProgress = stepIndex * stepProgress
      let currentProgress = startProgress

      progressInterval = setInterval(() => {
        currentProgress += (stepProgress / (step.duration / 50))
        if (currentProgress >= startProgress + stepProgress) {
          currentProgress = startProgress + stepProgress
          clearInterval(progressInterval)
        }
        setProgress(currentProgress)
      }, 50)

      if (stepIndex === 1 && !extractionStarted.current) {
        extractionStarted.current = true
        try {
          const text = await extractTextClient(uploadedFile)
          const analysisResult = await analyzeContract(text)

          setAnalysis(analysisResult)
          saveAnalysisToHistory(uploadedFile.name, analysisResult)

          setCompletedSteps(prev => [...prev, step.id])
          stepIndex++
          clearInterval(progressInterval)
          processNextStep()
        } catch (error) {
          console.error(error)
          setCompletedSteps(prev => [...prev, step.id])
          stepIndex++
          processNextStep()
        }
      } else {
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, step.id])
          stepIndex++
          clearInterval(progressInterval)
          processNextStep()
        }, step.duration)
      }
    }

    processNextStep()
    return () => {
      clearTimeout(timeoutId)
      clearInterval(progressInterval)
    }
  }, [isLoading, isCompleted, uploadedFile, extractTextClient, saveAnalysisToHistory])

  return (
      <div className="w-full max-w-2xl mx-auto">
        {!isLoading && !isCompleted && (
            <div
                className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'}`}
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
              <input id="file-input" type="file" accept="application/pdf" className="hidden" onChange={handleFileInput} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-800 rounded-full"><Upload className="w-12 h-12 text-gray-400" /></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Glissez votre contrat PDF ici</h3>
                  <p className="text-sm text-gray-400">Analyse juridique instantanée par IA</p>
                </div>
              </div>
            </div>
        )}

        {isLoading && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
              <div className="mb-8">
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-center text-xs text-gray-500 uppercase tracking-widest">Analyse en cours : {Math.round(progress)}%</p>
              </div>
              <div className="space-y-3">
                {loadingSteps.map((step, index) => {
                  const isActive = index === currentStep
                  const isStepDone = completedSteps.includes(step.id)
                  return (
                      <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isActive ? 'bg-blue-600/10 border-blue-600/30' : isStepDone ? 'bg-green-600/5 border-green-600/20' : 'border-transparent opacity-40'}`}>
                        {isStepDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : isActive ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" /> : <div className="w-4 h-4 rounded-full border border-gray-600" />}
                        <span className={`text-sm ${isActive ? 'text-blue-400 font-medium' : isStepDone ? 'text-green-400' : 'text-gray-500'}`}>{step.message}</span>
                      </div>
                  )
                })}
              </div>
            </div>
        )}

        {isCompleted && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-500/20 p-3 rounded-full"><CheckCircle2 className="w-10 h-10 text-green-400" /></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analyse terminée</h3>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                  <FileText className="w-4 h-4" />
                  <span>{uploadedFile?.name}</span>
                </div>
                {analysis ? <ReportGenerator analysisMarkdown={analysis} /> : <p className="text-red-400">Erreur lors de la récupération de l'analyse.</p>}
                <button onClick={handleRemove} className="mt-8 text-xs text-gray-500 hover:text-white underline transition-colors">Analyser un autre document</button>
              </div>
            </div>
        )}
      </div>
  )
}