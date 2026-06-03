// types/index.ts

export interface Filiere {
  id: number;
  nom: string;
}

export interface Parcours {
  id: number;
  nom: string;
  filiereId: number;
}

export interface Niveau {
  id: number;
  code: string;      // L1, L2, L3, M1, M2
  parcoursId: number;
  parcours?: Parcours;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'Admin' | 'Prof' | 'Etudiant';
  matricule?: string;
  niveauId?: number;
}

export interface Salle {
  id: number;
  nom: string;
  libelle?: string;
  codeSalle?: string;
  capacite: number;
  type: string;
  estDisponible: boolean;
}

export interface Matiere {
  id: number;
  nom: string;
  code: string;
}

export interface Creneau {
  id: number;
  jour: string;            // Lundi, Mardi, ..., Samedi
  heureDebut: string;      // "08:00:00"
  heureFin: string;        // "10:00:00"
}

export interface SeanceCours {
  id: number;
  matiereId: number;
  profId: number;
  salleId: number;
  creneauId: number;
  parcoursId: number;
  niveauId: number;
  dateDebutAnnee: string;   // YYYY-MM-DD
  dateFinAnnee: string;
  estTermine: boolean;
  couleurAffichage: string; // hex
}

export interface FiliereDto {
  id: number;
  nom: string;
}

export interface MatiereDto {
  id: number;
  code: string;
  nom: string;
  type?: string;
}
export interface DemandeEchangeReadDto {
  id: number;
  demandeurId: number;
  nomDemandeur: string;
  cibleId: number;
  nomCible: string;
  seanceDemandeurId: number;
  seanceCibleId: number;
  statut: string; // EnAttente | Acceptee | Refusee
  motif?: string;
  dateDemande: string;
  dateReponse?: string;
}

export interface DemandeEchangeCreateDto {
  demandeurId: number;
  cibleId: number;
  seanceDemandeurId: number;
  seanceCibleId: number;
  motif?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  roles: string[];
  matricule?: string;
  niveauId?: number;
  expiration: string;
}

export interface UtilisateurDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  matricule?: string;
}

export interface SeancePlanningDto {
  id: number;
  matiereNom: string;
  matiereCode: string;
  professeurNomComplet: string;
  professeurId: number;
  salleNom: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  dateOccurrence: string;
  statut: string;
  couleurAffichage?: string;
  motifException?: string;
  parcoursId?: number;
  niveauId?: number;
}

export interface PlanningHebdoResponse {
  seances: SeancePlanningDto[];
  lundi: string;
  samedi: string;
}

export interface Notification {
  id: number;
  utilisateurId: number;
  message: string;
  dateEnvoi: string;
  estLu: boolean;
}

export interface CreerExceptionDto {
  seanceCoursId: number;
  dateDebut: string;
  dateFin?: string;
  motif?: string;
  nouvelleSalleId?: number;
}

export interface EvenementReservation {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
  session: string;
  statut: string;
  demandeurId: number;
  demandeurNom: string;
  salleId: number;
  salleLibelle: string;
}

export interface ReservationCreateDto {
  titre: string;
  type: string;
  datePrecise: string;
  salleId: number;
  session?: string;
}

export interface ReservationReadDto {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
  session: string;
  statut: string;
  demandeurId: number;
  demandeurNom: string;
  salleId: number;
  salleLibelle: string;
}

export interface ExceptionPlanning {
  id?: number;
  seanceCoursId?: number;
  dateDebut: string;
  dateFin?: string;
  typeException: string;
  motif?: string;
  nouvelleSalleId?: number;
  dateCreation?: string;
}

export interface GenerationSeancePayload {
  parcoursId: number;
  niveauId: number;
  matiereId: number;
  profId: number;
  salleId: number;
  creneauId: number;
  dateDebut: string;        // YYYY-MM-DD
  dateFin: string;          // YYYY-MM-DD
  joursSelectionnes?: string[];

}