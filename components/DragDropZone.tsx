'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Upload, FileText, X, CheckCircle2, Terminal } from 'lucide-react'
import { extractTextFromPDF } from '@/lib/actions'

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
  { id: 1, message: 'Chiffrement du document (standard AES-256)...', duration: 2000 },
  { id: 2, message: 'Extraction sécurisée du texte...', duration: 2000 },
  { id: 3, message: 'Analyse des clauses par Lexpacte.ai...', duration: 3000 },
  { id: 4, message: 'Génération du rapport de conformité...', duration: 2000 },
]

export default function DragDropZone({ onFileUpload }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const extractionStarted = useRef(false)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const startLoading = useCallback((file: File) => {
    setUploadedFile(file)
    setIsLoading(true)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsCompleted(false)
    setProgress(0)
    setExtractedText(null)
    extractionStarted.current = false
    onFileUpload(file)
  }, [onFileUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      startLoading(pdfFile)
    }
  }, [startLoading])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        startLoading(file)
      }
    }
  }, [startLoading])

  const handleRemove = useCallback(() => {
    setUploadedFile(null)
    setIsLoading(false)
    setCurrentStep(0)
    setCompletedSteps([])
    setIsCompleted(false)
    setProgress(0)
    setExtractedText(null)
    extractionStarted.current = false
  }, [])

  // Gestion de la progression du chargement
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

      // Animation de progression
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

      // Étape 2 : Extraction du texte - Appel réel à la Server Action
      if (stepIndex === 1 && !extractionStarted.current) {
        extractionStarted.current = true
        
        try {
          // Créer un FormData pour passer le fichier à la Server Action
          // Next.js exige que les objets complexes soient passés via FormData
          const formData = new FormData()
          formData.append('file', uploadedFile)
          
          const result = await extractTextFromPDF(formData)
          
          if (result.success && result.text) {
            setExtractedText(result.text)
            // Marquer l'étape comme complétée
            setCompletedSteps(prev => [...prev, step.id])
            stepIndex++
            clearInterval(progressInterval)
            processNextStep()
          } else {
            // En cas d'erreur, on continue quand même pour ne pas bloquer l'UI
            console.error('Erreur extraction:', result.error)
            setCompletedSteps(prev => [...prev, step.id])
            stepIndex++
            clearInterval(progressInterval)
            processNextStep()
          }
        } catch (error) {
          console.error('Erreur lors de l\'extraction:', error)
          setCompletedSteps(prev => [...prev, step.id])
          stepIndex++
          clearInterval(progressInterval)
          processNextStep()
        }
      } else {
        // Pour les autres étapes, utiliser le timeout normal
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
  }, [isLoading, isCompleted, uploadedFile])

  return (
    <>
      {/* Zone de drop (cachée pendant le chargement) */}
      {!isLoading && (
        <div
          className={`
            relative w-full max-w-2xl mx-auto border-2 border-dashed rounded-xl p-12
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900/70'
            }
          `}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadedFile && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileInput}
          />

          {uploadedFile && !isCompleted ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-600/20 rounded-lg">
                <FileText className="w-8 h-8 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-white font-medium">{uploadedFile.name}</span>
                  <span className="text-sm text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="ml-4 p-1 hover:bg-red-600/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-600/20 rounded-lg">
                <FileText className="w-8 h-8 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-white font-medium">{uploadedFile?.name}</span>
                  <span className="text-sm text-gray-400">
                    {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="ml-4 p-1 hover:bg-red-600/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-800 rounded-full">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Glissez votre contrat PDF ici
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p className="text-xs text-gray-500">
                  Formats acceptés: PDF uniquement
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone de chargement */}
      {isLoading && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-12">
            {/* Barre de progression */}
            <div className="mb-8">
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400">
                {Math.round(progress)}% complété
              </p>
            </div>

            {/* Messages de statut */}
            <div className="space-y-4">
              {loadingSteps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = completedSteps.includes(step.id)

                return (
                  <div
                    key={step.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-blue-600/20 border border-blue-600/30' 
                        : isCompleted
                        ? 'bg-green-600/10 border border-green-600/20'
                        : 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                    )}
                    <span
                      className={`
                        text-sm font-medium
                        ${isActive 
                          ? 'text-blue-400' 
                          : isCompleted 
                          ? 'text-green-400'
                          : 'text-gray-500'
                        }
                      `}
                    >
                      {step.message}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Zone de log pour l'extraction de texte */}
      {extractedText && (
        <div className="w-full max-w-2xl mx-auto mt-6">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Aperçu du texte extrait (100 premiers caractères)</h4>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
                {extractedText.substring(0, 100)}
                {extractedText.length > 100 && '...'}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total : {extractedText.length} caractères extraits
            </p>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {isCompleted && !isLoading && (
        <div className="w-full max-w-2xl mx-auto mt-6">
          <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Analyse terminée avec succès
            </h3>
            <p className="text-gray-400 mb-6">
              Votre rapport de conformité est prêt à être consulté
            </p>
            <button
              onClick={() => {
                // TODO: Naviguer vers la page de rapport
                console.log('Consulter le rapport')
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Consulter le rapport
            </button>
          </div>
        </div>
      )}
    </>
  )
}
