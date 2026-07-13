# 📅 App-EMIT - Système de Gestion des Salles et de l'Emploi du Temps

## 📌 Vue d'ensemble
**App-EMIT** est une solution logicielle intégrée conçue pour l'EMIT, permettant de piloter le patrimoine immobilier (salles) et la planification pédagogique. Le système intègre un **moteur d'exceptions intelligent** qui gère les imprévus (absences, travaux, reports) de manière automatisée.

L'application permet aux administrateurs, professeurs et étudiants de gérer et de consulter les emplois du temps en temps réel, tout en optimisant l'occupation des salles.

---

## 🚀 Fonctionnalités Principales

### 🔑 Gestion des Utilisateurs & Accès
- **Rôles distincts** : Administrateur (Scolarité), Professeur et Étudiant.
- **Authentification sécurisée** : Gestion des sessions via JWT.
- **Profils personnalisables** : Mise à jour des informations personnelles et préférences de notification.

### 🏢 Gestion du Patrimoine (Salles)
- **CRUD complet** : Ajout, modification et suppression de salles.
- **Détails techniques** : Gestion de la capacité, du bloc, du type de salle et de l'équipement.
- **Vérification de disponibilité** : Système de détection de conflits en temps réel lors de la réservation.

### 📅 Planification & Emploi du Temps (EDT)
- **Générateur de séances** : Création rapide de cours récurrents pour une année universitaire.
- **Vue Globale** : Interface interactive permettant de visualiser l'EDT de tous les niveaux et parcours.
- **Drag & Drop** : Possibilité de déplacer des séances pour ajuster le planning (Admin).
- **Export PDF/Excel** : Génération automatique des emplois du temps pour impression.

### ⚠️ Moteur d'Exceptions
- **Gestion des imprévus** : Signalement d'annulations, de reports ou d'indisponibilités de salle/professeur.
- **Impact automatisé** : Mise à jour instantanée du planning pour tous les utilisateurs concernés.
- **Notifications** : Alertes en temps réel via SignalR pour informer les étudiants et professeurs d'un changement.

### 🔄 Système d'Échange de Créneaux
- **Demandes d'échange** : Un professeur peut solliciter un autre professeur pour échanger un créneau.
- **Workflow de validation** : Le professeur cible peut accepter ou refuser la demande, mettant à jour automatiquement les agendas.

---

## 🏗️ Architecture Backend (N-Tier / Clean Architecture)
Le backend est structuré pour séparer les responsabilités, facilitant le travail en équipe et la maintenance.

### 📂 Structure des Dossiers (`/backend/AppEmit.API/`)
- **Entities/** : Modèles de données (POCO) représentant les tables PostgreSQL.
- **Data/** : Configuration Entity Framework (`AppDbContext`).
- **Repositories/** : Logique d'accès aux données (Requêtes SQL via EF Core).
- **Interfaces/** : Contrats pour les services et repositories.
- **Services/** : Logique métier (calculs, anti-collision).
- **Controllers/** : Points d'entrée de l'API (Routes HTTP).
- **DTOs/** : Objets de transfert pour la sécurité des données.
- **Mappers/** : Conversion entre Entities et DTOs.

---

## 🛠️ Stack Technique

### Backend
- **Framework** : ASP.NET Core 10 (C#)
- **ORM** : Entity Framework Core
- **Base de Données** : PostgreSQL
- **Communication Temps Réel** : SignalR
- **Sécurité** : JWT (JSON Web Tokens)

### Frontend
- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : Ark UI / Lucide React
- **State Management** : Zustand
- **Animations** : Framer Motion
- **Graphiques** : Chart.js

---

## 📦 Installation et Lancement

### Pré-requis
- .NET 10 SDK
- Node.js (LTS)
- PostgreSQL

### Backend
```bash
cd backend/AppEmit.API

# Installation des outils EF Core
dotnet tool install --global dotnet-ef

# Restauration et mise à jour BDD
dotnet restore
dotnet ef database update

# Lancement
dotnet run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Protocole Git & Workflow (Obligatoire)

Pour garantir la stabilité du projet, nous utilisons une stratégie de branches stricte. **La branche `main` est protégée**.

### 1. Création d'une branche (Une branche = Une Feature)
```bash
git checkout main
git pull origin main
git checkout -b feature/nom-de-la-tache
```

### 2. Validation et Fermeture de tâche
Utilisez les mots-clés `fix`, `close` ou `resolve` suivis du numéro de l'issue dans votre commit.
```bash
git add .
git commit -m "Description du travail - fix #12"
git push origin feature/nom-de-la-tache
```
