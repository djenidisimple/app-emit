# 📅 App-EMIT - Système de Gestion des Salles et de l'Emploi du Temps

## 📌 Vue d'ensemble
**App-EMIT** est une solution logicielle intégrée conçue pour l'EMIT, permettant de piloter le patrimoine immobilier (salles) et la planification pédagogique. Le système intègre un **moteur d'exceptions intelligent** qui gère les imprévus (absences, travaux, reports) de manière automatisée.

---

## 🏗️ Architecture Backend (N-Tier / Clean Architecture)
Le backend est structuré pour séparer les responsabilités, facilitant le travail en équipe et la maintenance.

### 📂 Structure des Dossiers (`/backend/AppEmit.API/`)
*   **Entities/** : Contient les modèles de données (POCO) qui représentent les tables PostgreSQL.
*   **Data/** : Contient le `ApplicationDbContext` (Configuration Entity Framework).
*   **Repositories/** : Contient la logique d'accès aux données (Requêtes SQL via EF Core).
*   **Interfaces/** : Définit les contrats (Interfaces) pour les services et repositories.
*   **Services/** : Contient la logique métier (calculs, vérification de collisions).
*   **Controllers/** : Points d'entrée de l'API (Gestion des requêtes HTTP).
*   **DTOs/** : Objets de transfert de données pour sécuriser les échanges API.
*   **Mappers/** : Logique de conversion entre Entities et DTOs.

### 🤝 Répartition de l'Équipe Backend
| Membre | Couche assignée | Responsabilités |
| :--- | :--- | :--- |
| **Brunel** | `Entities` & `Repositories` | Modélisation BDD et accès aux données. |
| **Romuald** | `Services` | Algorithme d'anti-collision et gestion des exceptions. |
| **Samson** | `Controllers` & `DTOs` | Création des endpoints API et validation des entrées. |
| **Djenidi** | `Infrastructure` & `Data` | Configuration globale, Sécurité JWT et SignalR. |

---

## 🛠️ Stack Technique
*   **Backend** : ASP.NET Core 10 (C#) - Pattern Repository/Service.
*   **Frontend** : Next.js 14+ (TypeScript) - Tailwind CSS & FullCalendar.
*   **Base de Données** : PostgreSQL.
*   **Temps Réel** : SignalR pour les notifications instantanées.
*   **Authentification** : JWT (JSON Web Tokens).

---

## 🏗️ Conception & Diagrammes

### Modèle Logique de Données (MLD)
![Modèle Logique de Données](./conception/MLD.png)

### Diagrammes de Conception
*   **Cas d'Utilisation** : ![Diagramme de Cas d'Utilisation](./conception/Diagrammes%20de%20Cas%20d'Utilisation-G-Salles%20EMIT%20Management.png)
*   **Séquence** : ![Diagramme de Séquence](./conception/mermaid-diagram-2026-05-02-212849.png)
*   **Classes** : ![Diagramme de Classes](./conception/Diagramme%20de%20classe.png)

---

## 📦 Installation et Lancement

### Backend
```bash
cd backend/AppEmit.API
dotnet restore
dotnet ef database update
dotnet run