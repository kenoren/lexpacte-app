'use server'

import { Mistral } from '@mistralai/mistralai'

export async function analyzeContract(text: string): Promise<string> {
  if (typeof text !== 'string' || text.trim().length === 0) {
    console.error('Texte transmis à analyzeContract est vide ou undefined')
    throw new Error('Aucun texte fourni pour analyse')
  }

  console.log("Texte envoyé à l'IA:", text.substring(0, 100))
  console.log('Nombre de caractères extraits :', text.length)

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY manquant')
  }

  const client = new Mistral({ apiKey })
  const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'system',
        content: `Rôle : Tu agis en tant qu'Avocat Senior spécialisé en Droit des Affaires et Fusions-Acquisitions (M&A) en France. Ta mission est d'effectuer une "Due Diligence" (audit juridique) sur le contrat de cession que je vais te transmettre.
Objectif : Identifier les risques critiques pour l'acquéreur et extraire les informations clés pour la synthèse du deal.

Instructions d'analyse :

Examine les Clauses de Changement de Contrôle (Y a-t-il des contrats tiers qui s'annulent si la société est vendue ?).

Analyse la Garantie d'Actif et de Passif (GAP) : quelles sont les limites de responsabilité du vendeur (seuils, plafonds, durée) ?

Vérifie les Clauses de Non-Concurrence : sont-elles limitées dans le temps et l'espace (critère de validité en droit français) ?

Identifie les Conditions Suspendives : que doit-il se passer pour que la vente soit définitive ?

Format de réponse attendu : Présente ton analyse sous forme de tableau Markdown avec 3 colonnes :

Point de vigilance (Nom de la clause)

Analyse / Résumé (Ce que dit le contrat)

Niveau de Risque (Faible / Modéré / Critique) avec une brève explication.

Pour chaque risque, cite explicitement le numéro de l'article concerné s'il existe, ou indique 'ABSENT' si la clause est manquante.

Pour chaque risque 'Critique' identifié, ajoute une colonne ou une ligne 'Recommandation de négociation'. L'objectif est de dire à l'avocat quelle clause il doit proposer pour corriger le problème (ex: porter la durée fiscale à 10 ans, ajouter une contrepartie financière pour la non-concurrence, etc.).`,
      },
      {
        role: 'user',
        content: 'Voici le texte du contrat à analyser : ' + text,
      },
    ],
  })

  const content =
    chatResponse.choices?.[0]?.message?.content?.toString().trim() ?? ''

  if (!content) {
    throw new Error('Réponse vide de Mistral')
  }

  return content
}
