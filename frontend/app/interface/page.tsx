'use client';

import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, MapPin, Users,
  Check, AlertTriangle, DoorOpen,
  Building2, SlidersHorizontal, CalendarDays,
  Clock, Monitor, Wifi, LayoutDashboard, Calendar,
  LogOut
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface Booking {
  id: number;
  day: string;
  startHour: number;
  endHour: number;
  roomId: number;
  title: string;
  instructor: string;
  status: 'booked' | 'conflict';
}

interface RoomCardData {
  id: number;
  name: string;
  capacity: number;
  floor: string;
  type: string;
  amenities: string[];
  available: boolean;
}

// ─── Mock Data ───────────────────────────────────────────
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const ROOMS = [
  { id: 1, name: 'Amphi A', capacity: 120, floor: 'RDC', type: 'Amphithéâtre', amenities: ['Vidéoprojecteur', 'Climatisation', 'Sono'], color: '#0052FF' },
  { id: 2, name: 'Salle 101', capacity: 30, floor: '1er', type: 'Salle de cours', amenities: ['Tableau blanc', 'Vidéoprojecteur'], color: '#3B82F6' },
  { id: 3, name: 'Labo Info', capacity: 20, floor: '2ème', type: 'Laboratoire', amenities: ['20 postes', 'Vidéoprojecteur', 'WiFi'], color: '#2563EB' },
  { id: 4, name: 'Salle 202', capacity: 50, floor: '2ème', type: 'Salle de cours', amenities: ['Vidéoprojecteur', 'Tableau', 'Clim'], color: '#60A5FA' },
];

const ROOM_MAP: Record<number, typeof ROOMS[0]> = Object.fromEntries(ROOMS.map(r => [r.id, r]));

const BOOKINGS: Booking[] = [
  { id: 1, day: 'Lundi', startHour: 8, endHour: 10, roomId: 1, title: 'Mathématiques L3', instructor: 'Dr. Rakoto', status: 'booked' },
  { id: 2, day: 'Lundi', startHour: 14, endHour: 16, roomId: 3, title: 'TP Réseaux', instructor: 'M. Randria', status: 'booked' },
  { id: 3, day: 'Mardi', startHour: 9, endHour: 11, roomId: 2, title: 'Anglais L2', instructor: 'Mme. Rabe', status: 'booked' },
  { id: 4, day: 'Mardi', startHour: 14, endHour: 16, roomId: 1, title: 'Soutenance PFE', instructor: 'Jury', status: 'booked' },
  { id: 5, day: 'Mercredi', startHour: 8, endHour: 10, roomId: 3, title: 'Dev Web L3', instructor: 'M. Rajaonah', status: 'booked' },
  { id: 6, day: 'Mercredi', startHour: 10, endHour: 12, roomId: 2, title: 'Bases de données', instructor: 'Dr. Rakoto', status: 'conflict' },
  { id: 7, day: 'Mercredi', startHour: 10, endHour: 12, roomId: 2, title: 'Réseaux L3', instructor: 'M. Randria', status: 'conflict' },
  { id: 8, day: 'Jeudi', startHour: 8, endHour: 10, roomId: 1, title: 'Algèbre L2', instructor: 'Dr. Razafy', status: 'booked' },
  { id: 9, day: 'Jeudi', startHour: 11, endHour: 13, roomId: 2, title: 'Statistiques', instructor: 'Mme. Rabe', status: 'booked' },
  { id: 10, day: 'Vendredi', startHour: 8, endHour: 10, roomId: 1, title: 'Physique L2', instructor: 'Dr. Rasoa', status: 'booked' },
  { id: 11, day: 'Vendredi', startHour: 10, endHour: 12, roomId: 2, title: 'Chimie organique', instructor: 'M. Rajaonah', status: 'booked' },
  { id: 12, day: 'Samedi', startHour: 9, endHour: 11, roomId: 3, title: 'Programmation C', instructor: 'Dr. Rakoto', status: 'booked' },
  { id: 13, day: 'Samedi', startHour: 14, endHour: 16, roomId: 2, title: 'Préparation examens', instructor: 'Mme. Rabe', status: 'booked' },
  { id: 14, day: 'Lundi', startHour: 10, endHour: 12, roomId: 4, title: 'Thermodynamique', instructor: 'Dr. Rasoa', status: 'booked' },
  { id: 15, day: 'Jeudi', startHour: 14, endHour: 17, roomId: 3, title: 'TP Systèmes', instructor: 'M. Randria', status: 'booked' },
];

const ROOM_CARDS: RoomCardData[] = [
  { id: 1, name: 'Amphi A', capacity: 120, floor: 'RDC', type: 'Amphithéâtre', amenities: ['Vidéoprojecteur', 'Climatisation', 'Sono', 'WiFi'], available: true },
  { id: 2, name: 'Salle 101', capacity: 30, floor: '1er étage', type: 'Salle de cours', amenities: ['Tableau blanc', 'Vidéoprojecteur'], available: false },
  { id: 3, name: 'Labo Info', capacity: 20, floor: '2ème étage', type: 'Laboratoire', amenities: ['20 postes', 'Vidéoprojecteur', 'WiFi'], available: true },
  { id: 4, name: 'Salle 202', capacity: 50, floor: '2ème étage', type: 'Salle de cours', amenities: ['Vidéoprojecteur', 'Tableau', 'Climatisation'], available: false },
  { id: 5, name: 'Salle Réunion', capacity: 12, floor: 'RDC', type: 'Salle de réunion', amenities: ['WiFi', 'Tableau blanc', 'Écran'], available: true },
];

// ─── Helpers ─────────────────────────────────────────────
function getBookingsForCell(day: string, hour: number) {
  return BOOKINGS.filter(b => b.day === day && b.startHour <= hour && b.endHour > hour);
}

// ─── Sidebar (navigation + filtres) ──────────────────────
function Sidebar({
  activeNav,
  setActiveNav,
  selectedTypes, selectedFloors, selectedCapacities,
  onToggleType, onToggleFloor, onToggleCapacity,
  onReset,
}: {
  activeNav: string;
  setActiveNav: (v: string) => void;
  selectedTypes: string[];
  selectedFloors: string[];
  selectedCapacities: string[];
  onToggleType: (v: string) => void;
  onToggleFloor: (v: string) => void;
  onToggleCapacity: (v: string) => void;
  onReset: () => void;
}) {
  const navItems = [
    { label: 'Planning', icon: Calendar },
    { label: 'Salles', icon: Building2 },
    { label: 'Réservations', icon: DoorOpen },
    { label: 'Dashboard', icon: LayoutDashboard },
  ];

  function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
      <label onClick={onChange} className="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer group">
        <div
          className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-150 ring-1 ring-inset ${
            checked ? 'bg-[#0052FF] ring-[#0052FF]' : 'bg-white ring-blue-300 group-hover:ring-blue-400'
          }`}
        >
          {checked && <Check size={10} className="text-white" strokeWidth={4} />}
        </div>
        <span className="text-sm text-blue-700 group-hover:text-[#0052FF] transition-colors">{label}</span>
      </label>
    );
  }

  const types = ['Amphithéâtre', 'Salle de cours', 'Laboratoire', 'Réunion'];
  const floors = ['RDC', '1er étage', '2ème étage'];
  const capacities = ['1-20', '20-50', '50-100', '100+'];

  return (
    <aside className="w-64 bg-white border-r border-blue-100 flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-5 pt-5 pb-4 border-b border-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0052FF] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">GS</span>
          </div>
          <div>
            <span className="text-base font-bold text-blue-900 leading-none block">G-Salles</span>
            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">EMIT</span>
          </div>
        </div>
      </div>

      <nav className="px-3 pt-4 pb-2 border-b border-blue-50">
        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
        <div className="space-y-0.5">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                activeNav === label
                  ? 'bg-[#0052FF] text-white shadow-sm'
                  : 'text-blue-600 hover:bg-blue-50 hover:text-[#0052FF]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h4 className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <SlidersHorizontal size={12} />
            Type de salle
          </h4>
          <div className="space-y-0.5">
            {types.map(t => (
              <Toggle key={t} label={t} checked={selectedTypes.includes(t)} onChange={() => onToggleType(t)} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Étage</h4>
          <div className="space-y-0.5">
            {floors.map(f => (
              <Toggle key={f} label={f} checked={selectedFloors.includes(f)} onChange={() => onToggleFloor(f)} />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Capacité</h4>
          <div className="space-y-0.5">
            {capacities.map(c => (
              <Toggle key={c} label={c} checked={selectedCapacities.includes(c)} onChange={() => onToggleCapacity(c)} />
            ))}
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full py-2 text-xs font-medium text-blue-500 hover:text-[#0052FF] transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <div className="px-4 py-3 border-t border-blue-50">
        <button className="w-full py-2.5 bg-[#0052FF] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          Appliquer
        </button>
      </div>

      <div className="px-4 py-3 border-t border-blue-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">DR</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900 leading-tight truncate">Dr. Rakoto</p>
          <p className="text-[11px] text-blue-400">Professeur</p>
        </div>
        <button className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

// ─── Weekly Calendar Grid ────────────────────────────────
function CalendarGrid({ onSlotClick }: { onSlotClick: (day: string, hour: number) => void }) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const weekLabel = currentWeekOffset === 0
    ? 'Cette semaine'
    : currentWeekOffset === -1
      ? 'Semaine dernière'
      : `Semaine +${Math.abs(currentWeekOffset)}`;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="px-5 py-3 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-[#0052FF]" />
          <h2 className="text-sm font-semibold text-blue-900">Planning hebdomadaire</h2>
          <span className="text-xs text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md font-medium">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeekOffset(p => p - 1)}
            className="w-8 h-8 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCurrentWeekOffset(0)}
            className="px-3 py-1.5 text-xs font-semibold text-[#0052FF] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setCurrentWeekOffset(p => p + 1)}
            className="w-8 h-8 rounded-xl border border-blue-200 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <div className="grid" style={{ gridTemplateColumns: '70px repeat(6, 1fr)' }}>
            <div className="h-10 bg-blue-50/50 border-b border-blue-100 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Horaire</span>
            </div>
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={`h-10 border-b border-l border-blue-100 flex items-center justify-center ${i === 3 ? 'bg-blue-50' : 'bg-blue-50/50'}`}
              >
                <span className={`text-xs font-semibold ${i === 3 ? 'text-[#0052FF]' : 'text-blue-700'}`}>{day}</span>
              </div>
            ))}

            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="h-14 border-b border-r border-blue-100 flex items-start justify-center pt-2">
                  <span className="text-[11px] text-blue-400 font-medium">{hour.toString().padStart(2, '0')}:00</span>
                </div>
                {DAYS.map((day) => {
                  const cellBookings = getBookingsForCell(day, hour);
                  const hasConflict = cellBookings.some(b => b.status === 'conflict');
                  const isBooked = cellBookings.length > 0 && !hasConflict;
                  const isAvailable = cellBookings.length === 0;
                  const isLunch = hour >= 12 && hour < 13;

                  return (
                    <div
                      key={`${day}-${hour}`}
                      onClick={() => !isBooked && !hasConflict && onSlotClick(day, hour)}
                      className={`h-14 border-b border-l border-blue-100 relative transition-colors duration-150 ${
                        isAvailable && !isLunch ? 'cursor-pointer hover:bg-blue-50 hover:border-[#0052FF]/30' : ''
                      } ${isLunch && !isBooked && !hasConflict ? 'bg-blue-50/30' : ''}`}
                    >
                      {isLunch && !isBooked && !hasConflict && (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[10px] text-blue-300 font-medium">Pause</span>
                        </div>
                      )}

                      {cellBookings.map((booking) => {
                        const room = ROOM_MAP[booking.roomId];
                        if (!room) return null;
                        if (booking.startHour !== hour) return null;
                        const duration = booking.endHour - booking.startHour;
                        const isConflict = booking.status === 'conflict';

                        return (
                          <div
                            key={booking.id}
                            className={`absolute top-0.5 left-0.5 right-0.5 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${isConflict ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}
                            style={{
                              height: `${duration * 56 - 4}px`,
                              background: isConflict ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' : room.color,
                              zIndex: 10,
                            }}
                          >
                            {isConflict ? (
                              <div className="flex items-center gap-1.5 px-2 py-1 h-full">
                                <AlertTriangle size={11} className="text-red-500 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-red-700 leading-tight">Conflit de réservation</p>
                                  <p className="text-[9px] text-red-500 leading-tight">2 cours simultanés</p>
                                </div>
                              </div>
                            ) : (
                              <div className="px-2 py-1 h-full flex flex-col justify-center">
                                <p className="text-[11px] font-semibold text-white leading-tight truncate">{booking.title}</p>
                                <p className="text-[9px] text-white/80 leading-tight truncate">{room.name} · {booking.instructor}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Room Booking Card ───────────────────────────────────
function RoomCard({ room }: { room: RoomCardData }) {
  const amenityIcons: Record<string, React.ReactNode> = {
    'Vidéoprojecteur': <Monitor size={11} />,
    'Climatisation': <span className="text-[10px]">❄</span>,
    'Sono': <span className="text-[10px]">🔊</span>,
    'WiFi': <Wifi size={11} />,
    'Tableau blanc': <span className="text-[10px]">📋</span>,
    '20 postes': <Monitor size={11} />,
    'Tableau': <span className="text-[10px]">📋</span>,
    'Clim': <span className="text-[10px]">❄</span>,
    'Écran': <Monitor size={11} />,
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col group">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Building2 size={18} className="text-[#0052FF]" />
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${room.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {room.available ? 'Disponible' : 'Occupée'}
          </span>
        </div>
        <h3 className="text-base font-bold text-blue-900 mb-1">{room.name}</h3>
        <p className="text-xs text-blue-500 mb-3">{room.type}</p>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Users size={14} className="text-blue-400" /><span>{room.capacity} places</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <MapPin size={14} className="text-blue-400" /><span>{room.floor}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {room.amenities.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-lg">
              {amenityIcons[a] || null}{a}
            </span>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5">
        <button
          className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
            room.available
              ? 'bg-[#0052FF] text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98]'
              : 'bg-blue-50 text-blue-400 cursor-not-allowed'
          }`}
        >
          {room.available ? 'Réserver cette salle' : 'Indisponible'}
        </button>
      </div>
    </div>
  );
}

// ─── Booking Modal ───────────────────────────────────────
function BookingModal({
  isOpen, onClose, selectedSlot,
}: {
  isOpen: boolean; onClose: () => void; selectedSlot: { day: string; hour: number } | null;
}) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', roomId: 1, type: 'Cours', notes: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    setTimeout(() => { setStep('form'); onClose(); }, 2500);
  };

  const slotLabel = selectedSlot ? `${selectedSlot.day} ${selectedSlot.hour.toString().padStart(2, '0')}:00` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 z-10 overflow-hidden">
        <div className="px-6 py-5 border-b border-blue-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-blue-900">{step === 'success' ? 'Réservation confirmée' : 'Nouvelle réservation'}</h2>
            {step === 'form' && selectedSlot && <p className="text-xs text-blue-500 mt-0.5"><Clock size={12} className="inline mr-1" />{slotLabel}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><X size={18} /></button>
        </div>

        {step === 'success' ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto"><Check size={28} className="text-emerald-600" strokeWidth={3} /></div>
            <div><p className="text-lg font-bold text-blue-900">Réservation envoyée !</p><p className="text-sm text-blue-500 mt-1">En attente de validation par l&apos;administration.</p></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center"><DoorOpen size={15} className="text-white" /></div>
              <div><p className="text-sm font-semibold text-blue-900">Créneau sélectionné</p><p className="text-xs text-blue-500">{slotLabel}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-600">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-600">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 bg-white">
                  {['Cours', 'TD', 'TP', 'Examen', 'Réunion', 'Autre'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-600">Début</label>
                <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-600">Fin</label>
                <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-blue-600">Salle</label>
              <select value={form.roomId} onChange={e => setForm({ ...form, roomId: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 bg-white">
                {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name} — {r.capacity} places</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-blue-600">Titre</label>
              <input type="text" placeholder="Ex: Séance de TD Maths" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 placeholder:text-blue-300" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-blue-600">Notes (optionnel)</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 resize-none placeholder:text-blue-300" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0052FF] rounded-xl hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all">Confirmer la réservation</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Component Library ───────────────────────────────────
function ComponentLibrary() {
  const sections = [
    {
      name: 'Boutons',
      items: [
        { label: 'Primary', className: 'bg-[#0052FF] text-white hover:bg-blue-700 shadow-sm' },
        { label: 'Secondary', className: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
        { label: 'Outline', className: 'border border-blue-200 text-blue-700 hover:bg-blue-50' },
        { label: 'Danger', className: 'bg-red-500 text-white hover:bg-red-600 shadow-sm' },
        { label: 'Ghost', className: 'text-blue-600 hover:bg-blue-50' },
        { label: 'Disabled', className: 'bg-blue-50 text-blue-300 cursor-not-allowed' },
      ],
    },
    {
      name: 'Badges',
      items: [
        { label: 'Disponible', className: 'bg-emerald-50 text-emerald-700' },
        { label: 'Occupée', className: 'bg-red-50 text-red-700' },
        { label: 'En attente', className: 'bg-amber-50 text-amber-700' },
        { label: 'Confirmé', className: 'bg-blue-50 text-blue-700' },
        { label: 'Annulé', className: 'bg-blue-50 text-blue-400' },
      ],
    },
    {
      name: 'Champs de saisie',
      items: [
        { label: 'Texte', placeholder: 'Saisir du texte...' },
        { label: 'Date', type: 'date' },
        { label: 'Sélection', isSelect: true, options: ['Option 1', 'Option 2', 'Option 3'] },
        { label: 'Heure', type: 'time' },
      ],
    },
    {
      name: 'Cases à cocher',
      items: [
        { label: 'Option A', checked: true },
        { label: 'Option B', checked: false },
        { label: 'Option C', checked: true },
        { label: 'Option D', checked: false },
      ],
    },
  ];

  return (
    <section className="py-10 px-6 bg-blue-50/30">
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0052FF] flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">⚙</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-900">Bibliothèque de composants</h2>
            <p className="text-xs text-blue-500">Design System — G-Salles EMIT</p>
          </div>
        </div>
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.name}>
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">{section.name}</h3>
              <div className="flex flex-wrap gap-3">
                {section.items.map((item: {
                  label: string; className?: string; placeholder?: string; type?: string; isSelect?: boolean; options?: string[]; checked?: boolean;
                }, i: number) => {
                  if (item.checked !== undefined) {
                    const checked = item.checked;
                    return (
                      <label key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-blue-100 cursor-pointer hover:border-blue-200 transition-colors">
                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ring-1 ring-inset ${checked ? 'bg-[#0052FF] ring-[#0052FF]' : 'bg-white ring-blue-300'}`}>
                          {checked && <Check size={10} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-sm text-blue-700">{item.label}</span>
                      </label>
                    );
                  }
                  if (item.isSelect) {
                    return (
                      <div key={i} className="w-48 space-y-1">
                        <p className="text-xs text-blue-500 font-medium">{item.label}</p>
                        <select className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 bg-white">
                          {item.options?.map((o: string) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    );
                  }
                  if (item.type || item.placeholder) {
                    return (
                      <div key={i} className="w-48 space-y-1">
                        <p className="text-xs text-blue-500 font-medium">{item.label}</p>
                        <input type={item.type || 'text'} placeholder={item.placeholder} className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20" />
                      </div>
                    );
                  }
                  return <button key={i} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${item.className || ''}`}>{item.label}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function BlueDesignPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; hour: number } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<string[]>([]);
  const [activeNav, setActiveNav] = useState('Planning');

  const handleSlotClick = (day: string, hour: number) => {
    setSelectedSlot({ day, hour });
    setModalOpen(true);
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  return (
    <div className="min-h-screen bg-blue-50/50 flex">
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} selectedSlot={selectedSlot} />

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        selectedTypes={selectedTypes}
        selectedFloors={selectedFloors}
        selectedCapacities={selectedCapacities}
        onToggleType={(v) => setSelectedTypes(t => toggleArrayItem(t, v))}
        onToggleFloor={(v) => setSelectedFloors(t => toggleArrayItem(t, v))}
        onToggleCapacity={(v) => setSelectedCapacities(t => toggleArrayItem(t, v))}
        onReset={() => { setSelectedTypes([]); setSelectedFloors([]); setSelectedCapacities([]); }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <CalendarGrid onSlotClick={handleSlotClick} />

        <div className="border-t border-blue-100 py-8 px-6 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={18} className="text-[#0052FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">Nos salles</h2>
              <p className="text-xs text-blue-500">{ROOM_CARDS.filter(r => r.available).length} salles disponibles</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {ROOM_CARDS.map(room => <RoomCard key={room.id} room={room} />)}
          </div>
        </div>

        <ComponentLibrary />
      </div>
    </div>
  );
}
