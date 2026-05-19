<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  <h1>🏥 Clinical Flow</h1>
  <p><strong>Suite Médicale Intégrée & Portail Clinique Moderne</strong></p>
  
  <p>
    <a href="#-fonctionnalités">Fonctionnalités</a> •
    <a href="#-technologies">Technologies</a> •
    <a href="#-installation-locale">Installation</a> •
    <a href="#-déploiement-render">Déploiement</a> •
    <a href="#-téléchargement-sur-pc-pwa">Installation PC (PWA)</a> •
    <a href="#-identifiants-de-test">Accès de Test</a>
  </p>
</div>

---

**Clinical Flow** est une application web moderne et performante conçue pour optimiser et fluidifier le parcours patient au sein des cliniques et hôpitaux. Elle offre un portail d'accès unique pour tous les rôles médicaux et administratifs, ainsi qu'une interface sécurisée pour la gestion globale de l'établissement.

---

## 🌟 Fonctionnalités

- **🛡️ Authentification Multi-Rôle Sécurisée** : 
  - Console administrative globale sécurisée par identifiant et mot de passe.
  - Connexion rapide des postes de travail par codes PIN à 4 chiffres.
- **💼 8 Postes Cliniques Dédiés** : 
  - **Réception** : Enregistrement et gestion de la file d'attente des patients.
  - **Consultation (Médecin)** : Consultation active, historiques médicaux et diagnostics.
  - **Infirmerie (Soins)** : Prise de constantes vitales et soins rapides.
  - **Laboratoire** : Demandes d'analyses cliniques et rapports.
  - **Pharmacie** : Gestion et distribution des ordonnances.
  - **Comptabilité** : Vue financière d'ensemble.
  - **Caisse** : Encaissement des factures générées.
  - **Hospitalisation** : Gestion des lits et des séjours de patients.
- **🎨 Interface Ultra-Moderne** : Design responsive premium, transitions fluides via Motion (Framer Motion) et icônes dynamiques (Lucide-React).
- **💡 Assistant IA Intégrée** : Intégration optionnelle avec l'API Gemini pour assister les diagnostics et la gestion.

---

## 🛠️ Technologies

- **Frontend** : React 19, Vite, Tailwind CSS, Motion (React), Lucide Icons.
- **Backend** : Node.js, Express.
- **Base de données / ORM** : Prisma ORM, SQLite (local) / PostgreSQL (production / Render).
- **Sécurité** : JWT (JSON Web Tokens), Bcrypt.js (hachage des mots de passe).
- **Compatibilité** : PWA (Progressive Web App) intégrée pour une installation native sur PC/Desktop.

---

## 💻 Installation Locale

Le projet est configuré avec **SQLite** pour un démarrage local instantané et sans aucune configuration de serveur de base de données.

### Prérequis
- [Node.js](https://nodejs.org/) (Version 18 ou supérieure recommandée)

### Étapes d'installation

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/Codorah/clinic-flow.git
   cd clinic-flow
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Générer le client Prisma & Créer la base de données locale** :
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Importer les données de test (Seeding)** :
   Cette commande crée automatiquement les comptes et configurations requis pour vos tests :
   ```bash
   npx prisma db seed
   ```

5. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

L'application est maintenant accessible en local sur **[http://localhost:3000](http://localhost:3000)** !

---

## 🚀 Déploiement Render

Le projet est prêt à être déployé sur **[Render](https://render.com/)** en utilisant son système de **Blueprint** (`render.yaml`).

### Comment déployer ?
1. Poussez votre code sur votre dépôt GitHub.
2. Connectez-vous à Render, puis cliquez sur **New > Blueprint**.
3. Sélectionnez le dépôt `clinic-flow`.
4. Render configurera automatiquement :
   - Un **Web Service** Node.js avec les scripts de production.
   - Une **Base de données PostgreSQL** sécurisée et dédiée.
   - La génération automatique des variables d'environnement (`JWT_SECRET`, etc.).
5. Le script automatisé `scripts/prepare-postgres.js` adaptera automatiquement le schéma Prisma pour utiliser PostgreSQL en production à la place de SQLite.

---

## 📦 Téléchargement sur PC (PWA)

Grâce à sa configuration **PWA (Progressive Web App)**, Clinical Flow peut être "téléchargé" et installé comme un logiciel classique sur les ordinateurs des praticiens :

1. Ouvrez l'application déployée dans votre navigateur (Chrome ou Edge).
2. Cliquez sur l'icône **"Installer l'application"** (petite icône d'écran ou de téléchargement disponible à droite dans la barre d'adresse URL).
3. Un raccourci **"Clinic Flow"** sera automatiquement créé sur votre Bureau. L'application s'ouvrira alors dans une fenêtre épurée, fluide et autonome, sans la barre d'adresse du navigateur.

---

## 🔐 Identifiants de Test

Une fois la base de données initialisée en local avec `npx prisma db seed`, utilisez les accès suivants pour vos démonstrations et tests :

### 🔑 Console Administrateur
> Accessible en cliquant sur le bouton **"Admin"** au bas de l'écran du portail.

- **Email** : `ceo.codorah@gmail.com`
- **Mot de passe** : `admin123`

### 🔢 Postes de Travail (Codes PIN à 4 chiffres)
- **Réception** : `1111`
- **Consultation (Docteur)** : `2222`
- **Soins Infirmiers (Infirmerie)** : `3333`
- **Laboratoire** : `4444`
- **Pharmacie** : `5555`
- **Comptabilité** : `6666`
- **Caisse** : `7777`
- **Hospitalisation** : `8888`

---

<div align="center">
  <p>Développé avec 💚 par <strong>Codorah</strong></p>
</div>
