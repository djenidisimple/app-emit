# App-EMIT / G-Salles EMIT — Documentation détaillée

## Présentation générale

**App-EMIT** (aussi appelé **G-Salles EMIT**) est une application web de gestion des emplois du temps, des salles et des cours, construite pour **EMIT** (École Mention Informatique et Technologies), une école de l'**Université de Fianarantsoa** à Madagascar.

C'est une application full-stack qui permet la gestion des plannings hebdomadaires, des réservations de salles, des échanges de créneaux entre professeurs, et du référentiel académique (filières, parcours, niveaux, matières). Le système intègre un **moteur d'exceptions intelligent** qui gère automatiquement les annulations, reports et déplacements de séances.

---

## Stack technique

### Backend
- **Langage** : C# (.NET 10.0 — préversion)
- **Framework** : ASP.NET Core (Minimal API + Controllers pattern)
- **ORM** : Entity Framework Core 10.0.8
- **Base de données** : PostgreSQL 16 (via Npgsql)
- **Authentification** : JWT Bearer tokens (Microsoft.AspNetCore.Authentication.JwtBearer)
- **Temps réel** : SignalR (notifications push)
- **Mapping** : AutoMapper 16.1.1
- **Validation** : FluentValidation.AspNetCore
- **Génération de documents** : QuestPDF 2026.5.0 (PDF), ClosedXML 0.105.0 (Excel)
- **Hash de mots de passe** : BCrypt.Net-Next 4.2.0
- **Documentation API** : Swagger/Swashbuckle
- **Rate limiting** : Middleware ASP.NET Core intégré (FixedWindowLimiter)

### Frontend
- **Langage** : TypeScript 5.x
- **Framework** : Next.js 16.2.4 (avec Turbopack)
- **UI Runtime** : React 19.2.4
- **État** : Zustand 5
- **Styling** : PandaCSS 0.48.0 avec preset Park UI (basé sur Ark UI)
- **HTTP client** : Axios 1.16.0
- **Temps réel client** : @microsoft/signalr 10.0.0
- **Formulaires** : react-hook-form 7.76.1
- **Animations** : framer-motion 12.38.0
- **Icônes** : lucide-react 1.23.0
- **Tests** : Vitest 4.1.9, Testing Library
- **Cookies** : js-cookie 3.0.5
- **Linting** : ESLint 9.x

### Infrastructure
- **Conteneurisation** : Docker (Dockerfiles pour backend et frontend, docker-compose.yml avec 3 services)
- **Déploiement** : docker-compose.yml avec healthcheck, volumes persistants, dépendances entre services
- **Seed automatique** : La base est peuplée automatiquement au démarrage (utilisateurs, séances, matières, etc.)

---

## Architecture

### Structure des dossiers

```
app-emit/
├── backend/
│   ├── AppEmit.API/          # Projet API principal (ASP.NET Core)
│   │   ├── Controllers/      # 15 contrôleurs HTTP
│   │   ├── Services/         # 12+ services métier
│   │   ├── Repositories/     # 9 repositories (couche d'accès aux données)
│   │   ├── Entities/         # 16 entités (modèles de base de données)
│   │   ├── DTOs/             # 13 sous-dossiers de DTOs
│   │   ├── Data/             # DbContext, SeedData
│   │   ├── Mappings/         # 7 profils AutoMapper
│   │   ├── Interfaces/       # 21+ interfaces pour injection de dépendances
│   │   ├── Middleware/       # ExceptionMiddleware centralisé
│   │   ├── Exceptions/       # Classes d'exception personnalisées
│   │   ├── Hubs/             # NotificationHub SignalR
│   │   ├── Validators/       # Validateurs FluentValidation
│   │   └── Migrations/       # Migrations EF Core
│   └── AppEmit.API.Tests/    # Tests unitaires
├── frontend/                 # Application Next.js 16
│   ├── app/                  # App Router (pages)
│   ├── components/           # Composants React réutilisables
│   ├── services/             # 14 modules de service API
│   ├── store/                # Stores Zustand (auth, notifications, UI)
│   └── hooks/                # Hooks personnalisés
├── conception/               # Documents de conception et diagrammes
├── DebugScript/              # Script console de debug (.NET 10)
├── docker-compose.yml        # Orchestration des services
└── run.ps1                   # Script de lancement
```

### Architecture backend (N-Tiers / Clean Architecture)

```
Contrôleurs (HTTP) → Services (métier) → Repositories (données) → Entities (BDD)
```

Les dépendances sont injectées via le conteneur DI natif d'ASP.NET Core.

### Architecture frontend (Next.js App Router)

Layouts imbriqués avec protection par rôle :
- Layout racine → layout protégé (vérification JWT) → layouts spécifiques par section
- Trois structures de navigation : Admin (riche), Professeur (moyen), Étudiant (simple)
- Sidebar avec sections repliables, état actif, enfants imbriqués
- Top navbar avec recherche, cloche de notifications (badge non-lu), avatar/menu compte

---

## Schéma de base de données (16 entités)

### Structure académique
- **Filière** : `Id`, `Nom` — ex: Informatique, Gestion
- **Parcours** : `Id`, `Nom`, `FilièreId` (FK) — ex: Génie Logiciel, Intelligence Artificielle
- **Niveau** : `Id`, `Code` (L1-L3, M1-M2), `ParcoursId` (FK)
- **Matière** : `Id`, `Code`, `Nom`, `Type` (CM/TD/TP)

### Entités principales
- **Utilisateur** : `Id`, `Matricule`, `Nom`, `Prénom`, `Email` (unique), `MotDePasseHash`, `Rôle`, `DateNaissance`, `Adresse`, `NiveauId` (FK)
- **Salle** : `Id`, `CodeSalle`, `Libellé`, `Nom`, `Capacité`, `Équipements`, `EstActive`, `EstDisponible`, `Type`
- **Créneau** : `Id`, `Jour` (Lundi-Samedi), `HeureDébut`, `HeureFin`
- **SéanceCours** : `Id`, `MatièreId`, `ProfesseurId`, `SalleId`, `CréneauId`, `ParcoursId`, `NiveauId`, `DateDébutAnnée`, `DateFinAnnée`, `EstTerminée`, `CouleurAffichage`

### Exceptions et échanges
- **ExceptionPlanning** : `Id`, `SéanceCoursId`, `DateDébut`, `DateFin`, `TypeException` (Annulation/Report/Déplacement), `Motif`, `NouvelleSalleId`
- **DemandeÉchange** : `Id`, `DemandeurId`, `CibleId`, `SéanceDemandeurId`, `SéanceCibleId`, `Statut` (EnAttente/Acceptée/Refusée), `Motif`, `DateDemande`, `DateRéponse`

### Réservations et événements
- **Événement** : `Id`, `Nom`, `Description`, `DateÉvénement`, `OrganisateurId`
- **Réservation** : `Id`, `UtilisateurId`, `ÉvénementId`, `SalleId`, `DateRéservation`, `Session`, `Statut` (En attente/Confirmée/Annulée)
- **Paiement** : `Id`, `RéservationId`, `Montant`, `DatePaiement`, `MéthodePaiement`

### Notifications
- **Notification** : `Id`, `UtilisateurId`, `Message`, `DateEnvoi`, `EstLu`

---

## API Endpoints

### Authentification (`/api/Auth`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/Auth/register` | Anonyme | Création de compte |
| POST | `/api/Auth/login` | Anonyme | Connexion, retourne JWT |
| GET | `/api/Auth/me` | Authorized | Infos utilisateur connecté |

### Planning (`/api/Planning`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/Planning/hebdo` | Authorized | Planning hebdo avec filtres (ProfesseurId, SalleId, NiveauId, StartDate) |

### Séances (`/api/seances`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/seances/{id}` | Authorized | Séance par ID |
| PUT | `/api/seances/{id}` | Admin | Modifier une séance |
| PATCH | `/api/seances/{id}/terminer` | Admin/Professeur | Marquer terminée |
| POST | `/api/seances` | Admin | Créer une séance |
| POST | `/api/seances/generer` | Admin | Générer une séance |

### Salles (`/api/Salles`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/Salles` | Anonyme | Lister toutes les salles |
| GET | `/api/Salles/{id}` | Anonyme | Salle par ID |
| GET | `/api/Salles/disponibles` | Anonyme | Salles disponibles par date + créneau |
| POST | `/api/Salles` | Admin | Créer une salle |
| PUT | `/api/Salles/{id}` | Admin | Modifier une salle |
| DELETE | `/api/Salles/{id}` | Admin | Supprimer une salle |

### Réservations (`/api/Reservation`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/Reservation` | Authorized | Toutes les réservations |
| GET | `/api/Reservation/{id}` | Authorized | Par ID |
| GET | `/api/Reservation/utilisateur/{id}` | Authorized | Par utilisateur |
| GET | `/api/Reservation/statut/{statut}` | Authorized | Par statut |
| GET | `/api/Reservation/en-attente` | Authorized | Demandes en attente |
| POST | `/api/Reservation` | Authorized | Créer une réservation |
| PATCH | `/api/Reservation/{id}/valider` | Admin | Valider |
| PATCH | `/api/Reservation/{id}/refuser` | Admin | Refuser |
| PATCH | `/api/Reservation/{id}/statut` | Admin | Changer statut |

### Demandes d'échange (`/api/DemandeEchange`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/DemandeEchange` | Authorized | Créer une demande |
| GET | `/api/DemandeEchange?professeurId=` | Authorized | Lister pour un professeur |
| GET | `/api/DemandeEchange/{id}` | Authorized | Par ID |
| PATCH | `/api/DemandeEchange/{id}/statut` | Authorized | Accepter/refuser |

### Exceptions (`/api/Exception`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/Exception/annuler` | Authorized | Annuler une séance |
| POST | `/api/Exception/reporter` | Authorized | Reporter une séance |
| POST | `/api/Exception/indisponible` | Authorized | Marquer indisponible |

### Documents (`/api/Document`)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/Document/export/pdf` | Authorized | Export planning PDF |
| POST | `/api/Document/export/excel` | Authorized | Export planning Excel |
| POST | `/api/Document/export/emploi-du-temps` | Authorized | Export EDT PDF |
| POST | `/api/Document/export/avis-etudiants` | Authorized | Export avis d'étudiants PDF |

### CRUD Admin
- `/api/Filieres`, `/api/Niveaux`, `/api/parcours`, `/api/matieres` — CRUD complet
- `/api/utilisateurs` — CRUD + GET par rôle
- `/api/creneaux` — GET (liste des créneaux)

### Notifications (`/api/Notification`)
- CRUD complet + `PATCH /lu`, `PATCH /tout-lire`

### SignalR Hub
- **Endpoint** : `/hubs/notifications`
- **Événements** : `NouvelleNotification` (pushé sur le groupe `user_{id}`)
- **Auth** : JWT passé en query string `access_token`

---

## Fonctionnalités par rôle

### Administrateur (accès complet)
- Gérer le référentiel académique (filières, parcours, niveaux, matières)
- Gérer les salles (CRUD avec export CSV)
- Gérer les utilisateurs (CRUD, filtre par rôle)
- Générer les séances de cours (lier professeur + matière + salle + créneau)
- Approuver/refuser les demandes de réservation de salles
- Voir tous les plannings
- Annuler/reporter/déplacer des séances

### Professeur
- Dashboard personnel avec statistiques de séances
- Planning hebdomadaire vu comme un grid horaire
- Marquer les séances comme terminées
- Faire/recevoir des demandes d'échange de créneaux avec d'autres professeurs
- Voir la disponibilité des salles
- Exporter son planning en PDF/Excel

### Étudiant
- Dashboard filtré par niveau
- Planning hebdomadaire
- Réserver une salle (assistant en 3 étapes : date → choix salle → détails)
- Historique de ses réservations et leur statut

---

## Sous-systèmes notables

### 1. Moteur d'exceptions intelligent
Le `PlanningHebdoService` applique trois types d'exceptions lors du calcul des occurrences hebdomadaires :
- **Annulation** : la séance est masquée du planning
- **Report** : la séance est déplacée à une nouvelle date
- **Déplacement** : la séance change de salle (avec note visible dans l'UI)

### 2. Temps réel (SignalR)
- Backend push les événements `NouvelleNotification` aux groupes utilisateurs
- Déclenché sur : création/approbation/refus de réservation, acceptation/refus d'échange, bienvenue à l'inscription
- Reconnexion automatique côté client avec @microsoft/signalr

### 3. Générateur de séances
Génère des `SéanceCours` en liant professeur, matière, salle, créneau, avec une plage de dates académiques (`DateDébutAnnée` à `DateFinAnnée`). Les occurrences hebdomadaires sont calculées à partir du jour du créneau.

### 4. Rate limiting
- Politique `Auth` : 10 requêtes/minute (login/register)
- Politique `Strict` : 100 requêtes/minute (endpoints généraux)

### 5. Seed automatique
À chaque démarrage, la base est peuplée automatiquement avec des données réalistes :
- 5 professeurs, 6 étudiants
- 20+ matières, 23 séances de cours
- Exemples d'exceptions de planning
- Demandes d'échange
- Événements, réservations, paiements
- Notifications

---

## Déploiement (Docker Compose)

3 services interconnectés :

```yaml
services:
  db:         # PostgreSQL 16 (port 5432) avec volume persistant pgdata
  backend:    # API ASP.NET Core (port 5011) — depends_on db (healthcheck)
  frontend:   # Next.js standalone (port 3000) — depends_on backend
```

Le frontend Next.js est configuré avec `output: "standalone"` pour un déploiement Docker optimisé.

---

## Informations contextuelles

- **Langue** : 100% français (interface utilisateur, code, commentaires, commits)
- **Équipe de développement** : Brunel, Samson, Mickael, Romuald, Djenidi
- **Design system** : Park UI (accent indigo/bleu-violet) avec PandaCSS — design tokens cohérents dans toute l'application
- **Documentation conception** : Dossier `conception/` avec diagrammes UML :
  - Diagramme de cas d'utilisation (3 acteurs : Admin, Professeur, Étudiant)
  - Diagramme de classes (10+ classes avec relations)
  - MCD/MLD (modèle conceptuel/logique de données)
  - Diagrammes de séquence (réservation, échange, annulation)
  - Diagramme d'états (cycle de vie d'une réservation)
  - Diagramme d'activité (flux de réservation)
  - Plan d'implémentation (3 phases)
- **Suivi de projet** : Fichier `TACHES.md` avec tâches et assignations
- **Modèle de données** : Les rôles et permissions sont gérés via des tables dédiées (et non des enums), avec une table de liaison `RolePermissions`
- **Next.js 16** : Utilisation du nouveau `dynamicIO` et `nodejs:sql` (via PPR) — configuration avancée dans `next.config.ts`
