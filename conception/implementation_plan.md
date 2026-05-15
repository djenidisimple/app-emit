# Plan d'Implémentation : Ajout des Fonctionnalités Manquantes (Backend & Frontend)

L'objectif est d'implémenter un par un les cas d'utilisation manquants par rapport à votre conception, en commençant par le système de réservation. Ce plan est divisé en 3 phases pour garantir une intégration étape par étape, sans casser l'existant.

> [!IMPORTANT]
> **User Review Required**
> Veuillez valider ce plan global. Une fois validé, je commencerai immédiatement par exécuter la **Phase 1** (Réservations).

## Phase 1 : Système de Réservation (Étudiant & Admin)
Permettre aux étudiants de réserver une salle, et aux administrateurs de valider ou refuser cette demande.

*   **Backend (`AppEmit.API`)**
    *   **DTOs** : Mise à jour de `ReservationCreateDto` et `ReservationReadDto` (déjà partiellement présents). Ajout d'un `ReservationUpdateStatusDto`.
    *   **Services** : Création de `IReservationService` et `ReservationService`.
        *   Méthodes : `CreerDemande()`, `ObtenirDemandesEnAttente()`, `ValiderDemande()`, `RefuserDemande()`.
        *   *Intégration SignalR* : L'acceptation ou le refus déclenchera une notification temps réel via le `NotificationService` existant.
    *   **Contrôleur** : Création de `ReservationController`.
*   **Frontend (Next.js)**
    *   Création d'une page/modal `DemanderReservation` pour les étudiants.
    *   Mise à jour du tableau de bord Admin pour afficher les réservations "En attente" avec des boutons "Accepter" et "Refuser".

---

## Phase 2 : Fonctionnalités du Professeur
Permettre aux professeurs d'interagir avec leurs séances de cours.

*   **Backend (`AppEmit.API`)**
    *   **Service & Contrôleur (`SeanceCoursService` / `SeanceCoursController`)** :
        *   `MarquerTerminee(int seanceId)` : Passe le booléen `EstTerminee` à `true`.
    *   **Échange de créneau** :
        *   *Création d'une nouvelle Entité `DemandeEchange`* : Pour tracer la demande (Prof Demandeur, Prof Cible, Séance Demandée, Statut).
        *   Service et Contrôleur associés. Notifie le prof cible. Si accepté, met à jour les `SeanceCours`.

> [!NOTE]
> **Question Ouverte (Phase 2)**
> Pour l'échange de créneau, êtes-vous d'accord pour créer une table dédiée `DemandeEchange` dans la base de données afin de garder un historique clair des demandes en attente, acceptées ou refusées ?

---

## Phase 3 : Référentiel Complet et Création de l'Emploi du Temps (Admin)
Mettre en place les formulaires d'administration pour tout le système.

*   **Backend (`AppEmit.API`)**
    *   **CRUD Utilisateurs** : Gérer les comptes (Professeurs, Étudiants, Admin).
    *   **CRUD Structure Académique** : `NiveauController`, `FiliereController`.
    *   **Générateur de Séance** : Endpoint dans `SeanceCoursController` pour lier un Professeur + une Matière + une Salle + un Créneau et créer le planning initial.
*   **Frontend (Next.js)**
    *   Vues d'administration (Tableaux de bord CRUD) pour gérer ces différentes entités facilement.

---

## Plan de Vérification
*   **Automatique** : Compilation du code (C# et TypeScript) et vérification de la création des migrations Entity Framework (notamment si on ajoute `DemandeEchange`).
*   **Fonctionnelle** : 
    *   Postman ou Swagger pour s'assurer que l'étudiant peut poster une réservation, et que l'admin peut la mettre à jour (`En attente` -> `Confirmée`).
    *   Vérification que les notifications sont bien déclenchées lors des changements de statuts.
