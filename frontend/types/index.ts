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
  capacite: number;
  type: string;      // TP, TD, Amphi
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