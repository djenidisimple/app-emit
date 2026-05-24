export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  roles?: string[];
  niveauId?: number;
}

export interface Salle {
  id: number;
  codeSalle: string;
  libelle: string;
  capacite: number;
  equipements?: string;
  estActive: boolean;
  type: string;
  nombreSeances: number;
  statut: string;
}

export interface Matiere {
  id: number;
  code: string;
  nom: string;
  type?: string;
}

export interface Creneau {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface SeancePlanningDto {
  id: number;
  matiereNom: string;
  matiereCode: string;
  professeurNomComplet: string;
  salleNom: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  dateOccurrence: string;
  statut: string;
  motifException?: string;
}

export interface PlanningHebdoResponse {
  lundi: string;
  samedi: string;
  seances: SeancePlanningDto[];
}

export interface ExceptionPlanning {
  id?: number;
  seanceCoursId: number;
  dateDebut: string;
  dateFin?: string;
  typeException: string;
  motif?: string;
  nouvelleSalleId?: number;
}

export interface Notification {
  id: number;
  utilisateurId: number;
  message: string;
  dateEnvoi: string;
  estLu: boolean;
}

export interface AuthResponse {
  token: string;
  nom: string;
  prenom: string;
  email: string;
  roles: string[];
  matricule?: string;
  niveauId?: number;
  expiration: string;
}

export interface EvenementReservation {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
  salleId: number;
}

export interface ReservationReadDto {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
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
}

export interface UtilisateurDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  role?: string;
  niveauId?: number;
  niveauCode?: string;
}

export interface NiveauDto {
  id: number;
  code: string;
  parcoursId: number;
  parcoursNom?: string;
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