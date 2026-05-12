export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  role: 'Admin' | 'Professeur' | 'Etudiant';
  niveauId?: number;
}

export interface Salle {
  id: number;
  codeSalle: string;
  libelle: string;
  capacite: number;
  type: string;
  estDisponible: boolean;
}

export interface Matiere {
  id: number;
  code: string;
  nom: string;
  type: string;
}

export interface Creneau {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface SeanceCours {
  id: number;
  matiereId: number;
  matiere: Matiere;
  professeurId: number;
  professeur: Utilisateur;
  salleId: number;
  salle: Salle;
  creneauId: number;
  creneau: Creneau;
  couleurAffichage?: string;
  statut: 'Confirmé' | 'Annulé' | 'Reporté';
}

export interface ExceptionPlanning {
  id?: number;
  seanceCoursId: number;
  dateDebut: string;
  dateFin?: string;
  typeException: 'Annulation' | 'Report' | 'Indisponibilité';
  motif: string;
  nouvelleSalleId?: number;
}

export interface Notification {
  id: number;
  utilisateurId: number;
  message: string;
  dateEnvoi: string;
  estLu: boolean;
}

export interface EvenementReservation {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
  salleId: number;
}
