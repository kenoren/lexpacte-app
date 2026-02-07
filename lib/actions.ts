'use server'

import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey ?? '' })

export async function analyzeContract(
    text: string,
    mode: 'buyer' | 'seller' = 'buyer',
    lawCodes: string = 'Code Civil'
): Promise<string> {
  const prompt = `Tu es un Avocat Senior. Analyse ce contrat pour un ${mode === 'buyer' ? 'ACQUÉREUR' : 'VENDEUR'} via le ${lawCodes}.
  
  STRUCTURE DE RÉPONSE (RESPECTE STRICTEMENT LES COLONNES DU TABLEAU) :

  # 1. SYNTHÈSE DE L'ANALYSE
  - **NIVEAU DE RISQUE GLOBAL** : [Score]/100
  - **Priorités** : [Liste les points clés]

  # 2. MATRICE DE RISQUES & RECOMMANDATIONS
  | Domaine | Clause | Analyse Juridique | Risque | Recommandation |
  | :--- | :--- | :--- | :--- | :--- |
  | [Ex: Objet] | [Ex: Art 1] | [Analyse courte] | [CRITIQUE] | [Action corrective précise] |`;

  try {
    const chatResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
    })
    return chatResponse.choices?.[0]?.message?.content?.toString() ?? ''
  } catch (error) {
    return "Erreur d'analyse."
  }
}

export async function generateCorrectedContract(
    originalText: string,
    analysis: string,
    lawCodes: string
): Promise<string> {
  try {
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en Legal Drafting. Réécris le contrat en appliquant strictement ces corrections : ${analysis}. Utilise le ${lawCodes}. Retourne UNIQUEMENT le texte contractuel.`
        },
        { role: 'user', content: originalText },
      ],
      temperature: 0.1
    })
    return response.choices?.[0]?.message?.content?.toString() ?? ''
  } catch (error) {
    return "Erreur génération."
  }
}

// Le chat reste inchangé
export async function chatWithContract(userMessage: string, history: any[], contractText: string, analysis: string): Promise<string> {
  const truncatedContract = contractText.substring(0, 12000);
  try {
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: `Expert M&A. Contrat: ${truncatedContract}. Audit: ${analysis}.` },
        ...history,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2
    });
    return response.choices?.[0]?.message?.content?.toString() ?? '';
  } catch (error) { return "Erreur chat."; }
}