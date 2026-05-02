# 📅 App-EMIT - Système de Gestion des Salles et de l'Emploi du Temps

## 📌 Vue d'ensemble
**App-EMIT** est une solution logicielle intégrée conçue pour l'EMIT, permettant de piloter le patrimoine immobilier (salles) et la planification pédagogique. Le système intègre un **moteur d'exceptions intelligent** qui gère les imprévus (absences, travaux, reports) de manière automatisée.

---

## 🏗️ Architecture Backend (N-Tier / Clean Architecture)
Le backend est structuré pour séparer les responsabilités, facilitant le travail en équipe et la maintenance.

### 📂 Structure des Dossiers (`/backend/AppEmit.API/`)
*   **Entities/** : Modèles de données (POCO) représentant les tables PostgreSQL.
*   **Data/** : Configuration Entity Framework (`AppDbContext`).
*   **Repositories/** : Logique d'accès aux données (Requêtes SQL via EF Core).
*   **Interfaces/** : Contrats pour les services et repositories.
*   **Services/** : Logique métier (calculs, anti-collision).
*   **Controllers/** : Points d'entrée de l'API (Routes HTTP).
*   **DTOs/** : Objets de transfert pour la sécurité des données.
*   **Mappers/** : Conversion entre Entities et DTOs.

### 🤝 Répartition de l'Équipe
| Membre | Couche assignée | Responsabilités |
| :--- | :--- | :--- |
| **Brunel** | `Entities` & `Repositories` | Modélisation BDD et accès aux données. |
| **Romuald** | `Services` | Algorithme d'anti-collision et exceptions. |
| **Samson** | `Controllers` & `DTOs` | Endpoints API et validation des entrées. |
| **Djenidi** | `Infrastructure` & `Data` | Sécurité JWT, SignalR et coordination. |

---

## 🛡️ Protocole Git & Workflow (Obligatoire)

Pour garantir la stabilité du projet, nous utilisons une stratégie de branches stricte. **La branche `main` est protégée** : personne ne peut y pousser du code directement.

### 1. Création d'une branche (Une branche = Une Feature)
Avant de coder, créez toujours une branche dédiée à votre tâche :
```bash
# Se synchroniser avec le serveur
git checkout main
git pull origin main

# Créer une branche locale (ex: feature/gestion-salles)
git checkout -b feature/nom-de-la-tache
```
### 2. Validation et Fermeture de tâche (Automation)

Pour valider une tâche et la lier à une "Issue" GitHub, utilisez les mots-clés fix, close ou resolve suivis du numéro de l'issue dans votre commit.
```bash
# Ajouter vos modifications
git add .

# Valider avec lien vers l'issue (ex: Issue #12)
git commit -m "Description du travail - fix #12"

# Envoyer sur GitHub
git push origin feature/nom-de-la-tache
```
## 📦 Installation et Lancement

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
## Frontend
```bash
cd frontend
npm install
npm run dev
```
## 🛠️ Stack Technique
- Backend : ASP.NET Core 10 (C#).
- Frontend : Next.js 14+ (TypeScript).
- Base de Données : PostgreSQL.
- Temps Réel : SignalR.