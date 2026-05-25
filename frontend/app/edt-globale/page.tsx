'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Plus,
  Edit,
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Calendar as CalendarIcon,
  Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import Navbar from '@/components/layout/Navbar';

// ============================================
// TYPES
// ============================================

interface SeancePlanningDto {
  id: number;
  matiereId: number;
  matiereNom: string;
  matiereCode: string;
  professeurId: number;
  professeurNomComplet: string;
  salleId: number;
  salleNom: string;
  salleCode: string;
  creneauId: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  estTerminee: boolean;
  statut?: string;
}

interface SeanceCoursReadDto {
  id: number;
  matiereId: number;
  matiereNom: string;
  professeurId: number;
  professeurNom: string;
  professeurPrenom: string;
  salleId: number;
  salleLibelle: string;
  creneauId: number;
  creneauJour: string;
  creneauHeureDebut: string;
  creneauHeureFin: string;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  estTerminee: boolean;
}

interface SeanceCoursUpdateDto {
  matiereId?: number;
  professeurId?: number;
  salleId?: number;
  creneauId?: number;
  dateDebutAnnee?: string;
  dateFinAnnee?: string;
}

interface PlanningHebdoResponse {
  seances: SeancePlanningDto[];
  semaineDu: string;
  semaineAu: string;
}

interface Salle {
  id: number;
  codeSalle: string;
  libelle: string;
  capacite: number;
  estActive: boolean;
}

interface Matiere {
  id: number;
  code: string;
  nom: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface Creneau {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

interface ExceptionDto {
  seanceCoursId: number;
  dateDebut: string;
  dateFin?: string;
  typeException: string;
  motif?: string;
  nouvelleSalleId?: number;
}

// ============================================
// CONSTANTES
// ============================================

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7h à 19h
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const STATUTS = {
  normal: { label: 'Normal', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  annule: { label: 'Annulé', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  reporte: { label: 'Reporté', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  termine: { label: 'Terminé', color: 'bg-green-500/10 text-green-400 border-green-500/20' }
};

// ============================================
// MODAL DE CRÉATION/MODIFICATION DE SÉANCE
// ============================================

const SeanceFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  matieres,
  professeurs,
  salles,
  creneaux,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: SeanceCoursReadDto | null;
  isEditing: boolean;
  matieres: Matiere[];
  professeurs: Utilisateur[];
  salles: Salle[];
  creneaux: Creneau[];
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    matiereId: 0,
    professeurId: 0,
    salleId: 0,
    creneauId: 0,
    dateDebutAnnee: '',
    dateFinAnnee: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        matiereId: initialData.matiereId,
        professeurId: initialData.professeurId,
        salleId: initialData.salleId,
        creneauId: initialData.creneauId,
        dateDebutAnnee: initialData.dateDebutAnnee?.split('T')[0] || '',
        dateFinAnnee: initialData.dateFinAnnee?.split('T')[0] || ''
      });
    } else {
      setFormData({
        matiereId: 0,
        professeurId: 0,
        salleId: 0,
        creneauId: 0,
        dateDebutAnnee: new Date().toISOString().split('T')[0],
        dateFinAnnee: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
      });
    }
  }, [initialData, isEditing, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.matiereId) newErrors.matiereId = 'Veuillez sélectionner une matière';
    if (!formData.professeurId) newErrors.professeurId = 'Veuillez sélectionner un professeur';
    if (!formData.salleId) newErrors.salleId = 'Veuillez sélectionner une salle';
    if (!formData.creneauId) newErrors.creneauId = 'Veuillez sélectionner un créneau';
    if (!formData.dateDebutAnnee) newErrors.dateDebutAnnee = 'Date de début requise';
    if (!formData.dateFinAnnee) newErrors.dateFinAnnee = 'Date de fin requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? 'Modifier la séance' : 'Nouvelle séance'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Matière <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.matiereId}
                    onChange={(e) => setFormData({ ...formData, matiereId: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none transition-all text-white ${
                      errors.matiereId ? 'border-red-500' : 'border-gray-700'
                    }`}
                  >
                    <option value={0}>Sélectionner une matière</option>
                    {matieres.map(m => (
                      <option key={m.id} value={m.id}>{m.code} - {m.nom}</option>
                    ))}
                  </select>
                  {errors.matiereId && <p className="text-xs text-red-400 mt-1">{errors.matiereId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Professeur <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.professeurId}
                    onChange={(e) => setFormData({ ...formData, professeurId: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none transition-all text-white ${
                      errors.professeurId ? 'border-red-500' : 'border-gray-700'
                    }`}
                  >
                    <option value={0}>Sélectionner un professeur</option>
                    {professeurs.map(p => (
                      <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                    ))}
                  </select>
                  {errors.professeurId && <p className="text-xs text-red-400 mt-1">{errors.professeurId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Salle <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.salleId}
                    onChange={(e) => setFormData({ ...formData, salleId: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none transition-all text-white ${
                      errors.salleId ? 'border-red-500' : 'border-gray-700'
                    }`}
                  >
                    <option value={0}>Sélectionner une salle</option>
                    {salles.filter(s => s.estActive).map(s => (
                      <option key={s.id} value={s.id}>{s.libelle} ({s.codeSalle}) - Cap: {s.capacite}</option>
                    ))}
                  </select>
                  {errors.salleId && <p className="text-xs text-red-400 mt-1">{errors.salleId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Créneau <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.creneauId}
                    onChange={(e) => setFormData({ ...formData, creneauId: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none transition-all text-white ${
                      errors.creneauId ? 'border-red-500' : 'border-gray-700'
                    }`}
                  >
                    <option value={0}>Sélectionner un créneau</option>
                    {creneaux.map(c => (
                      <option key={c.id} value={c.id}>{c.jour} - {c.heureDebut} à {c.heureFin}</option>
                    ))}
                  </select>
                  {errors.creneauId && <p className="text-xs text-red-400 mt-1">{errors.creneauId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date début (année académique)
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebutAnnee}
                    onChange={(e) => setFormData({ ...formData, dateDebutAnnee: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date fin (année académique)
                  </label>
                  <input
                    type="date"
                    value={formData.dateFinAnnee}
                    onChange={(e) => setFormData({ ...formData, dateFinAnnee: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {isEditing ? 'Mettre à jour' : 'Créer la séance'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MODAL D'EXCEPTION (ANNULATION/REPORT)
// ============================================

const ExceptionModal = ({
  isOpen,
  onClose,
  onSubmit,
  seance,
  salles,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExceptionDto) => Promise<void>;
  seance: SeancePlanningDto | null;
  salles: Salle[];
  isLoading: boolean;
}) => {
  const [typeException, setTypeException] = useState<'annulation' | 'report' | 'indisponible'>('annulation');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [motif, setMotif] = useState('');
  const [nouvelleSalleId, setNouvelleSalleId] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (seance) {
      setDateDebut(new Date().toISOString().split('T')[0]);
      setDateFin(new Date().toISOString().split('T')[0]);
    }
  }, [seance, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seance) return;
    
    setSubmitting(true);
    await onSubmit({
      seanceCoursId: seance.id,
      dateDebut,
      dateFin: typeException === 'indisponible' ? dateFin : undefined,
      typeException: typeException === 'annulation' ? 'Annulation' : typeException === 'report' ? 'Report' : 'Indisponibilité',
      motif: motif || undefined,
      nouvelleSalleId: typeException === 'report' && nouvelleSalleId ? nouvelleSalleId : undefined
    });
    setSubmitting(false);
    onClose();
  };

  if (!isOpen || !seance) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Gérer l'exception</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="bg-gray-800 rounded-lg p-3 mb-2">
                <p className="text-sm text-gray-400">{seance.matiereNom}</p>
                <p className="text-white font-medium">{seance.jour} • {seance.heureDebut} - {seance.heureFin}</p>
                <p className="text-sm text-gray-400">{seance.salleNom}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type d'exception
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTypeException('annulation')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      typeException === 'annulation'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Annulation
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeException('report')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      typeException === 'report'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeException('indisponible')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      typeException === 'indisponible'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Indisponible
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>

              {typeException === 'indisponible' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              )}

              {typeException === 'report' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nouvelle salle (optionnel)
                  </label>
                  <select
                    value={nouvelleSalleId}
                    onChange={(e) => setNouvelleSalleId(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value={0}>Même salle</option>
                    {salles.filter(s => s.estActive && s.id !== seance.salleId).map(s => (
                      <option key={s.id} value={s.id}>{s.libelle} ({s.codeSalle})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Motif (optionnel)
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                  placeholder="Expliquer la raison..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Confirmer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// COMPOSANT CARTE DE SÉANCE (POUR MOBILE)
// ============================================

const SeanceCard = ({ seance, onEdit, onException }: { 
  seance: SeancePlanningDto; 
  onEdit: (s: SeancePlanningDto) => void;
  onException: (s: SeancePlanningDto) => void;
}) => {
  const statut = seance.estTerminee ? STATUTS.termine : STATUTS.normal;
  
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-gray-400">{seance.jour}</p>
          <p className="font-semibold text-white">{seance.matiereNom}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statut.color}`}>
          {statut.label}
        </span>
      </div>
      <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
        <Clock size={12} /> {seance.heureDebut} - {seance.heureFin}
      </p>
      <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
        <MapPin size={12} /> {seance.salleNom}
      </p>
      <p className="text-sm text-gray-400 flex items-center gap-2 mb-3">
        <User size={12} /> {seance.professeurNomComplet}
      </p>
      <div className="flex gap-2">
        <button onClick={() => onEdit(seance)} className="flex-1 py-2 bg-gray-700 rounded-lg text-white text-sm hover:bg-gray-600">
          Modifier
        </button>
        <button onClick={() => onException(seance)} className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30">
          Exception
        </button>
      </div>
    </div>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

export default function PlanningPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'Admin';

  // États
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [weekRange, setWeekRange] = useState({ du: '', au: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Données pour formulaires
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [professeurs, setProfesseurs] = useState<Utilisateur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  
  // Filtres
  const [showFilters, setShowFilters] = useState(false);
  const [filterSalleId, setFilterSalleId] = useState<number | null>(null);
  const [filterProfesseurId, setFilterProfesseurId] = useState<number | null>(null);
  
  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<SeancePlanningDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  const fetchCreneaux = useCallback(async () => {
    try {
      const response = await api.get<any[]>('/Creneau');
      setCreneaux(response);
    } catch (err) {
      console.error('Erreur chargement créneaux:', err);
    }
  }, []);

  const fetchMatieres = useCallback(async () => {
    try {
      const response = await api.get<any[]>('/matieres');
      setMatieres(response);
    } catch (err) {
      console.error('Erreur chargement matières:', err);
    }
  }, []);

  const fetchProfesseurs = useCallback(async () => {
    try {
      const response = await api.get<any[]>('/Utilisateur');
      const professeursList = response.filter((u: Utilisateur) => u.role === 'Professeur');
      setProfesseurs(professeursList);
    } catch (err) {
      console.error('Erreur chargement professeurs:', err);
    }
  }, []);

  const fetchSalles = useCallback(async () => {
    try {
      const response = await api.get<any[]>('/Salles');
      setSalles(response);
    } catch (err) {
      console.error('Erreur chargement salles:', err);
    }
  }, []);

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 5);
      
      setWeekRange({
        du: startOfWeek.toLocaleDateString('fr-FR'),
        au: endOfWeek.toLocaleDateString('fr-FR')
      });
      
      const params: any = { StartDate: startOfWeek.toISOString() };
      if (filterSalleId) params.SalleId = filterSalleId;
      if (filterProfesseurId) params.ProfesseurId = filterProfesseurId;
      
      const response = await api.get<PlanningHebdoResponse>('/Planning/hebdo', { params });
      setSeances(response.seances || []);
    } catch (err: any) {
      console.error('Erreur chargement planning:', err);
      setError(err.response?.data?.message || 'Impossible de charger le planning');
    } finally {
      setLoading(false);
    }
  }, [currentDate, filterSalleId, filterProfesseurId]);

  // ============================================
  // ACTIONS CRUD
  // ============================================

  const handleCreateSeance = async (data: any) => {
    setSubmitting(true);
    try {
      await api.post('/SeanceCours', data);
      await fetchPlanning();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSeance = async (id: number, data: SeanceCoursUpdateDto) => {
    setSubmitting(true);
    try {
      await api.put(`/SeanceCours/${id}`, data);
      await fetchPlanning();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleException = async (data: ExceptionDto) => {
    setSubmitting(true);
    try {
      let endpoint = '';
      switch (data.typeException) {
        case 'Annulation':
          endpoint = '/Exception/annuler';
          break;
        case 'Report':
          endpoint = '/Exception/reporter';
          break;
        case 'Indisponibilité':
          endpoint = '/Exception/indisponible';
          break;
        default:
          endpoint = '/Exception/annuler';
      }
      await api.post(endpoint, data);
      await fetchPlanning();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du traitement de l\'exception');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarquerTerminee = async (id: number) => {
    try {
      await api.patch(`/SeanceCours/${id}/terminer`);
      await fetchPlanning();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  // ============================================
  // EXPORT
  // ============================================

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const blob = await api.post<Blob>(`/Document/export/${format}`, {
        DateDebut: startOfWeek.toISOString(),
        DateFin: new Date(startOfWeek.setDate(startOfWeek.getDate() + 6)).toISOString(),
        SalleId: filterSalleId || undefined,
        ProfesseurId: filterProfesseurId || undefined
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `planning_${format === 'pdf' ? 'pdf' : 'excel'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erreur lors de l\'export');
    }
  };

  // ============================================
  // UTILITAIRES AFFICHAGE PLANNING
  // ============================================

  const getPosition = (heureDebut: string, heureFin: string) => {
    const [startHour, startMin] = heureDebut.split(':').map(Number);
    const [endHour, endMin] = heureFin.split(':').map(Number);
    const start = startHour + startMin / 60;
    const end = endHour + endMin / 60;
    
    const top = ((start - 7) / 13) * 100;
    const height = ((end - start) / 13) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const getSeanceStyle = (seance: SeancePlanningDto) => {
    if (seance.estTerminee) return 'bg-green-500/10 border-l-4 border-green-500';
    if (seance.statut === 'Annule') return 'bg-red-500/10 border-l-4 border-red-500';
    if (seance.statut === 'Reporte') return 'bg-yellow-500/10 border-l-4 border-yellow-500';
    return 'bg-blue-500/10 border-l-4 border-blue-500';
  };

  // ============================================
  // INITIALISATION
  // ============================================

  useEffect(() => {
    fetchPlanning();
  }, [currentDate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          EDT Globale
            </h1>
            <p className="text-gray-400 mt-1">Planning hebdomadaire • {weekRange.du} - {weekRange.au}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm flex items-center gap-2 ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}
            >
              <Filter size={16} /> Filtres
            </button>
            {isAdmin && (
              <button
                onClick={() => { setIsEditing(false); setSelectedSeance(null); setShowFormModal(true); }}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Nouvelle séance
              </button>
            )}
          </div>
        </div>

        {/* Navigation semaine */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"
            >
              Aujourd'hui
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Salle</label>
                <select
                  value={filterSalleId || ''}
                  onChange={(e) => setFilterSalleId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                >
                  <option value="">Toutes les salles</option>
                  {salles.map(s => (
                    <option key={s.id} value={s.id}>{s.libelle} ({s.codeSalle})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Professeur</label>
                <select
                  value={filterProfesseurId || ''}
                  onChange={(e) => setFilterProfesseurId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                >
                  <option value="">Tous les professeurs</option>
                  {professeurs.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleExport.bind(null, 'pdf')}
                  className="flex-1 px-3 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 text-sm flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> PDF
                </button>
                <button
                  onClick={handleExport.bind(null, 'excel')}
                  className="flex-1 px-3 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 text-sm flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet size={16} /> Excel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grille du planning */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={48} className="animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-red-400">{error}</p>
            <button onClick={fetchPlanning} className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 flex items-center gap-2">
              <RefreshCw size={16} /> Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <div className="min-w-[800px]">
              {/* En-tête des jours */}
              <div className="grid grid-cols-[60px_repeat(6,1fr)] bg-gray-900 border-b border-gray-800">
                <div className="p-3 text-xs text-gray-500 font-medium">Horaire</div>
                {DAYS.map(day => (
                  <div key={day} className="p-3 text-xs text-gray-400 font-medium text-center border-l border-gray-800">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille horaire */}
              <div className="relative" style={{ height: '650px' }}>
                {/* Lignes horaires */}
                <div className="absolute inset-0 grid grid-cols-[60px_repeat(6,1fr)]">
                  {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                      <div className="border-b border-gray-800/50 text-xs text-gray-600 p-1 text-right pr-2">
                        {hour}h
                      </div>
                      {DAYS.map(day => (
                        <div key={`${hour}-${day}`} className="border-b border-l border-gray-800/50" />
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                {/* Séances */}
                {seances.map(seance => {
                  const pos = getPosition(seance.heureDebut, seance.heureFin);
                  const dayIndex = DAYS.indexOf(seance.jour);
                  if (dayIndex === -1) return null;
                  return (
                    <div
                      key={seance.id}
                      className={`absolute cursor-pointer rounded-lg p-2 overflow-hidden transition-all hover:ring-2 hover:ring-white/20 ${getSeanceStyle(seance)}`}
                      style={{
                        left: `calc(60px + ${dayIndex} * (100% - 60px) / 6 + 2px)`,
                        width: `calc((100% - 60px) / 6 - 4px)`,
                        top: pos.top,
                        height: pos.height,
                        minHeight: '28px'
                      }}
                      onClick={() => {
                        setSelectedSeance(seance);
                        if (isAdmin) {
                          setIsEditing(true);
                          setShowFormModal(true);
                        }
                      }}
                    >
                      <p className="text-xs font-semibold truncate">{seance.matiereNom}</p>
                      <p className="text-[10px] text-gray-400 truncate">{seance.professeurNomComplet}</p>
                      <p className="text-[10px] text-gray-500 truncate">{seance.salleNom}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Vue mobile - cartes */}
        <div className="mt-6 block sm:hidden space-y-3">
          {seances.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">Aucune séance cette semaine</p>
          )}
          {seances.map(seance => (
            <SeanceCard
              key={seance.id}
              seance={seance}
              onEdit={(s) => { setSelectedSeance(s); setIsEditing(true); setShowFormModal(true); }}
              onException={(s) => { setSelectedSeance(s); setShowExceptionModal(true); }}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <SeanceFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setSelectedSeance(null); }}
        onSubmit={async (data) => {
          if (isEditing && selectedSeance) {
            await handleUpdateSeance(selectedSeance.id, data);
          } else {
            await handleCreateSeance(data);
          }
        }}
        initialData={selectedSeance as any}
        isEditing={isEditing}
        matieres={matieres}
        professeurs={professeurs}
        salles={salles}
        creneaux={creneaux}
        isLoading={submitting}
      />

      <ExceptionModal
        isOpen={showExceptionModal}
        onClose={() => { setShowExceptionModal(false); setSelectedSeance(null); }}
        onSubmit={handleException}
        seance={selectedSeance}
        salles={salles}
        isLoading={submitting}
      />
    </div>
  );
}