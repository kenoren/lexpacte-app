'use server'

/**
 * Server Actions pour l'extraction de texte PDF
 * 
 * Ces actions sont exécutées exclusivement côté serveur pour garantir
 * la souveraineté et la confidentialité des données sensibles.
 */

import * as pdfjs from 'pdfjs-dist'

// Configuration du worker pour pdfjs
// Le worker est chargé depuis un CDN pour une meilleure compatibilité avec Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

/**
 * Extrait le texte d'un fichier PDF
 * 
 * IMPORTANT - CONFIDENTIALITÉ :
 * Le document PDF est traité ENTIÈREMENT EN MÉMOIRE (RAM) et n'est
 * JAMAIS stocké sur un disque non chiffré. Ce processus garantit :
 * 
 * 1. Traitement sécurisé : Le fichier reste uniquement en RAM pendant
 *    toute la durée de l'extraction, puis est automatiquement libéré
 *    par le garbage collector de Node.js.
 * 
 * 2. Aucun stockage temporaire : Aucun fichier temporaire n'est créé
 *    sur le système de fichiers, éliminant les risques de fuite de
 *    données sensibles.
 * 
 * 3. Confidentialité maximale : Respect de la confidentialité promise
 *    aux avocats - les documents ne sont jamais écrits en clair sur
 *    un support de stockage non chiffré.
 * 
 * @param formData - FormData contenant le fichier PDF (clé: 'file')
 * @returns Texte extrait du PDF ou une erreur
 */
export async function extractText(formData: FormData): Promise<{
  success: boolean
  text?: string
  error?: string
}> {
  try {
    // Récupération du fichier depuis FormData
    const file = formData.get('file') as File
    
    if (!file) {
      return {
        success: false,
        error: 'Aucun fichier fourni'
      }
    }

    // Validation du type de fichier
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Le fichier doit être un PDF'
      }
    }

    // Conversion du File en ArrayBuffer
    // Ce processus se fait entièrement en mémoire - aucune écriture disque
    const arrayBuffer = await file.arrayBuffer()

    // Chargement du document PDF
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    let fullText = ''

    // Extraction page par page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    // Log de confirmation côté serveur (sans exposer le contenu complet)
    console.log('Extraction réussie sur', pdf.numPages, 'pages')

    // Le texte extrait est retourné
    // Les buffers sont automatiquement libérés de la mémoire après cette fonction
    return {
      success: true,
      text: fullText
    }
  } catch (error) {
    console.error('Erreur PDF:', error)
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : 'Impossible de lire le PDF'
    }
  }
}

// Alias pour compatibilité - extractTextFromPDF garde le nom original
export async function extractTextFromPDF(formData: FormData): Promise<{
  success: boolean
  text?: string
  error?: string
}> {
  return extractText(formData)
}
