'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Clock3,
  Plus,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Trash2,
  Building2,
  Users,
  Wifi,
  Tv,
  Presentation,
  Wind,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';

// Types
interface Salle {
  id: number;
  codeSalle: string;
  libelle: string;
  capacite: number;
  equipements?: string;
  estActive: boolean;
}

interface Reservation {
  id: number;
  titre: string;
  type: string;
  datePrecise: string;
  session: string;
  statut: string;
  demandeurId: number;
  demandeurNom: string;
  demandeurPrenom: string;
  salleId: number;
  salleLibelle: string;
  salleCode?: string;
}

interface CreateReservationDto {
  titre: string;
  datePrecise: string;
  session: string;
  salleId: number;
}

// Constantes
const SESSIONS = [
  { value: 'Matin', label: 'Matin (08h - 12h)', icon: Clock3 },
  { value: 'Après-midi', label: 'Après-midi (13h - 17h)', icon: Clock },
];

const STATUTS: Record<string, { label: string; color: string; icon: any }> = {
  'En attente': { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: Clock3 },
  'Confirmée': { label: 'Confirmée', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle },
  'Annulée': { label: 'Annulée', color: 'bg-red-500/10 text-red-600 border-red-200', icon: XCircle },
};

// Composant de carte de réservation
const ReservationCard = ({ 
  reservation, 
  isAdmin, 
  onView, 
  onApprove, 
  onReject, 
  onCancel 
}: { 
  reservation: Reservation; 
  isAdmin: boolean; 
  onView: (r: Reservation) => void; 
  onApprove?: (id: number) => void; 
  onReject?: (id: number) => void; 
  onCancel?: (id: number) => void; 
}) => {
  const statut = STATUTS[reservation.statut as keyof typeof STATUTS] || STATUTS['En attente'];
  const dateFormatted = new Date(reservation.datePrecise).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-5">
        {/* En-tête avec titre et statut */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{reservation.titre}</h3>
            <p className="text-sm text-gray-500">#{reservation.id}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statut.color}`}>
            <statut.icon size={12} />
            {statut.label}
          </span>
        </div>

        {/* Détails */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <span>{dateFormatted}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span>{reservation.session}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin size={14} className="text-gray-400" />
            <span>{reservation.salleLibelle} {reservation.salleCode && `(${reservation.salleCode})`}</span>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users size={14} className="text-gray-400" />
              <span>Demandeur: {reservation.demandeurPrenom} {reservation.demandeurNom}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(reservation)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye size={16} />
            Détails
          </button>
          
          {isAdmin && reservation.statut === 'En attente' && (
            <>
              <button
                onClick={() => onApprove?.(reservation.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ThumbsUp size={16} />
                Approuver
              </button>
              <button
                onClick={() => onReject?.(reservation.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <ThumbsDown size={16} />
                Rejeter
              </button>
            </>
          )}
          
          {!isAdmin && reservation.statut === 'En attente' && (
            <button
              onClick={() => onCancel?.(reservation.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
              Annuler
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Composant modal de création
const CreateReservationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  salles, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: CreateReservationDto) => Promise<void>; 
  salles: Salle[]; 
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<CreateReservationDto>({
    titre: '',
    datePrecise: '',
    session: 'Matin',
    salleId: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.datePrecise) newErrors.datePrecise = 'La date est requise';
    else {
      const selectedDate = new Date(formData.datePrecise);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.datePrecise = 'La date ne peut pas être dans le passé';
    }
    if (!formData.salleId) newErrors.salleId = 'Veuillez sélectionner une salle';
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
    setFormData({ titre: '', datePrecise: '', session: 'Matin', salleId: 0 });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Nouvelle réservation</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'événement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Réunion Club Robotique"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none transition-all ${
                    errors.titre ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.titre && <p className="text-xs text-red-500 mt-1">{errors.titre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.datePrecise}
                  onChange={(e) => setFormData({ ...formData, datePrecise: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none transition-all ${
                    errors.datePrecise ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.datePrecise && <p className="text-xs text-red-500 mt-1">{errors.datePrecise}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SESSIONS.map((session) => (
                    <button
                      key={session.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, session: session.value })}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        formData.session === session.value
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <session.icon size={16} />
                      {session.value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.salleId}
                  onChange={(e) => setFormData({ ...formData, salleId: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none transition-all ${
                    errors.salleId ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value={0}>Sélectionner une salle</option>
                  {salles.filter(s => s.estActive).map((salle) => (
                    <option key={salle.id} value={salle.id}>
                      {salle.libelle} ({salle.codeSalle}) - Cap: {salle.capacite} pers.
                    </option>
                  ))}
                </select>
                {errors.salleId && <p className="text-xs text-red-500 mt-1">{errors.salleId}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Créer la demande
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Composant modal de détails
const ReservationDetailModal = ({ 
  reservation, 
  isOpen, 
  onClose,
  isAdmin,
  onApprove,
  onReject
}: { 
  reservation: Reservation | null; 
  isOpen: boolean; 
  onClose: () => void;
  isAdmin: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}) => {
  if (!reservation || !isOpen) return null;

  const statut = STATUTS[reservation.statut as keyof typeof STATUTS] || STATUTS['En attente'];
  const dateFormatted = new Date(reservation.datePrecise).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Détails de la réservation</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">ID #{reservation.id}</p>
                  <h3 className="font-bold text-gray-900 text-lg mt-1">{reservation.titre}</h3>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statut.color}`}>
                  <statut.icon size={12} />
                  {statut.label}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="font-medium">{dateFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Session</p>
                    <p className="font-medium">{reservation.session}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Salle</p>
                    <p className="font-medium">{reservation.salleLibelle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Demandeur</p>
                    <p className="font-medium">{reservation.demandeurPrenom} {reservation.demandeurNom}</p>
                    <p className="text-xs text-gray-400">ID: {reservation.demandeurId}</p>
                  </div>
                </div>
              </div>

              {isAdmin && reservation.statut === 'En attente' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { onApprove?.(reservation.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <ThumbsUp size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => { onReject?.(reservation.id); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <ThumbsDown size={18} />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Page principale
export default function ReservationsPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'Admin';
  const userId = user?.id;

  // États
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Charger les salles
  const fetchSalles = useCallback(async () => {
    try {
      const response = await api.get('/Salles');
      setSalles(response.data);
    } catch (err) {
      console.error('Erreur chargement salles:', err);
    }
  }, []);

  // Charger les réservations
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (isAdmin) {
        url = '/Reservation';
      } else {
        url = `/Reservation/utilisateur/${userId}`;
      }
      const response = await api.get(url);
      setReservations(response.data);
    } catch (err: any) {
      console.error('Erreur chargement réservations:', err);
      setError(err.response?.data?.message || 'Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId]);

  // Créer une réservation
  const handleCreateReservation = async (data: CreateReservationDto) => {
    try {
      await api.post('/Reservation', data);
      await fetchReservations();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de la création';
      alert(message);
      throw err;
    }
  };

  // Approuver une réservation (Admin)
  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/Reservation/${id}/statut`, { statut: 'Confirmée' });
      await fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  };

  // Rejeter une réservation (Admin)
  const handleReject = async (id: number) => {
    const motif = prompt('Motif du rejet (optionnel):');
    try {
      await api.patch(`/Reservation/${id}/statut`, { statut: 'Annulée' });
      await fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  // Annuler une réservation (Étudiant)
  const handleCancel = async (id: number) => {
    if (!confirm('Voulez-vous vraiment annuler cette demande ?')) return;
    try {
      await api.patch(`/Reservation/${id}/statut`, { statut: 'Annulée' });
      await fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  // Filtrer les réservations
  const filteredReservations = reservations.filter(res => {
    const matchStatut = filterStatut === 'all' || res.statut === filterStatut;
    const matchSearch = res.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        res.salleLibelle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatut && matchSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Initialisation
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchSalles();
    fetchReservations();
  }, [token, router, fetchSalles, fetchReservations]);

  // Statistiques
  const stats = {
    total: reservations.length,
    enAttente: reservations.filter(r => r.statut === 'En attente').length,
    approuve: reservations.filter(r => r.statut === 'Confirmée').length,
    rejete: reservations.filter(r => r.statut === 'Annulée').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Réservations de salles</h1>
              <p className="text-gray-500 text-sm mt-1">
                Gérez vos demandes de réservation pour les clubs et événements
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Nouvelle réservation
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.approuve}</p>
            <p className="text-sm text-gray-500">Approuvées</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-red-600">{stats.rejete}</p>
            <p className="text-sm text-gray-500">Rejetées</p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'En attente', 'Confirmée', 'Annulée'].map((statut) => (
                <button
                  key={statut}
                  onClick={() => setFilterStatut(statut)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filterStatut === statut
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {statut === 'all' ? 'Tous' : statut}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des réservations */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <button onClick={fetchReservations} className="mt-3 text-red-600 underline">
              Réessayer
            </button>
          </div>
        ) : paginatedReservations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune réservation trouvée</p>
            {!isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                <Plus size={16} />
                Créer une réservation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {paginatedReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  isAdmin={isAdmin}
                  onView={(r) => {
                    setSelectedReservation(r);
                    setShowDetailModal(true);
                  }}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCancel={handleCancel}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateReservationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateReservation}
        salles={salles}
        isLoading={loading}
      />

      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReservation(null);
        }}
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}