'use server'

import { Mistral } from '@mistralai/mistralai'

export async function analyzeContract(text: string): Promise<string> {
  if (!text || text.trim().length === 0) throw new Error('Aucun texte fourni.')

  const apiKey = process.env.MISTRAL_API_KEY
  const client = new Mistral({ apiKey })

  try {
    const chatResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: `Rôle : Avocat Associé Senior M&A (Barreau de Paris).
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
4. Simplicité : Pas de gras (**) à l'intérieur des cellules du tableau pour ne pas casser le format.`,
        },
        {
          role: 'user',
          content: 'Voici le contrat : ' + text,
        },
      ],
      temperature: 0.1,
    })

    return chatResponse.choices?.[0]?.message?.content?.toString() ?? ''
  } catch (error) {
    console.error('Mistral AI Error:', error)
    throw new Error('Erreur lors de l’analyse.')
  }
}