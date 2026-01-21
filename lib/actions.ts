'use server'

import { Mistral } from '@mistralai/mistralai'

/**
 * Analyse le contrat via Mistral AI en fonction de la posture choisie (Acheteur ou Vendeur)
 * @param text Le contenu textuel du contrat extrait du PDF
 * @param mode 'buyer' (Audit d'acquisition) ou 'seller' (Vendor Due Diligence)
 */
export async function analyzeContract(text: string, mode: 'buyer' | 'seller' = 'buyer'): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new Error('Aucun texte fourni pour l’analyse.')
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error("La clé API Mistral est manquante dans les variables d'environnement.")
  }

  const client = new Mistral({ apiKey })

  // --- TON PROMPT ACHETEUR (CONSERVÉ À 100%) ---
  const promptBuyer = `Rôle : Avocat Associé Senior M&A (Barreau de Paris).
Mission : Audit juridique SPA pour l'ACQUÉREUR.

STRUCTURE DE RÉPONSE OBLIGATOIRE :

### 1. SYNTHÈSE EXÉCUTIVE
- **Score de Risque Global** : [FAIBLE / MODÉRÉ / CRITIQUE]
- **Priorités de Négociation** :
- [Alerte 1]
- [Alerte 2]

### 2. ANALYSE DÉTAILLÉE
| Catégorie | Clause | Analyse & Fondement | Risque | Action Corrective (Rédactionnelle) |
| :--- | :--- | :--- | :--- | :--- |

CONSIGNES :
1. Citations : Art. 1171, 1231-5 C. civ etc.
2. Jurisprudence : Mentionner la conformité aux critères de la Cour de cassation (ex: non-concurrence).
3. Ready-to-Paste : Proposer des clauses entre guillemets ("...") prêtes à l'emploi.
4. Simplicité : Pas de gras (**) à l'intérieur des cellules du tableau pour ne pas casser le format.`

  // --- PROMPT VENDEUR AMÉLIORÉ (STRATÉGIQUE & VDD) ---
  const promptSeller = `Rôle : Expert en Vendor Due Diligence (VDD) - Cabinet M&A.
Mission : Préparer le VENDEUR à la cession en identifiant les leviers que l'Acheteur utilisera pour baisser le prix ou exiger des garanties lourdes.

STRUCTURE DE RÉPONSE OBLIGATOIRE :

### 1. SYNTHÈSE DE PRÉPARATION (VDD)
- **Indice de Fragilité du Prix** : [SCORE SUR 100 - Plus le score est haut, plus l'acheteur a d'arguments pour baisser le prix]
- **Arguments d'Attaque de l'Acheteur (Anticipation)** :
- [Point d'attaque 1 : Ce que l'acheteur va utiliser comme levier pour négocier une baisse de prix]
- [Point d'attaque 2 : Clause pouvant justifier une Garantie de Passif (GAP) étendue]

### 2. PLAN D'ACTION PRÉ-CESSION
| Catégorie | Clause Sensible | Argumentation de l'Acheteur | Impact sur le Prix / Deal | Remède Stratégique Vendeur |
| :--- | :--- | :--- | :--- | :--- |

CONSIGNES STRATÉGIQUES :
1. Posture : Soyez l'avocat du diable. Anticipez comment l'acquéreur va critiquer le contrat (ex: "Clause léonine", "Déséquilibre significatif Art. 1171").
2. Impact Prix : Évaluez si la clause peut générer une réduction de prix (Price Adjustment) ou une rétention de fonds lors du closing.
3. Remède : Proposez des modifications concrètes pour "nettoyer" le contrat avant de le présenter en Data Room.
4. Jurisprudence : Citer Art. 1171 C. civ, 1231-5 C. civ ou les arrêts majeurs de la Cour de cassation.
5. Simplicité : Pas de gras (**) à l'intérieur des cellules du tableau pour garantir un rendu PDF parfait.`

  // Sélection du prompt en fonction du mode choisi dans l'interface
  const selectedPrompt = mode === 'buyer' ? promptBuyer : promptSeller

  try {
    const chatResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: selectedPrompt,
        },
        {
          role: 'user',
          content: 'Voici le texte du contrat à analyser : \n\n' + text,
        },
      ],
      temperature: 0.1, // Précision maximale
    })

    const result = chatResponse.choices?.[0]?.message?.content?.toString() ?? ''

    if (!result) {
      throw new Error("L'IA n'a retourné aucun résultat.")
    }

    return result
  } catch (error) {
    console.error('Mistral AI Error:', error)
    throw new Error('Une erreur est survenue lors de l’analyse du contrat.')
  }
}