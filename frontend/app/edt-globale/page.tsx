'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, AlertCircle, Plus, FileText, Calendar } from 'lucide-react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import useAuthStore from '@/store/authStore';
import { api } from '@/services/api';
import { filiereService } from '@/services/filieres';
import { parcoursService } from '@/services/parcours';
import { niveauService } from '@/services/niveaux';
import { matiereService } from '@/services/matieres';
import { salleService } from '@/services/salles';
import { utilisateurService } from '@/services/utilisateurs';
import { creneauService } from '@/services/creneaux';
import { getPlanningHebdo, createSeance, updateSeance } from '@/services/planning';
import { SeancePlanningDto, PlanningHebdoResponse, Filiere, Parcours, Niveau, Matiere, Salle, Utilisateur, Creneau } from '@/types';
import { Dialog } from '@/components/ui/dialog';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7);
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const CARD_COLORS = [
  { bg: '#EEF2FF', border: '#4F5EFF', text: '#4F5EFF' },
  { bg: '#F0FDF4', border: '#22C55E', text: '#166534' },
  { bg: '#FFF7ED', border: '#F97316', text: '#9A3412' },
  { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
  { bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9' },
  { bg: '#FDF4FF', border: '#EC4899', text: '#9D174D' },
  { bg: '#ECFEFF', border: '#06B6D4', text: '#155E75' },
  { bg: '#FFFBEB', border: '#EAB308', text: '#854D0E' },
];

export default function EdtGlobalePage() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [seances, setSeances] = useState<SeancePlanningDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedParcours, setSelectedParcours] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const startAcademicYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const academicYears = Array.from({ length: 4 }, (_, i) => {
    const s = startAcademicYear - 1 + i;
    return `${s}-${s + 1}`;
  });
  const [selectedAnneeScolaire, setSelectedAnneeScolaire] = useState(`${startAcademicYear}-${startAcademicYear + 1}`);

  // Subject Cards State
  const [subjectCards, setSubjectCards] = useState<{ id: string; matiereId: string; profIds: string[]; salleId: string }[]>([]);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [tempSubjectId, setTempSubjectId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedSeanceId, setSelectedSeanceId] = useState<number | null>(null);
  const [dragHoverCell, setDragHoverCell] = useState<string | null>(null);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [resizingSeanceId, setResizingSeanceId] = useState<number | null>(null);
  const [resizeDirection, setResizeDirection] = useState<'top' | 'bottom' | null>(null);


  // Add Session State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; hour: number } | null>(null);
  const [lookupData, setLookupData] = useState<{ matieres: Matiere[]; salles: Salle[]; profs: Utilisateur[]; creneaux: Creneau[] }>({
    matieres: [], salles: [], profs: [], creneaux: [],
  });
  const [formData, setFormData] = useState({ matiereId: '', profId: '', salleId: '', creneauId: '' });

  useEffect(() => {
    filiereService.getAll().then(setFilieres).catch(() => {});
    parcoursService.getAll().then(setParcoursList).catch(() => {});
    niveauService.getAll().then(setNiveaux).catch(() => {});
    
    Promise.all([
      matiereService.getAll(),
      salleService.getAll(),
      utilisateurService.getEnseignants(),
      creneauService.getAll(),
    ]).then(([m, s, p, c]) => setLookupData({ matieres: m, salles: s, profs: p, creneaux: c })).catch(() => {});
  }, []);

  const subjectCardsKey = useMemo(() => {
    if (!selectedParcours || !selectedNiveau) return null;
    return `edt-cards-${selectedParcours}-${selectedNiveau}-${selectedAnneeScolaire}`;
  }, [selectedParcours, selectedNiveau, selectedAnneeScolaire]);

  useEffect(() => {
    if (!subjectCardsKey) { setSubjectCards([]); return; }
    try {
      const saved = localStorage.getItem(subjectCardsKey);
      setSubjectCards(saved ? JSON.parse(saved) : []);
    } catch { setSubjectCards([]); }
  }, [subjectCardsKey]);

  useEffect(() => {
    if (!subjectCardsKey) return;
    localStorage.setItem(subjectCardsKey, JSON.stringify(subjectCards));
  }, [subjectCards, subjectCardsKey]);

  const filteredParcours = parcoursList.filter((p) => !selectedFiliere || p.filiereId === Number(selectedFiliere));
  const filteredNiveaux = niveaux.filter((n) => !selectedParcours || n.parcoursId === Number(selectedParcours));

  const fetchPlanning = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const response = await getPlanningHebdo({
        startDate: startOfWeek.toISOString(),
        niveauId: selectedNiveau ? Number(selectedNiveau) : undefined,
        parcoursId: selectedParcours ? Number(selectedParcours) : undefined,
      });
      setSeances(response.seances || []);
    } catch { setError('Impossible de charger le planning.'); } finally { setLoading(false); }
  }, [currentDate, selectedNiveau, selectedParcours]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  const getPosition = (heureDebut: string, heureFin: string) => {
    const [startH, startM] = heureDebut.split(':').map(Number);
    const [endH, endM] = heureFin.split(':').map(Number);
    const top = ((startH + startM / 60 - 7) / 11) * 100;
    const height = ((endH + endM / 60 - startH - startM / 60) / 11) * 100;
    return { top: `${top}%`, height: `${Math.max(height, 3)}%` };
  };

  const handleCellClick = (day: string, hour: number) => {
    if (!selectedParcours || !selectedNiveau) return;
    
    const creneau = lookupData.creneaux.find(c => 
      c.jour === day && c.heureDebut.startsWith(`${hour.toString().padStart(2, '0')}:`)
    );

    if (creneau) {
      setSelectedCell({ day, hour });
      setFormData({ ...formData, creneauId: creneau.id.toString() });
      setIsAddModalOpen(true);
    }
  };

  const addSubjectCard = () => {
    const matiere = lookupData.matieres.find(m => m.id === Number(tempSubjectId));
    let profIds: string[] = [];
    if (matiere) {
      const existingSeance = seances.find(s => 
        s.matiereCode === matiere.code && 
        s.niveauId === Number(selectedNiveau) && 
        s.parcoursId === Number(selectedParcours)
      );
      if (existingSeance) profIds = [existingSeance.professeurId.toString()];
    }

    setSubjectCards([...subjectCards, { 
      id: crypto.randomUUID(), 
      matiereId: tempSubjectId, 
      profIds, 
      salleId: '' 
    }]);
    setIsAddSubjectModalOpen(false);
    setTempSubjectId('');
  };

  const removeSubjectCard = (id: string) => {
    setSubjectCards(subjectCards.filter(c => c.id !== id));
  };

  const updateSubjectCard = (id: string, field: string, value: string) => {
    setSubjectCards(subjectCards.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        if (field === 'matiereId') {
          const matiere = lookupData.matieres.find(m => m.id === Number(value));
          if (matiere) {
            const existingSeance = seances.find(s => 
              s.matiereCode === matiere.code && 
              s.niveauId === Number(selectedNiveau) && 
              s.parcoursId === Number(selectedParcours)
            );
            if (existingSeance) {
              updated.profIds = [existingSeance.professeurId.toString()];
            }
          }
        }
        return updated;
      }
      return c;
    }));
  };

  const addProfToCard = (cardId: string, profId: string) => {
    if (!profId) return;
    setSubjectCards(subjectCards.map(c => {
      if (c.id === cardId && !c.profIds.includes(profId)) {
        return { ...c, profIds: [...c.profIds, profId] };
      }
      return c;
    }));
  };

  const removeProfFromCard = (cardId: string, profId: string) => {
    setSubjectCards(subjectCards.map(c => {
      if (c.id === cardId) {
        return { ...c, profIds: c.profIds.filter(id => id !== profId) };
      }
      return c;
    }));
  };

  const handleMatiereChange = (matiereId: string) => {
    setFormData({ ...formData, matiereId });
    
    if (!matiereId) return;

    const matiere = lookupData.matieres.find(m => m.id === Number(matiereId));
    if (matiere) {
      const existingSeance = seances.find(s => 
        s.matiereCode === matiere.code && 
        s.niveauId === Number(selectedNiveau) && 
        s.parcoursId === Number(selectedParcours)
      );
      if (existingSeance) {
        setFormData(prev => ({ ...prev, profId: existingSeance.professeurId.toString() }));
      }
    }
  };

  const handleAddSeance = async () => {
    if (!formData.matiereId || !formData.profId || !formData.salleId || !formData.creneauId) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    try {
      const payload = {
        matiereId: Number(formData.matiereId),
        profId: Number(formData.profId),
        salleId: Number(formData.salleId),
        creneauId: Number(formData.creneauId),
        parcoursId: Number(selectedParcours),
        niveauId: Number(selectedNiveau),
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      };
      await createSeance(payload);
      setIsAddModalOpen(false);
      fetchPlanning();
    } catch {
      alert('Erreur lors de l\'ajout de la séance');
    }
  };

  const handleDrop = async (e: React.DragEvent, day: string, hour: number) => {
    e.preventDefault();
    setDragHoverCell(null);
    setIsDraggingCard(false);
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const matiere = lookupData.matieres.find(m => m.id === Number(data.matiereId));
    if (!data.matiereId) return;

    const creneau = lookupData.creneaux.find(c => {
      if (c.jour !== day) return false;
      const [startH] = c.heureDebut.split(':').map(Number);
      const [endH] = c.heureFin.split(':').map(Number);
      return hour >= startH && hour < endH;
    }) || lookupData.creneaux.find(c => c.jour === day);
    if (!creneau) return;

    let profId = data.profIds?.[0];
    if (!profId) {
      const existingSeance = seances.find(s => s.matiereCode === matiere?.code);
      profId = existingSeance ? existingSeance.professeurId.toString() : '';
    }
    if (!profId && lookupData.profs.length > 0) {
      profId = lookupData.profs[0].id.toString();
    }
    if (!profId) return;

    let salleId = data.salleId || '';
    if (!salleId && lookupData.salles.length > 0) {
      salleId = lookupData.salles[0].id.toString();
    }
    if (!salleId) return;

    const heureDebutCustom = `${hour.toString().padStart(2, '0')}:00:00`;
    const heureFinCustom = `${(hour + 1).toString().padStart(2, '0')}:00:00`;

    const newColorIdx = seances.length % CARD_COLORS.length;
    const newColor = CARD_COLORS[newColorIdx].border;

    const [anneeDebut, anneeFin] = selectedAnneeScolaire.split('-');
    try {
      console.log('[Drop] creating seance', { matiereId: Number(data.matiereId), profId: Number(profId), salleId: Number(salleId), creneauId: creneau.id });
      const result = await createSeance({
        matiereId: Number(data.matiereId),
        profId: Number(profId),
        salleId: Number(salleId),
        creneauId: creneau.id,
        parcoursId: Number(selectedParcours),
        niveauId: Number(selectedNiveau),
        dateDebut: `${anneeDebut}-09-01`,
        dateFin: `${anneeFin}-08-31`,
        couleurAffichage: newColor,
        heureDebutCustom,
        heureFinCustom,
      });
      console.log('[Drop] createSeance success', result);
      await fetchPlanning();
      console.log('[Drop] fetchPlanning done');
    } catch (err) {
      console.error('[Drop] error:', err);
    }
  }

  const gridRef = useRef<HTMLDivElement>(null);
  const seancesRef = useRef(seances);

  useEffect(() => {
    seancesRef.current = seances;
  }, [seances]);

  const handleResizeMouseDown = (e: React.MouseEvent, seanceId: number, direction: 'top' | 'bottom') => {
    e.stopPropagation();
    setResizingSeanceId(seanceId);
    setResizeDirection(direction);
  };

  useEffect(() => {
    if (resizingSeanceId === null || resizeDirection === null) return;
    const grid = gridRef.current;
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      const relY = e.clientY - gridRect.top;
      const hourFraction = (relY / gridRect.height) * 11 + 7;
      const snapped = Math.max(Math.round(hourFraction * 2) / 2, 8);
      const clamped = Math.min(snapped, 17);
      
      const h = Math.floor(clamped);
      const m = (clamped % 1 === 0) ? 0 : 30;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

      setSeances(prev => prev.map(s => {
        if (s.id === resizingSeanceId) {
          return resizeDirection === 'bottom' 
            ? { ...s, heureFin: timeStr } 
            : { ...s, heureDebut: timeStr };
        }
        return s;
      }));
    };

    const handleMouseUp = async () => {
      const currentSeances = seancesRef.current;
      const seance = currentSeances.find(s => s.id === resizingSeanceId);
      if (seance) {
        try {
          const updatePayload = resizeDirection === 'bottom' 
            ? { heureFinCustom: seance.heureFin } 
            : { heureDebutCustom: seance.heureDebut };
          await updateSeance(seance.id, updatePayload);
        } catch (err) {
          console.error('[Resize] update failed:', err);
          fetchPlanning();
        }
      }
      setResizingSeanceId(null);
      setResizeDirection(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingSeanceId, resizeDirection]);

  const renderDayCell = (hour: number, day: string) => {
    const cellKey = `${hour}-${day}`
    return (
      <div
        key={cellKey}
        className={`border-b border-l border-neutral-200 relative ${selectedParcours && selectedNiveau ? 'cursor-pointer' : ''} ${dragHoverCell === cellKey ? 'bg-accent/30' : 'hover:bg-accent/5'} transition-colors duration-150`}
        onClick={() => handleCellClick(day, hour)}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragHoverCell(cellKey); }}
        onDragEnter={() => setDragHoverCell(cellKey)}
        onDragLeave={() => setDragHoverCell(null)}
        onDrop={(e) => handleDrop(e, day, hour)}
      />
    )
  }

  const selectCls = 'w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm text-fg-default bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 appearance-none pr-10'

  return (
    <ProtectedLayout pageTitle="EDT Globale">
      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-[8px] p-4 mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-fg-muted">Filière</label>
          <div className="relative">
            <select value={selectedFiliere} onChange={(e) => { setSelectedFiliere(e.target.value); setSelectedParcours(''); setSelectedNiveau(''); }} className={selectCls}>
              <option value="">Toutes</option>
              {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-fg-muted">Parcours</label>
          <div className="relative">
            <select value={selectedParcours} onChange={(e) => { setSelectedParcours(e.target.value); setSelectedNiveau(''); }} className={selectCls}>
              <option value="">Tous</option>
              {filteredParcours.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-fg-muted">Niveau</label>
          <div className="relative">
            <select value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)} className={selectCls}>
              <option value="">Toutes</option>
              {filteredNiveaux.map((n) => <option key={n.id} value={n.id}>{n.code}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-fg-muted">Année scolaire</label>
          <div className="relative">
            <select value={selectedAnneeScolaire} onChange={(e) => setSelectedAnneeScolaire(e.target.value)} className={selectCls}>
              {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
          </div>
        </div>

        <div className="h-8 w-[1px] bg-neutral-200 mx-2" />

        {selectedFiliere && selectedParcours && selectedNiveau && (
          <>
            <button 
              onClick={() => setIsAddSubjectModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-dark transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Ajouter Matière
            </button>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const payload = { 
                      AnneeUniversitaire: selectedAnneeScolaire, 
                      NiveauId: Number(selectedNiveau),
                      ParcoursId: Number(selectedParcours),
                      FiliereId: Number(selectedFiliere),
                    };
                    const blob = await api.postBlob('/Document/export/emploi-du-temps', payload);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `emploi_du_temps_${selectedParcours}_${selectedNiveau}.pdf`; a.click();
                    URL.revokeObjectURL(url);
                  } catch (e) { alert('Erreur lors de l\'export PDF'); }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-fg-default hover:bg-bg-muted transition-colors duration-150"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </>
        )}

        {subjectCards.map((card, idx) => {
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          const matiere = lookupData.matieres.find(m => m.id === Number(card.matiereId));
          const creneauHeight = 400 / HOURS.length;
          return (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, matiereId: card.matiereId, profIds: card.profIds, salleId: card.salleId }));
                e.dataTransfer.effectAllowed = 'copy';
                setIsDraggingCard(true);
              }}
              onDragEnd={() => { setDragHoverCell(null); setIsDraggingCard(false); }}
              onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
              className={`relative rounded-lg flex items-center justify-center gap-1 px-2 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200 text-center ${selectedCardId === card.id ? 'ring-2 ring-accent scale-105' : ''}`}
              style={{ backgroundColor: color.bg, border: `1px solid ${color.border}`, height: creneauHeight }}
            >
              <span className="text-xs font-semibold truncate max-w-[80px]" style={{ color: color.text }}>{matiere?.nom || 'Matière'}</span>
              <button onClick={(e) => { e.stopPropagation(); removeSubjectCard(card.id); setSelectedCardId(null); }} className="ml-auto w-4 h-4 rounded-full bg-white/80 border border-neutral-300 flex items-center justify-center text-[8px] text-neutral-500 hover:text-red-500 hover:border-red-300 shadow-sm transition-colors shrink-0">✕</button>
            </div>
        );
        })}
      </div>

       {/* Timetable */}
       {loading ? (
         <div className="bg-white border border-neutral-200 rounded-[8px] p-12 flex justify-center">
           <div className="w-8 h-8 border-3 border-neutral-200 border-t-accent rounded-full animate-spin" />
         </div>
       ) : !selectedFiliere || !selectedParcours || !selectedNiveau ? (
         <div className="bg-white border border-neutral-200 rounded-[8px] p-12 text-center">
           <Calendar size={32} className="text-fg-subtle mx-auto mb-3" />
           <p className="text-fg-default font-semibold mb-1">Veuillez sélectionner tous les filtres</p>
           <p className="text-fg-muted text-sm">Sélectionnez une filière, un parcours et un niveau pour afficher l&apos;emploi du temps.</p>
         </div>
       ) : (
         <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[100px_repeat(6,1fr)] bg-[#F7F7FA] border-b border-neutral-200">
                <div className="p-3 text-xs font-bold text-fg-muted uppercase tracking-wider">Horaire</div>
                {DAYS.map(day => (
                  <div key={day} className="p-3 text-xs font-bold text-fg-muted uppercase tracking-wider text-center border-l border-neutral-200">{day}</div>
                ))}
              </div>
               <div ref={gridRef} className="relative select-none" style={{ height: '400px' }}>
               <div className="absolute inset-0 grid grid-cols-[100px_repeat(6,1fr)] grid-rows-[repeat(11,1fr)]">
                   {HOURS.map(hour => (
                     <React.Fragment key={hour}>
                       <div className="border-b border-neutral-200 text-xs text-fg-subtle font-mono font-semibold flex items-center justify-center">{hour.toString().padStart(2, '0')}h00-{(hour + 1).toString().padStart(2, '0')}h00</div>
                        {DAYS.map(day => renderDayCell(hour, day))}
                     </React.Fragment>
                   ))}
                 </div>
                 {seances.map(seance => {
                  const pos = getPosition(seance.heureDebut, seance.heureFin);
                  const dayIndex = DAYS.indexOf(seance.jour);
                  if (dayIndex === -1) return null;
                  const isCancelled = seance.statut === 'Annule' || seance.statut === 'Annulé';
                  const color = seance.couleurAffichage || '#4F5EFF';
                  const isSelected = selectedSeanceId === seance.id;
                  return (
                    <div key={seance.id}
                      onClick={() => { setSelectedSeanceId(isSelected ? null : seance.id); setSelectedCardId(null); }}
                      className={`absolute cursor-pointer rounded-none p-1.5 overflow-hidden transition-all duration-150 hover:ring-2 hover:ring-accent ${isSelected ? 'ring-2 ring-accent scale-[1.02] z-10' : ''}`}
                      style={{
                        left: `calc(100px + ${dayIndex} * (100% - 100px) / 6 + 2px)`,
                        width: `calc((100% - 100px) / 6 - 4px)`,
                        top: pos.top, height: pos.height, minHeight: '24px',
                        backgroundColor: isCancelled ? '#e5e7eb' : color,
                        color: isCancelled ? '#6b7280' : '#fff',
                        pointerEvents: isDraggingCard ? ('none' as const) : undefined,
                      }}>
                      <p className={`text-xs font-medium truncate ${isCancelled ? 'line-through' : ''}`}>
                        {seance.matiereNom}
                        {isCancelled && <span className="ml-1 text-[9px] bg-white/30 text-white px-1 py-0.5 rounded-sm font-bold">ANNULÉ</span>}
                      </p>
                      <p className="text-[9px] truncate opacity-80">{seance.professeurNomComplet}</p>
                      <p className="text-[9px] truncate opacity-80">{seance.salleNom}</p>
                       <div
                         onMouseDown={(e) => handleResizeMouseDown(e, seance.id, 'top')}
                         className="absolute top-0 left-0 right-0 h-1.5 cursor-n-resize hover:bg-black/10 active:bg-black/20 transition-colors"
                       />
                       <div
                         onMouseDown={(e) => handleResizeMouseDown(e, seance.id, 'bottom')}
                         className="absolute bottom-0 left-0 right-0 h-1.5 cursor-s-resize hover:bg-black/10 active:bg-black/20 transition-colors"
                       />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="relative z-10 bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-neutral-200">
            <Dialog.Title className="text-lg font-semibold mb-4">Ajouter une séance</Dialog.Title>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-fg-muted">Matière</label>
                <div className="relative">
                  <select value={formData.matiereId} onChange={e => handleMatiereChange(e.target.value)} className={selectCls}>
                    <option value="">Sélectionner une matière</option>
                    {lookupData.matieres.filter(m => !selectedNiveau || m.niveauId === Number(selectedNiveau)).map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-fg-muted">Professeur</label>
                <div className="relative">
                  <select value={formData.profId} onChange={e => setFormData({...formData, profId: e.target.value})} className={selectCls}>
                    <option value="">Sélectionner un professeur</option>
                    {(() => {
                      const card = subjectCards.find(c => c.matiereId === formData.matiereId);
                      if (card && card.profIds.length > 0) {
                        return card.profIds.map(pid => {
                          const prof = lookupData.profs.find(p => p.id === Number(pid));
                          return <option key={pid} value={pid}>{prof?.nom} {prof?.prenom}</option>;
                        });
                      }
                      return lookupData.profs.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>);
                    })()}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-fg-muted">Salle</label>
                <div className="relative">
                  <select value={formData.salleId} onChange={e => setFormData({...formData, salleId: e.target.value})} className={selectCls}>
                    <option value="">Sélectionner une salle</option>
                    {lookupData.salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <Dialog.Close className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg-default cursor-pointer">Annuler</Dialog.Close>
                <button onClick={handleAddSeance} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors">
                  Ajouter
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root open={isAddSubjectModalOpen} onOpenChange={setIsAddSubjectModalOpen}>
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="relative z-10 bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-neutral-200">
            <Dialog.Title className="text-lg font-semibold mb-4">Sélectionner une matière</Dialog.Title>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <select 
                    value={tempSubjectId} 
                    onChange={e => setTempSubjectId(e.target.value)} 
                    className={selectCls}
                  >
                    <option value="">Choisir une matière...</option>
                    {lookupData.matieres.filter(m => !selectedNiveau || m.niveauId === Number(selectedNiveau)).map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" size={14} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <Dialog.Close className="px-4 py-2 text-sm font-medium text-fg-muted hover:text-fg-default cursor-pointer">Annuler</Dialog.Close>
                <button 
                  onClick={addSubjectCard} 
                  disabled={!tempSubjectId}
                  className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {selectedCardId && (() => {
        const card = subjectCards.find(c => c.id === selectedCardId);
        const matiere = card ? lookupData.matieres.find(m => m.id === Number(card.matiereId)) : null;
        const color = card ? CARD_COLORS[subjectCards.indexOf(card) % CARD_COLORS.length] : CARD_COLORS[0];
        return (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-2xl rounded-t-2xl p-4">
            <div className="max-w-5xl mx-auto flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color?.border }} />
                <div>
                  <p className="text-sm font-semibold text-fg-default">{matiere?.nom || 'Matière'}</p>
                  <p className="text-xs text-fg-muted">{matiere?.code}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-fg-muted bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-200">
                  <span className="text-base">↕</span>
                  <span>Faites glisser cette matière sur un créneau horaire</span>
                </div>
                <button
                  onClick={() => {
                    if (!card) return;
                    const newCard = { ...card, id: crypto.randomUUID() };
                    setSubjectCards(prev => [...prev, newCard]);
                    setSelectedCardId(newCard.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5"
                >
                  Dupliquer
                </button>
                <button
                  onClick={() => { setSelectedCardId(null); }}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  Modifier
                </button>
                <button
                  onClick={() => { removeSubjectCard(card?.id || ''); setSelectedCardId(null); }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-500 text-xs font-medium hover:bg-neutral-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedSeanceId && (() => {
        const seance = seances.find(s => s.id === selectedSeanceId);
        if (!seance) return null;
        const color = seance.couleurAffichage || '#4F5EFF';
        return (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-2xl rounded-t-2xl p-4">
            <div className="max-w-5xl mx-auto flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <p className="text-sm font-semibold text-fg-default">{seance.matiereNom}</p>
                  <p className="text-xs text-fg-muted">{seance.professeurNomComplet} · {seance.salleNom}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    const matiere = lookupData.matieres.find(m =>
                      m.nom === seance.matiereNom && m.code === seance.matiereCode
                    );
                    const newCard = {
                      id: crypto.randomUUID(),
                      matiereId: matiere?.id.toString() || '',
                      profIds: seance.professeurId ? [seance.professeurId.toString()] : [],
                      salleId: '',
                    };
                    setSubjectCards(prev => [...prev, newCard]);
                    setSelectedSeanceId(null);
                    setSelectedCardId(newCard.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5"
                >
                  Dupliquer
                </button>
                <button
                  onClick={() => {
                    setSeances(prev => prev.filter(s => s.id !== seance.id));
                    setSelectedSeanceId(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedSeanceId(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-500 text-xs font-medium hover:bg-neutral-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </ProtectedLayout>
  );
}