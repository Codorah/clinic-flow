# Clinic Flow 🏥

Bienvenue sur **Clinic Flow**, une application web moderne et intégrée de gestion clinique. Cette application a été conçue pour optimiser le flux de travail des professionnels de santé dans un environnement clinique multi-postes.

## 🚀 Fonctionnalités Principales

- **10 Postes Cliniques Intégrés** : 
  - **Réception** : Enregistrement rapide, file d'attente, recherche globale avancée avec filtres d'âge et de statut.
  - **Infirmerie** : Prise de constantes vitales, observations et tableau de statistiques journalier avec alertes de fièvre.
  - **Consultation (Médecin)** : Consultation médicale, saisie de diagnostic, prescription d'ordonnances et aiguillage vers les spécialités (y compris le Bloc Chirurgical).
  - **Laboratoire** : Prise en charge des examens sanguins et urinaires, saisie de résultats.
  - **Radiologie & Imagerie** : Suivi des prescriptions d'examens d'imagerie.
  - **Bloc Chirurgical** : File d'attente chirurgicale dédiée avec aiguillage vers l'hospitalisation ou la facturation.
  - **Hospitalisation** : Gestion de l'occupation des lits avec indicateurs visuels de capacité en temps réel (seuil de 20 lits).
  - **Pharmacie** : Distribution de médicaments avec alerte visuelle de rupture/seuil critique de stock.
  - **Caisse / Facturation** : Génération automatique de factures, encaissement et statistiques de recettes.
  - **Comptabilité** : Suivi du grand livre clinique, encaissements consolidés et encours.
- **Tableau de Bord Administratif Premium** :
  - **Courbes Temporelles Réelles (SVG)** : Visualisation interactive (avec tooltips) de la fréquentation des patients et de la courbe des revenus sur 7 jours.
  - **Gestion de l'Inventaire & des Tarifs** : Modification in-line des prix de vente, des stocks physiques et des seuils d'alerte (`minStock`) des services et médicaments.
  - **Gestion du Personnel** : Annuaire des profils actifs avec possibilité de création/suppression de comptes et attribution de rôles/PINs.

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, Tailwind CSS, Radix UI, Framer Motion.
- **Backend** : Node.js, Express.js.
- **Base de données** : SQLite / PostgreSQL (avec Prisma ORM).
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
   Copiez le fichier `.env.example` vers `.env` et configurez votre `DATABASE_URL` (SQLite par défaut en dev).

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
  - **Bloc Chirurgical** : `1010`
  - **Réception** : `1111`
  - **Consultation** : `2222`
  - **Infirmerie** : `3333`
  - **Laboratoire** : `4444`
  - **Pharmacie** : `5555`
  - **Comptabilité** : `6666`
  - **Caisse / Facturation** : `7777`
  - **Hospitalisation** : `8888`
  - **Radiologie** : `9999`

> **Note de sécurité** : N'oubliez pas de modifier ces identifiants pour tout déploiement en production !

## ☁️ Déploiement sur Render

Ce projet est préconfiguré pour être déployé sur **Render** via le fichier `render.yaml`. 
Le pipeline de déploiement garantit l'installation des outils nécessaires (comme `esbuild`), la configuration du provider PostgreSQL, et exécute automatiquement les migrations/seeds de manière idempotente pour sécuriser vos données existantes.

---
*Propulsé avec passion par Codorah.*
