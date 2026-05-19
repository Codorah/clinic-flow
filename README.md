# Clinic Flow 🏥

Bienvenue sur **Clinic Flow**, une application web moderne et intégrée de gestion clinique. Cette application a été conçue pour optimiser le flux de travail des professionnels de santé dans un environnement clinique (médecins, infirmières, pharmaciens, laboratoires, etc.).

## 🚀 Fonctionnalités Principales

- **Authentification Sécurisée & Basée sur les Rôles** : 
  - Accès Administrateur par mot de passe.
  - Accès aux postes cliniques par code PIN rapide.
- **Gestion Complète des Patients** : Enregistrement, suivi du statut et historiques.
- **Tableaux de Bord Spécifiques** :
  - **Réception** : Accueil, enregistrement, facturation.
  - **Consultation (Médecin)** : Diagnostic, prescriptions.
  - **Infirmerie** : Prise de constantes, préparation.
  - **Laboratoire & Pharmacie** : Suivi des examens et délivrance de médicaments.
- **Catalogue & Facturation** : Gestion des tarifs des actes médicaux et suivi financier.

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, Tailwind CSS, Radix UI, Framer Motion.
- **Backend** : Node.js, Express.js.
- **Base de données** : PostgreSQL (avec Prisma ORM).
- **Déploiement** : Render (Web Service + Base de données PostgreSQL).

## ⚙️ Installation & Lancement Local

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Codorah/clinic-flow.git
   cd clinic-flow
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'environnement**
   Copiez le fichier `.env.example` (s'il existe) vers `.env` et configurez votre `DATABASE_URL` (SQLite pour le dev, PostgreSQL pour la prod).

4. **Initialiser la base de données**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Démarrer en mode développement**
   ```bash
   npm run dev
   ```

## 🔐 Identifiants par défaut (Mode Démo)

Lors du premier lancement (après le seed), utilisez ces identifiants :

- **Super Administrateur** : `ceo.codorah@gmail.com` / Mot de passe : `admin123`
- **Postes cliniques (PINs)** :
  - Réception : `1111`
  - Consultation : `2222`
  - Infirmerie : `3333`
  - Laboratoire : `4444`
  - Pharmacie : `5555`

> **Note de sécurité** : N'oubliez pas de modifier ces identifiants pour tout déploiement en production !

## ☁️ Déploiement sur Render

Ce projet est préconfiguré pour être déployé sur **Render** via le fichier `render.yaml`. 
Le pipeline de déploiement garantit l'installation des outils nécessaires (comme `esbuild`), la configuration du provider PostgreSQL, et exécute automatiquement les migrations/seeds de manière idempotente pour sécuriser vos données existantes.

---
*Propulsé avec passion par Codorah.*
