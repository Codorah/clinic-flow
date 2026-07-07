import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import {
  History,
  Search, 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Thermometer, 
  Heart,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  phone: string;
  status: string;
  vitals?: any;
  treatments?: any[];
}

export const PatientHistory: React.FC = () => {
  const { apiFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllPatients(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    let result = [...allPatients];

    // Text search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(p =>
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term) ||
        p.treatments?.some(t => t.diagnosis?.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Age filter
    if (ageFilter !== 'ALL') {
      result = result.filter(p => {
        if (!p.age) return false;
        if (ageFilter === 'CHILD') return p.age < 18;
        if (ageFilter === 'ADULT') return p.age >= 18 && p.age <= 60;
        if (ageFilter === 'SENIOR') return p.age > 60;
        return true;
      });
    }

    setFilteredPatients(result);
  }, [search, allPatients, statusFilter, ageFilter]);

  const statusLabels: Record<string, string> = {
    RECEPTION: 'Enregistrement',
    NURSE_QUEUE: 'Infirmerie (File)',
    NURSE_CHECKING: 'Infirmerie (Soin)',
    DOCTOR_QUEUE: 'Médecin (File)',
    DOCTOR_CONSULTING: 'Médecin (Consult)',
    LAB_WAITING: 'Laboratoire',
    RADIOLOGY_WAITING: 'Radiologie',
    SURGERY_WAITING: 'Bloc Chirurgical',
    PHARMACY_WAITING: 'Pharmacie',
    HOSPITALIZED: 'Hospitalisé',
    CASHIER_WAITING: 'Facturation',
    DISCHARGED: 'Sorti / Congédié'
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="text-emerald-600" />
            <h2 className="text-2xl font-black text-slate-800 animate-pulse">Archives de l'Établissement</h2>
          </div>
          <button 
            onClick={loadPatients}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-2"
          >
            Actualiser les dossiers
          </button>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, diagnostic..."
              className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white px-12 font-bold text-sm transition-all outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-bold text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="ALL">Tous les statuts</option>
              {Object.entries(statusLabels).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-bold text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="ALL">Tous les âges</option>
              <option value="CHILD">Enfants (&lt; 18 ans)</option>
              <option value="ADULT">Adultes (18 - 60 ans)</option>
              <option value="SENIOR">Séniors (&gt; 60 ans)</option>
            </select>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className="p-6 rounded-2xl border-2 border-slate-50 hover:border-emerald-500 bg-white text-left transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start w-full">
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-700">{p.firstName} {p.lastName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {p.id.slice(0, 8)} • Age: {p.age || '?'}</p>
                </div>
                <div className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${
                  p.status === 'DISCHARGED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                  p.status === 'HOSPITALIZED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                  p.status === 'SURGERY_WAITING' ? 'bg-red-50 text-red-700 border border-red-100' :
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {statusLabels[p.status] || p.status}
                </div>
              </div>
            </button>
          ))}
          {loading && <div className="col-span-full text-center py-12 text-slate-400 italic">Accès à la base de données...</div>}
          {filteredPatients.length === 0 && !loading && <div className="col-span-full text-center py-12 text-slate-400">Aucun patient ne correspond aux critères.</div>}
        </div>
      </div>

      <AnimatePresence>
        {selectedPatient && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={() => setSelectedPatient(null)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 font-bold"
            >
              Fermer le Dossier
            </button>

            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="size-20 rounded-[2rem] bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xl">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                    <p className="font-bold text-slate-400">{selectedPatient.phone}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Dernières Constantes</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <VitalItem label="Âge" value={`${selectedPatient.age || '--'} ans`} icon={<Calendar size={14} />} />
                    <VitalItem label="Temp" value={`${selectedPatient.vitals?.temp || '--'}°C`} icon={<Thermometer size={14} />} />
                    <VitalItem label="Tension" value={selectedPatient.vitals?.bp || '--'} icon={<Activity size={14} />} />
                    <VitalItem label="Pouls" value={`${selectedPatient.vitals?.hr || '--'} bpm`} icon={<Heart size={14} />} />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Stethoscope className="text-emerald-600" /> Historique Clinique
                </h4>
                <div className="space-y-6">
                  {selectedPatient.treatments?.map((t: any) => (
                    <div key={t.id} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                          <h5 className="font-bold text-lg">{t.type || 'Évaluation Clinique'}</h5>
                        </div>
                        <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded font-black uppercase">Confirmé</span>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 italic text-sm text-emerald-900 mb-4">
                        "{t.diagnosis || 'Aucun diagnostic enregistré'}"
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <FileText size={14} /> {t.prescriptions || 'Aucune prescription enregistrée'}
                      </div>
                    </div>
                  ))}
                  {(!selectedPatient.treatments || selectedPatient.treatments.length === 0) && (
                    <div className="text-center py-20 text-slate-300">
                      <FileText size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold italic">Aucun traitement enregistré</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function VitalItem({ label, value, icon }: any) {
  return (
    <div className="p-3 bg-white rounded-2xl border">
      <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}
