# Lexpacte - Analyse de contrats pour avocats

Application SaaS de legal-tech pour l'analyse automatisée de contrats avec IA.

## Stack Technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icônes)

## Architecture de Sécurité

### Souveraineté
- Toute la logique d'IA est isolée dans des **Server Actions** (`app/actions/ai-actions.ts`)
- Les données sensibles ne transitent jamais inutilement côté client

### Confidentialité
- Service de chiffrement **AES-256-GCM** (`lib/encryption.ts`)
- Chiffrement automatique des documents avant traitement

### IA
- Utilisation exclusive de l'**API Mistral AI** (modèle français)
- Intégration via Server Actions uniquement

## Installation

```bash
npm install
```

## Configuration

1. Copiez `.env.example` vers `.env`
2. Configurez votre clé API Mistral AI
3. Générez une clé de chiffrement

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du Projet

```
├── app/
│   ├── actions/          # Server Actions (logique IA isolée)
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Page dashboard
│   └── globals.css       # Styles globaux
├── components/
│   ├── Sidebar.tsx       # Sidebar de navigation
│   └── DragDropZone.tsx  # Zone de drag & drop
└── lib/
    └── encryption.ts     # Service de chiffrement
```

## Fonctionnalités

- ✅ Dashboard moderne avec sidebar
- ✅ Zone de drag & drop pour upload de PDF
- ✅ Architecture sécurisée avec Server Actions
- ✅ Service de chiffrement (placeholder)
- ✅ Intégration Mistral AI (à compléter)

## Prochaines Étapes

1. Implémenter complètement le chiffrement AES-256
2. Compléter l'intégration avec l'API Mistral AI
3. Ajouter la gestion de session utilisateur
4. Créer les pages Analyses, Bibliothèque et Paramètres
5. Implémenter le stockage sécurisé des documents
