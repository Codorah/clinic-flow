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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  const performSearch = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      const filtered = (Array.isArray(data) ? data : []).filter((p: any) =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) || 
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.id.includes(search.toLowerCase()) ||
        p.age?.toString().includes(search) ||
        p.treatments?.some((t: any) => t.diagnosis?.toLowerCase().includes(search.toLowerCase()))
      );
      setPatients(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <History className="text-emerald-600" />
          <h2 className="text-2xl font-black text-slate-800">Archives de l'Établissement</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Nom, ID ou Maladie..."
              className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 px-12 font-bold transition-all outline-none"
            />
          </div>
          <button 
            onClick={performSearch}
            className="px-8 h-14 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-50"
          >
            Rechercher
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className="p-6 rounded-2xl border-2 border-slate-50 hover:border-emerald-500 bg-white text-left transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-700">{p.firstName} {p.lastName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {p.id.slice(0, 8)} • Age: {p.age || '?'}</p>
                </div>
                <div className={`text-[10px] font-black px-2 py-1 rounded bg-slate-100 uppercase ${p.status === 'DISCHARGED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {p.status === 'DISCHARGED' ? 'SORTI' : p.status}
                </div>
              </div>
            </button>
          ))}
          {loading && <div className="col-span-full text-center py-12 text-slate-400 italic">Accès à la base de données...</div>}
          {patients.length === 0 && !loading && search && <div className="col-span-full text-center py-12 text-slate-400">Aucun résultat trouvé</div>}
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
