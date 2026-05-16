# Liste des Tâches — G-SALLES EMIT

## Organisation par Modules

Chaque module est indépendant et peut être réalisé en parallèle par chaque membre. Les dépendances sont notées quand elles existent.

---

## ✅ Module A — Réservation (Terminé)

| Tâche | Responsable |
|---|---|
| DTOs Réservation | Samson |
| IReservationService + ReservationService | Romuald |
| ReservationController | Samson |
| SignalR notifications | Djenidi |
| ReservationModal (frontend étudiant) | Djenidi |
| Page admin réservations | Mickael |

---

## ⬜ Module B — DemandeEchange (Brunel → Samson)

**Dépendance :** Brunel livre l'entité d'abord, puis Samson fait l'API et le frontend.

### B1 — Brunel : Entité + Repository + Migration

Créer la table `DemandeEchanges` :
- `Id` (Guid)
- `SeanceCoursId` (FK → SeanceCours)
- `ProfesseurDemandeurId` (FK → Utilisateur)
- `ProfesseurCibleId` (FK → Utilisateur)
- `Statut` (string : "En attente" / "Acceptée" / "Refusée")
- `DateDemande` (DateTime)
- Ajouter `DbSet<DemandeEchange>` dans `AppDbContext`
- Créer la migration EF Core (`dotnet ef migrations add CreateDemandeEchange`)

### B2 — Samson : DTOs + Interface + Service + Controller

- `DemandeEchangeCreateDto`, `DemandeEchangeReadDto`, `DemandeEchangeUpdateStatusDto`
- `IDemandeEchangeService` : `CreerDemande()`, `ObtenirDemandes()`, `AccepterDemande()`, `RefuserDemande()`
- `DemandeEchangeService` (logique métier d'échange de créneau)
- `DemandeEchangeController` : `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}/statut`
- Enregistrer dans `Program.cs` (DI)

### B3 — Samson : Frontend DemandeEchange

- Page "Mes demandes d'échange" pour le professeur demandeur
- Page "Demandes reçues" pour le professeur cible (avec Accepter/Refuser)
- Formulaire de soumission (sélectionner séance + professeur cible)

---

## ⬜ Module C — Niveaux (Brunel + Romuald)

**Indépendant.** Brunel et Romuald peuvent travailler en parallèle.

### C1 — Brunel : Backend PUT Niveaux

- Ajouter `PUT /api/Niveau/{id}` dans `NiveauController`
- Ajouter `UpdateAsync` dans `INiveauService` / `NiveauService`

### C2 — Romuald : Frontend Edit Niveaux

- Ajouter bouton Edit (icône crayon) dans `admin/niveaux/page.tsx`
- Modal ou formulaire inline pour modifier le libellé

---

## ⬜ Module D — Filieres (Brunel + Romuald)

**Indépendant.** Brunel et Romuald peuvent travailler en parallèle.

### D1 — Brunel : Backend PUT Filieres

- Ajouter `PUT /api/Filiere/{id}` dans `FiliereController`
- Ajouter `UpdateAsync` dans `IFiliereService` / `FiliereService`

### D2 — Romuald : Frontend Edit Filieres

- Ajouter bouton Edit (icône crayon) dans `admin/filieres/page.tsx`
- Modal ou formulaire inline pour modifier le libellé

---

## ⬜ Module E — Salles Admin CRUD (Mickael)

**Indépendant.** Le backend est déjà prêt (Full CRUD).

- Dans `admin/salles/page.tsx` :
  - Ajouter un formulaire "Ajouter une salle" (nom, capacité, bloc, type)
  - Ajouter bouton Edit sur chaque salle (modal avec formulaire pré-rempli)
  - Ajouter bouton Delete avec confirmation
  - API existante : `POST /api/Salles`, `PUT /api/Salles/{id}`, `DELETE /api/Salles/{id}`

---

## ⬜ Module F — Utilisateurs Admin CRUD (Mickael)

**Indépendant.** Le backend est déjà prêt (Full CRUD).

- Dans `admin/utilisateurs/page.tsx` :
  - Ajouter un formulaire "Ajouter un utilisateur" (nom, email, rôle, mot de passe)
  - Ajouter bouton Edit sur chaque utilisateur (modal)
  - API existante : `POST /api/Utilisateur`, `PUT /api/Utilisateur/{id}`

---

## ⬜ Module G — Professeur : Marquer terminée (Mickael)

**Indépendant.** Le backend est déjà prêt (`PATCH /api/SeanceCours/{id}/terminer`).

- Dans la vue planning du dashboard (`dashboard/page.tsx`) :
  - Ajouter un bouton "✓ Terminée" sur chaque séance
  - Confirmation avant action
  - Mettre à jour l'affichage (séance barrée / grisée une fois terminée)

---

## ⬜ Module H — Générateur de Séance (Samson → Romuald)

**Dépendance :** Samson livre l'API d'abord, puis Romuald fait le formulaire.

### H1 — Samson : Backend endpoint

- Créer `SeanceCoursCreateDto` : `ProfesseurId`, `MatiereId`, `SalleId`, `CreneauId`, `DateDebutAnnee`, `DateFinAnnee`, `CouleurAffichage`
- Ajouter `CreateAsync` dans `ISeanceCoursService` / `SeanceCoursService`
- Ajouter `POST /api/SeanceCours` ou `POST /api/SeanceCours/generate` dans `SeanceCoursController`

### H2 — Romuald : Frontend formulaire

- Créer un formulaire avec sélecteurs :
  - Professeur (dropdown)
  - Matière (dropdown)
  - Salle (dropdown)
  - Créneau (jour + heure)
  - Date début / Date fin (date pickers)
  - Couleur (color picker)
- POST vers l'API du générateur

---

## 📋 Planning d'exécution parallèle

```
Semaine 1 : Tout le monde démarre en même temps
─────────────────────────────────────────────
Brunel    │  B1 (Entité)  │  C1 (Niveaux)  │  D1 (Filieres)
Samson    │  H1 (Génér.)  │  [attend B1]   │  B2+B3 (DemandeEchange)
Mickael   │  E (Salles)   │  F (Utilisateurs) │  G (Professeur)
Romuald   │  C2 (Niveaux) │  D2 (Filieres) │  [attend H1]  │  H2 (Génér.)

Brunel termine vite → Samson enchaîne sur B2/B3
Samson termine H1 vite → Romuald enchaîne sur H2
Mickael et Romuald (C2, D2) sont 100% indépendants
```

---

## Récapitulatif par Membre

### Brunel (3 tâches — backend pur)
- [ ] **B1** — DemandeEchange : Entité + Repository + Migration
- [ ] **C1** — Niveaux : endpoint PUT
- [ ] **D1** — Filieres : endpoint PUT

### Samson (3 tâches — backend + frontend)
- [ ] **H1** — Générateur de Séance : backend endpoint
- [ ] **B2** — DemandeEchange : DTOs + Service + Controller
- [ ] **B3** — DemandeEchange : Frontend UI

### Mickael (3 tâches — frontend pur)
- [ ] **E** — Salles Admin : Create/Edit/Delete
- [ ] **F** — Utilisateurs Admin : Create/Edit
- [ ] **G** — Professeur : bouton "Marquer terminée"

### Romuald (3 tâches — frontend pur)
- [ ] **C2** — Niveaux : bouton Edit
- [ ] **D2** — Filieres : bouton Edit
- [ ] **H2** — Générateur de Séance : formulaire frontend
