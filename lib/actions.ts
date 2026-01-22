'use server'

import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey ?? '' })

/**
 * Analyse le contrat avec multi-référentiel juridique
 */
export async function analyzeContract(
    text: string,
    mode: 'buyer' | 'seller' = 'buyer',
    lawCodes: string = 'Code Civil'
): Promise<string> {
  if (!text || text.trim().length === 0) throw new Error('Aucun texte fourni.')
  if (!apiKey) throw new Error("Clé API Mistral manquante.")

  const promptBuyer = `Rôle : Avocat Associé Senior M&A (Barreau de Paris).
Mission : Audit juridique SPA pour l'ACQUÉREUR en se fondant impérativement sur : ${lawCodes}.

STRUCTURE DE RÉPONSE OBLIGATOIRE :

### 1. SYNTHÈSE EXÉCUTIVE
- **Score de Risque Global** : [FAIBLE / MODÉRÉ / CRITIQUE]
- **Priorités de Négociation** :
- [Alerte 1]
- [Alerte 2]

### 2. ANALYSE DÉTAILLÉE
| Catégorie | Clause | Analyse & Fondement (${lawCodes}) | Risque | Action Corrective (Rédactionnelle) |

CONSIGNES :
1. Citations : Utiliser les articles précis des codes sélectionnés : ${lawCodes}.
2. Jurisprudence : Mentionner la conformité aux critères de la Cour de cassation.
3. Ready-to-Paste : Proposer des clauses entre guillemets ("...") prêtes à l'emploi.
4. Simplicité : Pas de gras (**) à l'intérieur des cellules du tableau.`

  const promptSeller = `Rôle : Expert en Vendor Due Diligence (VDD) - Cabinet M&A.
Mission : Préparer le VENDEUR en identifiant les leviers de l'Acheteur basés sur : ${lawCodes}.

STRUCTURE DE RÉPONSE OBLIGATOIRE :

### 1. SYNTHÈSE DE PRÉPARATION (VDD)
- **Indice de Fragilité du Prix** : [SCORE SUR 100]
- **Arguments d'Attaque de l'Acheteur** :
- [Point d'attaque 1]

### 2. PLAN D'ACTION PRÉ-CESSION
| Catégorie | Clause Sensible | Argumentation de l'Acheteur | Impact sur le Prix | Remède Stratégique Vendeur |

CONSIGNES :
1. Posture : Anticipez les critiques basées sur ${lawCodes}.
2. Remède : Proposez des modifications pour "nettoyer" le contrat avant la Data Room.`

  const selectedPrompt = mode === 'buyer' ? promptBuyer : promptSeller

  const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: selectedPrompt },
      { role: 'user', content: 'Voici le texte du contrat : \n\n' + text },
    ],
    temperature: 0.1,
  })

  return chatResponse.choices?.[0]?.message?.content?.toString() ?? ''
}

/**
 * Génère le nouveau contrat corrigé
 */
export async function generateCorrectedContract(
    originalText: string,
    analysis: string,
    lawCodes: string
): Promise<string> {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'system',
        content: `Tu es un avocat senior. Réécris intégralement le contrat original en appliquant strictement les "Actions Correctives" de ce rapport d'audit : ${analysis}. 
        Référence juridique : ${lawCodes}. 
        Garde la structure et le formalisme juridique. Retourne UNIQUEMENT le texte du nouveau contrat.`
      },
      { role: 'user', content: originalText },
    ],
    temperature: 0.2
  })
  return response.choices?.[0]?.message?.content?.toString() ?? ''
}

export async function chatWithAI(
    messages: { role: 'user' | 'assistant' | 'system', content: string }[]
): Promise<string> {
  const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: messages,
    temperature: 0.2, // Un peu plus haut pour la discussion
  })
  return chatResponse.choices?.[0]?.message?.content?.toString() ?? ''
}

export async function chatWithContract(
    userMessage: string,
    history: { role: 'user' | 'assistant', content: string }[],
    contractText: string,
    analysis: string
): Promise<string> {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert juridique M&A. Tu as analysé ce contrat : ${contractText}. 
        Voici ton rapport d'audit : ${analysis}. 
        Réponds aux questions de l'avocat avec précision, en citant les articles de loi appropriés.`
      },
      ...history,
      { role: 'user', content: userMessage }
    ],
    temperature: 0.2
  });
  return response.choices?.[0]?.message?.content?.toString() ?? '';
}