# Liste des Tâches — G-SALLES EMIT

## Légende
- [ ] = Pas commencé
- [x] = Terminé

---

## Phase 1 : Système de Réservation (Étudiant & Admin)

| # | Tâche | Responsable | Statut |
|---|---|---|---|
| 1.1 | ReservationCreateDto / ReservationReadDto / ReservationUpdateStatusDto | Samson | ✅ |
| 1.2 | IReservationService + ReservationService (Creer, Valider, Refuser) | Romuald | ✅ |
| 1.3 | ReservationController (GET, POST, PATCH statut) | Samson | ✅ |
| 1.4 | Intégration SignalR pour notification changement de statut | Djenidi | ✅ |
| 1.5 | ReservationModal (frontend étudiant) | Djenidi | ✅ |
| 1.6 | Page admin réservations (filtre statut, Accepter/Refuser) | Mickael | ✅ |

---

## Phase 2 : Fonctionnalités du Professeur

| # | Tâche | Responsable | Statut | Description |
|---|---|---|---|---|
| 2.1 | Backend : Ajout bouton "Marquer terminée" sur le planning | Mickael | ✅ | PATCH `/api/SeanceCours/{id}/terminer` déjà implémenté |

### Reste à faire

| # | Tâche | Responsable | Statut | Description |
|---|---|---|---|---|
| 2.2 | **DemandeEchange** : Créer l'entité + Repository + Migration EF Core | Brunel | ⬜ | Créer la table `DemandeEchange` avec les champs : Id, SeanceCoursId (FK), ProfesseurDemandeurId (FK), ProfesseurCibleId (FK), Statut (En attente/Acceptée/Refusée), DateDemande. Ajouter le DbSet dans AppDbContext et créer la migration. |
| 2.3 | **DemandeEchange** : Créer les DTOs + Service + Controller | Samson | ⬜ | DTOs : DemandeEchangeCreateDto, DemandeEchangeReadDto, DemandeEchangeUpdateStatusDto. Service : CreerDemande(), ObtenirDemandes(), AccepterDemande(), RefuserDemande(). Controller : POST /, GET /, PATCH /{id}/statut. |
| 2.4 | **DemandeEchange** : Créer la page frontend de soumission et validation | Samson | ⬜ | Page pour les professeurs : soumettre une demande d'échange (sélectionner séance, prof cible). Page pour le prof cible : voir les demandes et Accepter/Refuser. |
| 2.5 | **Frontend Professeur** : Ajouter bouton "Marquer terminée" sur le planning | Mickael | ⬜ | Ajouter un bouton "✓ Terminée" sur chaque séance dans la vue planning du dashboard, qui appelle PATCH `/api/SeanceCours/{id}/terminer`. |

---

## Phase 3 : Référentiel Complet (Admin CRUD)

| # | Tâche | Responsable | Statut | Description |
|---|---|---|---|---|
| 3.1 | Backend CRUD Salles (GET, POST, PUT, DELETE) | Brunel | ✅ | |
| 3.2 | Backend CRUD Matieres (GET, POST, PUT, DELETE) | Brunel | ✅ | |
| 3.3 | Backend CRUD Parcours (GET, POST, PUT, DELETE) | Brunel | ✅ | |
| 3.4 | Backend CRUD Utilisateurs (GET, POST, PUT, DELETE) | Samson | ✅ | |
| 3.5 | Backend GET + POST + DELETE Niveaux | Brunel | ✅ | |
| 3.6 | Backend GET + POST + DELETE Filieres | Brunel | ✅ | |
| 3.7 | Frontend CRUD Matieres (Create, Edit, Delete) | Mickael | ✅ | |
| 3.8 | Frontend CRUD Parcours (Create, Edit, Delete) | Mickael | ✅ | |

### Reste à faire

| # | Tâche | Responsable | Statut | Description |
|---|---|---|---|---|
| 3.9 | **Backend Niveaux** : Ajouter endpoint PUT `/api/Niveau/{id}` | Brunel | ⬜ | Implémenter la méthode Update dans NiveauController et NiveauService pour permettre la modification d'un niveau existant. |
| 3.10 | **Backend Filieres** : Ajouter endpoint PUT `/api/Filiere/{id}` | Brunel | ⬜ | Implémenter la méthode Update dans FiliereController et FiliereService pour permettre la modification d'une filière existante. |
| 3.11 | **Frontend Salles** : Ajouter Create/Edit/Delete | Mickael | ⬜ | Ajouter un formulaire d'ajout et d'édition de salle (nom, capacité, bloc, type) + bouton suppression avec confirmation. Backend déjà prêt (Full CRUD). |
| 3.12 | **Frontend Utilisateurs** : Ajouter Create/Edit | Mickael | ⬜ | Ajouter un formulaire d'ajout et d'édition d'utilisateur (nom, email, rôle, mot de passe). Backend déjà prêt (Full CRUD). |
| 3.13 | **Frontend Niveaux** : Ajouter bouton Edit | Romuald | ⬜ | Ajouter un bouton d'édition (icône crayon) dans le tableau des niveaux, avec un formulaire inline ou modal. |
| 3.14 | **Frontend Filieres** : Ajouter bouton Edit | Romuald | ⬜ | Ajouter un bouton d'édition (icône crayon) dans le tableau des filières, avec un formulaire inline ou modal. |
| 3.15 | **Générateur de Séance** : Backend endpoint POST `/api/SeanceCours/generate` | Samson | ⬜ | Endpoint pour créer une séance en liant : Professeur + Matière + Salle + Créneau + DateDebut + DateFin. Créer le SeanceCoursCreateDto et l'intégrer au SeanceCoursService. |
| 3.16 | **Générateur de Séance** : Frontend formulaire de génération | Romuald | ⬜ | Formulaire avec sélecteurs : Professeur, Matière, Salle, Créneau (jour + heure), Date début, Date fin. Bouton "Générer" qui POST vers `/api/SeanceCours/generate`. |

---

## Récapitulatif par Membre

### Brunel — Backend (Entités, Repos, Migrations)
- [⬜] **2.2** — DemandeEchange : Entity + Repository + Migration
- [⬜] **3.9** — Niveaux : Ajout endpoint PUT
- [⬜] **3.10** — Filieres : Ajout endpoint PUT

### Samson — Backend (Services, Controllers, DTOs) + Frontend
- [⬜] **2.3** — DemandeEchange : DTOs + Service + Controller
- [⬜] **2.4** — DemandeEchange : Frontend UI
- [⬜] **3.15** — Générateur de Séance : Backend endpoint

### Mickael — Frontend Admin (Dashboard, CRUD UI)
- [⬜] **2.5** — Frontend Professeur : bouton "Marquer terminée"
- [⬜] **3.11** — Frontend Salles : Create/Edit/Delete
- [⬜] **3.12** — Frontend Utilisateurs : Create/Edit

### Romuald — Frontend (Planning, Exceptions, UI)
- [⬜] **3.13** — Frontend Niveaux : bouton Edit
- [⬜] **3.14** — Frontend Filieres : bouton Edit
- [⬜] **3.16** — Générateur de Séance : Frontend formulaire
