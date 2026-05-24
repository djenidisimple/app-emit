'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  Users,
  Wifi,
  Tv,
  Presentation,
  Wind,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Activity,
  Power,
  PowerOff,
  Monitor,
  Mic,
  Video,
  MapPin,
  Hash,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

// Types
interface Salle {
  id: number;
  codeSalle: string;
  libelle: string;
  capacite: number;
  equipements?: string;
  estActive: boolean;
  type?: string;
}

interface SalleCreateDto {
  codeSalle: string;
  libelle: string;
  capacite: number;
  equipements?: string;
  estActive: boolean;
  type?: string;
}

interface SalleUpdateDto {
  codeSalle: string;
  libelle: string;
  capacite: number;
  equipements?: string;
  estActive: boolean;
  type?: string;
}

interface Disponibilite {
  date: string;
  session: string;
  estLibre: boolean;
  reservationTitre?: string;
}

// Constantes
const TYPES_SALLE = [
  { value: 'Amphithéâtre', label: 'Amphithéâtre', icon: Presentation },
  { value: 'Salle de cours', label: 'Salle de cours', icon: Building2 },
  { value: 'Laboratoire', label: 'Laboratoire', icon: Monitor },
  { value: 'Salle de réunion', label: 'Salle de réunion', icon: Users },
  { value: 'Salle informatique', label: 'Salle informatique', icon: Monitor },
];

const EQUIPEMENTS_OPTIONS = [
  { value: 'Video projecteur', label: 'Vidéo projecteur', icon: Video },
  { value: 'Tableau blanc', label: 'Tableau blanc', icon: Presentation },
  { value: 'Climatisation', label: 'Climatisation', icon: Wind },
  { value: 'Wifi', label: 'WiFi', icon: Wifi },
  { value: 'Micro', label: 'Micro', icon: Mic },
  { value: 'Enceintes', label: 'Enceintes', icon: Tv },
];

const SESSIONS = ['Matin', 'Après-midi'];

// Composant carte salle
const SalleCard = ({ 
  salle, 
  isAdmin, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  salle: Salle; 
  isAdmin: boolean; 
  onView: (s: Salle) => void; 
  onEdit: (s: Salle) => void; 
  onDelete: (id: number) => void;
}) => {
  const equipementsList = salle.equipements?.split(',').map(e => e.trim()) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
        !salle.estActive ? 'opacity-60 bg-gray-50' : 'border-gray-200'
      }`}
    >
      <div className="p-5">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Building2 size={20} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{salle.libelle}</h3>
              <p className="text-xs text-gray-400 font-mono">{salle.codeSalle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!salle.estActive && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                Inactive
              </span>
            )}
            {salle.type && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {salle.type}
              </span>
            )}
          </div>
        </div>

        {/* Détails */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Users size={14} className="text-gray-400" />
            <span>Capacité: <strong>{salle.capacite}</strong> personnes</span>
          </div>
          {equipementsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {equipementsList.slice(0, 3).map((eq, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {eq}
                </span>
              ))}
              {equipementsList.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                  +{equipementsList.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(salle)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye size={16} />
            Détails
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(salle)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit size={16} />
                Modifier
              </button>
              <button
                onClick={() => onDelete(salle.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Modal de création/modification
const SalleFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isEditing,
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: SalleCreateDto | SalleUpdateDto) => Promise<void>; 
  initialData?: Salle | null;
  isEditing: boolean;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<SalleCreateDto>({
    codeSalle: '',
    libelle: '',
    capacite: 0,
    equipements: '',
    estActive: true,
    type: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SalleCreateDto, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedEquipements, setSelectedEquipements] = useState<string[]>([]);

  useEffect(() => {
    if (initialData && isEditing) {
      const equipementsArray = initialData.equipements?.split(',').map(e => e.trim()) || [];
      setSelectedEquipements(equipementsArray);
      setFormData({
        codeSalle: initialData.codeSalle,
        libelle: initialData.libelle,
        capacite: initialData.capacite,
        equipements: initialData.equipements || '',
        estActive: initialData.estActive,
        type: initialData.type || '',
      });
    } else {
      setSelectedEquipements([]);
      setFormData({
        codeSalle: '',
        libelle: '',
        capacite: 0,
        equipements: '',
        estActive: true,
        type: '',
      });
    }
  }, [initialData, isEditing, isOpen]);

  const validate = () => {
    const newErrors: Partial<Record<keyof SalleCreateDto, string>> = {};
    if (!formData.codeSalle.trim()) newErrors.codeSalle = 'Le code salle est requis';
    if (!formData.libelle.trim()) newErrors.libelle = 'Le libellé est requis';
    if (formData.capacite <= 0) newErrors.capacite = 'La capacité doit être supérieure à 0';
    if (formData.capacite > 500) newErrors.capacite = 'La capacité ne peut pas dépasser 500';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEquipementToggle = (equipement: string) => {
    const newSelection = selectedEquipements.includes(equipement)
      ? selectedEquipements.filter(e => e !== equipement)
      : [...selectedEquipements, equipement];
    setSelectedEquipements(newSelection);
    setFormData({ ...formData, equipements: newSelection.join(', ') });
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Modifier la salle' : 'Nouvelle salle'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Code et Libellé */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code salle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.codeSalle}
                      onChange={(e) => setFormData({ ...formData, codeSalle: e.target.value.toUpperCase() })}
                      placeholder="Ex: A101"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none transition-all ${
                        errors.codeSalle ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.codeSalle && <p className="text-xs text-red-500 mt-1">{errors.codeSalle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Libellé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    placeholder="Ex: Grand Amphithéâtre"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none transition-all ${
                      errors.libelle ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.libelle && <p className="text-xs text-red-500 mt-1">{errors.libelle}</p>}
                </div>
              </div>

              {/* Type et Capacité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de salle
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none"
                  >
                    <option value="">Non spécifié</option>
                    {TYPES_SALLE.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.capacite || ''}
                      onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) || 0 })}
                      min={1}
                      max={500}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none ${
                        errors.capacite ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.capacite && <p className="text-xs text-red-500 mt-1">{errors.capacite}</p>}
                </div>
              </div>

              {/* Équipements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipements
                </label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPEMENTS_OPTIONS.map(eq => (
                    <button
                      key={eq.value}
                      type="button"
                      onClick={() => handleEquipementToggle(eq.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        selectedEquipements.includes(eq.value)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <eq.icon size={14} />
                      {eq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statut actif */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, estActive: !formData.estActive })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    formData.estActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {formData.estActive ? <Power size={16} /> : <PowerOff size={16} />}
                  {formData.estActive ? 'Active' : 'Inactive'}
                </button>
                <span className="text-xs text-gray-400">
                  {formData.estActive ? 'La salle est disponible pour les réservations' : 'La salle est temporairement indisponible'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isEditing ? 'Mettre à jour' : 'Créer la salle'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal de détails
const SalleDetailModal = ({ 
  salle, 
  isOpen, 
  onClose,
  disponibilites,
  isLoadingDispo
}: { 
  salle: Salle | null; 
  isOpen: boolean; 
  onClose: () => void;
  disponibilites: Disponibilite[];
  isLoadingDispo: boolean;
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  if (!salle || !isOpen) return null;

  const equipementsList = salle.equipements?.split(',').map(e => e.trim()) || [];
  const filteredDispos = disponibilites.filter(d => d.date === selectedDate);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Building2 size={20} className="text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{salle.libelle}</h2>
                  <p className="text-sm text-gray-400 font-mono">{salle.codeSalle}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Informations générales */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={18} className="text-gray-400" />
                    <span className="font-medium">Capacité:</span>
                    <span>{salle.capacite} personnes</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    salle.estActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {salle.estActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                {salle.type && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="font-medium">Type:</span>
                    <span>{salle.type}</span>
                  </div>
                )}

                {equipementsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {equipementsList.map((eq, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">
                        {eq === 'Wifi' && <Wifi size={12} />}
                        {eq === 'Video projecteur' && <Video size={12} />}
                        {eq === 'Tableau blanc' && <Presentation size={12} />}
                        {eq === 'Climatisation' && <Wind size={12} />}
                        {eq}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Disponibilité */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Disponibilité
                </h3>
                
                <div className="mb-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-300 focus:border-transparent outline-none"
                  />
                </div>

                {isLoadingDispo ? (
                  <div className="flex justify-center py-6">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {SESSIONS.map(session => {
                      const dispo = filteredDispos.find(d => d.session === session);
                      return (
                        <div
                          key={session}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            dispo?.estLibre
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={16} className={dispo?.estLibre ? 'text-green-600' : 'text-red-600'} />
                            <span className="font-medium">{session}</span>
                          </div>
                          <div>
                            {dispo?.estLibre ? (
                              <span className="text-green-600 text-sm flex items-center gap-1">
                                <Check size={14} /> Libre
                              </span>
                            ) : (
                              <span className="text-red-600 text-sm flex items-center gap-1">
                                <X size={14} /> Occupé{dispo?.reservationTitre && ` - ${dispo.reservationTitre}`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal de confirmation suppression
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  salleName,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  salleName: string;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

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
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
              <p className="text-gray-500 text-sm mb-4">
                Êtes-vous sûr de vouloir supprimer la salle <strong className="text-gray-900">"{salleName}"</strong> ?
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Page principale
export default function SallesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === 'Admin';

  // États
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEquipement, setFilterEquipement] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState<Salle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Disponibilité
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loadingDispo, setLoadingDispo] = useState(false);

  // Charger les salles
  const fetchSalles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/Salles');
      setSalles(response.data);
    } catch (err: any) {
      console.error('Erreur chargement salles:', err);
      setError(err.response?.data?.message || 'Impossible de charger les salles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger disponibilité d'une salle
  const fetchDisponibilite = async (salleId: number) => {
    setLoadingDispo(true);
    try {
      // Simulation de données de disponibilité - à adapter selon ton backend
      // Idéalement, appeler un endpoint GET /Salles/{id}/disponibilite
      const today = new Date();
      const dates = [today, new Date(today.setDate(today.getDate() + 1)), new Date(today.setDate(today.getDate() + 2))];
      const mockDispos: Disponibilite[] = [];
      
      for (const date of dates) {
        for (const session of SESSIONS) {
          mockDispos.push({
            date: date.toISOString().split('T')[0],
            session,
            estLibre: Math.random() > 0.3,
            reservationTitre: Math.random() > 0.7 ? 'Club Robotique' : undefined
          });
        }
      }
      setDisponibilites(mockDispos);
    } catch (err) {
      console.error('Erreur chargement disponibilité:', err);
    } finally {
      setLoadingDispo(false);
    }
  };

  // Créer une salle
  const handleCreate = async (data: SalleCreateDto) => {
    setSubmitting(true);
    try {
      await api.post('/Salles', data);
      await fetchSalles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier une salle
  const handleUpdate = async (id: number, data: SalleUpdateDto) => {
    setSubmitting(true);
    try {
      await api.put(`/Salles/${id}`, data);
      await fetchSalles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer une salle
  const handleDelete = async () => {
    if (!selectedSalle) return;
    setSubmitting(true);
    try {
      await api.delete(`/Salles/${selectedSalle.id}`);
      setShowDeleteModal(false);
      setSelectedSalle(null);
      await fetchSalles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  // Voir détails
  const handleView = (salle: Salle) => {
    setSelectedSalle(salle);
    fetchDisponibilite(salle.id);
    setShowDetailModal(true);
  };

  // Modifier
  const handleEdit = (salle: Salle) => {
    setSelectedSalle(salle);
    setIsEditing(true);
    setShowFormModal(true);
  };

  // Supprimer (confirmation)
  const handleDeleteClick = (salle: Salle) => {
    setSelectedSalle(salle);
    setShowDeleteModal(true);
  };

  // Fermer formulaire
  const handleCloseForm = () => {
    setShowFormModal(false);
    setSelectedSalle(null);
    setIsEditing(false);
  };

  // Filtrer les salles
  const filteredSalles = salles.filter(salle => {
    const matchSearch = salle.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        salle.codeSalle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || salle.type === filterType;
    const matchStatus = filterStatus === 'all' || 
                        (filterStatus === 'active' && salle.estActive) ||
                        (filterStatus === 'inactive' && !salle.estActive);
    const matchEquipement = filterEquipement === 'all' || 
                            (salle.equipements && salle.equipements.includes(filterEquipement));
    return matchSearch && matchType && matchStatus && matchEquipement;
  });

  // Statistiques
  const stats = {
    total: salles.length,
    actives: salles.filter(s => s.estActive).length,
    inactives: salles.filter(s => !s.estActive).length,
    capaciteTotale: salles.reduce((sum, s) => sum + s.capacite, 0),
  };

  // Pagination
  const totalPages = Math.ceil(filteredSalles.length / itemsPerPage);
  const paginatedSalles = filteredSalles.slice(
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
  }, [token, router, fetchSalles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des salles...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray