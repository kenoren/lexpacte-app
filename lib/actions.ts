'use server'

import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey: apiKey ?? '' })

/**
 * Analyse initiale du contrat
 */
export async function analyzeContract(
    text: string,
    mode: 'buyer' | 'seller' = 'buyer',
    lawCodes: string = 'Code Civil'
): Promise<string> {
  if (!text || text.trim().length === 0) throw new Error('Aucun texte fourni.')
  if (!apiKey) throw new Error("Clé API Mistral manquante.")

  const promptBuyer = `Rôle : Avocat Senior M&A. Mission : Audit SPA pour l'ACQUÉREUR via ${lawCodes}. 
  STRUCTURE : 1. SYNTHÈSE EXÉCUTIVE (Score de risque) 2. ANALYSE DÉTAILLÉE (Tableau avec Clause, Analyse, Risque, Action Corrective).`

  const promptSeller = `Rôle : Expert VDD. Mission : Préparer le VENDEUR via ${lawCodes}. 
  STRUCTURE : 1. SYNTHÈSE DE PRÉPARATION 2. PLAN D'ACTION (Tableau avec Clause, Argument Acheteur, Remède).`

  const selectedPrompt = mode === 'buyer' ? promptBuyer : promptSeller

  try {
    const chatResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: selectedPrompt },
        { role: 'user', content: 'Texte du contrat : \n\n' + text },
      ],
      temperature: 0.1,
    })
    return chatResponse.choices?.[0]?.message?.content?.toString() ?? ''
  } catch (error) {
    console.error("Erreur Analyse:", error)
    return "Erreur lors de l'analyse du document."
  }
}

/**
 * Génération du contrat corrigé
 */
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
          content: `Tu es un avocat senior. Réécris le contrat en appliquant ces corrections : ${analysis}. Référence : ${lawCodes}. Retourne UNIQUEMENT le texte contractuel.`
        },
        { role: 'user', content: originalText },
      ],
      temperature: 0.2
    })
    return response.choices?.[0]?.message?.content?.toString() ?? ''
  } catch (error) {
    return "Erreur lors de la génération du contrat."
  }
}

/**
 * CHAT AVEC LE CONTRAT (Version corrigée et fonctionnelle)
 */
export async function chatWithContract(
    userMessage: string,
    history: { role: 'user' | 'assistant', content: string }[],
    contractText: string,
    analysis: string
): Promise<string> {
  if (!apiKey) throw new Error("Clé API manquante.")

  // On limite la taille du contrat envoyé dans le chat pour éviter les erreurs de Token Limit
  // 15000 caractères suffisent généralement pour donner le contexte sans saturer l'IA
  const truncatedContract = contractText.substring(0, 15000);

  try {
    // Construction des messages avec formatage strict des rôles
    const formattedMessages = [
      {
        role: 'system' as const,
        content: `Tu es un expert juridique M&A. Voici le contrat : ${truncatedContract}. 
        Voici l'audit déjà réalisé : ${analysis}. 
        Réponds aux questions de l'utilisateur sur ce contrat avec précision.`
      },
      // On map l'historique pour s'assurer du formatage Mistral
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: formattedMessages,
      temperature: 0.2
    });

    const content = response.choices?.[0]?.message?.content?.toString();

    if (!content) {
      return "Je n'ai pas pu analyser votre demande.";
    }

    return content;
  } catch (error: any) {
    console.error("Erreur Chat Mistral:", error);
    return `Désolé, j'ai rencontré une erreur technique : ${error.message}`;
  }
}