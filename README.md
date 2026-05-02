# 📅 App-EMIT - Système de Gestion des Salles et de l'Emploi du Temps

## 📌 Vue d'ensemble

**App-EMIT** est une solution logicielle intégrée conçue pour l'EMIT, permettant de piloter le patrimoine immobilier (salles) et la planification pédagogique. Contrairement à un calendrier statique, le système intègre un **moteur d'exceptions intelligent** qui gère les imprévus (absences, travaux, reports) de manière automatisée sans intervention manuelle répétitive.

---

## 🎯 Objectifs Principaux

- ✅ **Automatisation des Exceptions** : Réinitialisation automatique des créneaux après une annulation définie ou gestion des blocages indéterminés.
- ✅ **Gestion de Conflits** : Moteur d'anti-collision empêchant les doubles réservations de salles ou de professeurs.
- ✅ **Multi-Acteurs** : Interfaces et permissions dédiées pour l'administration, les enseignants et les étudiants.
- ✅ **Traçabilité (Logs)** : Historique complet des modifications pour un audit interne et une sécurité accrue.
- ✅ **Export Professionnel** : Génération de plannings et d'avis officiels au format PDF.

---

## 👥 Acteurs du Système

### 1. **Administrateur** (Super-User)
- Gestion du référentiel (Filières, Parcours, Niveaux, Salles).
- Configuration de la routine hebdomadaire (Emploi du temps fixe).
- Validation des demandes de réservation et gestion globale des exceptions.

### 2. **Professeur**
- Consultation de son emploi du temps personnel en temps réel.
- Déclaration d'indisponibilité (génère une exception automatique au planning).
- Clôture de matière pour libérer prématurément une salle en fin de semestre.

### 3. **Étudiant**
- Consultation du planning dynamique (incluant les cours annulés ou déplacés).
- Réservation de salles pour les travaux de groupe ou activités de clubs.
- Réception de notifications instantanées lors d'un changement d'horaire ou de salle.

---

## 🏗️ Architecture et Conception

### Modèle Conceptuel de Données (MCD)
![Modèle Conceptuel de Données](./conception/MCD.png)

### Modèle Logique de Données (MLD) - PostgreSQL
![Modèle Logique de Données](./conception/MLD.png)

**Éléments Clés :**
*   **EXCEPTION_PLANNING** : Gère les annulations temporaires avec `date_debut` et `date_fin` (si `NULL`, l'annulation est considérée comme indéterminée).
*   **SEANCE_COURS** : Stocke la routine fixe avec des métadonnées de cycle de vie (`date_debut_annee`, `date_fin_annee`).

---

## 📊 Diagrammes de Conception

### Cas d'Utilisation
![Diagramme de Cas d'Utilisation](./conception/Diagrammes%20de%20Cas%20d'Utilisation-G-Salles%20EMIT%20Management.png)

### Séquence : Annulation et Notification
![Diagramme de Séquence](./conception/mermaid-diagram-2026-05-02-212849.png)

### Classes (Entity Framework Core)
![Diagramme de Classes](./conception/Diagramme%20de%20classe.png)

---

## 🛠️ Stack Technique

*   **Backend** : ASP.NET Core 8+ (C#) - Clean Architecture.
*   **Frontend** : Next.js 14+ (TypeScript) - Tailwind CSS & FullCalendar.
*   **Base de Données** : PostgreSQL (Hébergement Supabase ou local).
*   **Temps Réel** : SignalR pour les notifications instantanées.
*   **Authentification** : JWT (JSON Web Tokens).

---

## 📦 Installation et Lancement

### Backend
```bash
dotnet restore
dotnet ef database update
dotnet run