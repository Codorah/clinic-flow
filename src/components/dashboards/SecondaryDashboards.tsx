import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FlowGuide } from '../FlowGuide';
import {
  FlaskConical,
  Pill,
  Wallet,
  Hospital,
  UserCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  ClipboardCheck,
  Receipt,
  TrendingUp,
  Scan,
  Scissors,
  AlertTriangle,
  Printer,
  Activity,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  treatments?: any[];
  vitals?: any;
}

interface Invoice {
  id: string;
  patientId: string;
  amount: number;
  status: string;
  patientName?: string;
  patient?: { firstName: string, lastName: string };
  createdAt?: string;
}

// Laboratory Dashboard with split console
export const LabDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [form, setForm] = useState({ testType: 'Bilan Sanguin', resultValue: '', severity: 'Normal', notes: '' });

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        const labs = data.filter((p: any) => p.status === 'LAB_WAITING');
        setQueue(labs);
        
        // Auto select if first time or selected patient is gone
        if (labs.length > 0 && !selectedPatient) {
          setSelectedPatient(labs[0]);
        }

        const todayStr = new Date().toDateString();
        const completed = data.filter((p: any) => 
          p.status !== 'LAB_WAITING' && 
          p.status !== 'RECEPTION' &&
          p.status !== 'NURSE_QUEUE' &&
          p.status !== 'NURSE_CHECKING' &&
          new Date(p.updatedAt || p.createdAt).toDateString() === todayStr
        ).length;
        setCompletedToday(completed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      // 1. Save Lab Treatment
      await apiFetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          type: 'LAB_RESULT',
          status: 'completed',
          description: `Examen: ${form.testType} | Résultats: ${form.resultValue} | État: ${form.severity} | Notes: ${form.notes}`,
          diagnosis: form.severity
        })
      });

      // 2. Push patient back to Doctor
      await apiFetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DOCTOR_QUEUE' })
      });

      setForm({ testType: 'Bilan Sanguin', resultValue: '', severity: 'Normal', notes: '' });
      setSelectedPatient(null);
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="secondary" />

      {/* Lab Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyses en attente</p>
            <p className="text-2xl font-black text-slate-800">{queue.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyses terminées aujourd'hui</p>
            <p className="text-2xl font-black text-slate-800">{completedToday}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue side */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><FlaskConical className="text-emerald-600" /> File Laboratoire</h3>
          <div className="space-y-4">
            {queue.map(p => (
              <motion.div 
                key={p.id} 
                layoutId={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedPatient?.id === p.id ? 'bg-emerald-50/50 border-emerald-500 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'}`}
              >
                <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4>
                <p className="text-xs text-slate-400 mt-1">ID: #{p.id.slice(0, 8)}</p>
              </motion.div>
            ))}
            {queue.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} />
                <p className="text-sm font-medium">Aucun examen en attente</p>
              </div>
            )}
          </div>
        </div>

        {/* Console Side */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key={selectedPatient.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                    <FlaskConical size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-emerald-600 font-semibold">Saisie des résultats d'examens</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Type d'Examen Requis</Label>
                      <select 
                        value={form.testType} 
                        onChange={e => setForm({...form, testType: e.target.value})}
                        className="w-full h-14 rounded-xl border border-slate-200 px-4 focus:outline-emerald-500 text-slate-700 bg-white"
                      >
                        <option>Bilan Sanguin (NFS)</option>
                        <option>Glycémie à jeun</option>
                        <option>Test de Paludisme (TDR)</option>
                        <option>Analyse d'Urine (Urine Test)</option>
                        <option>Groupe Sanguin / Rhésus</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">État Clinique</Label>
                      <select 
                        value={form.severity} 
                        onChange={e => setForm({...form, severity: e.target.value})}
                        className="w-full h-14 rounded-xl border border-slate-200 px-4 focus:outline-emerald-500 text-slate-700 bg-white"
                      >
                        <option value="Normal">Normal (Indicateurs stables)</option>
                        <option value="Anomalie Mineure">Anomalie Mineure</option>
                        <option value="Alerte Critique">Alerte Critique / Élevé</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Valeurs & Mesures (ex: Glycémie = 1.10g/L)</Label>
                    <Input 
                      value={form.resultValue} 
                      onChange={e => setForm({...form, resultValue: e.target.value})}
                      placeholder="Indiquez les chiffres ou constats exacts..."
                      required
                      className="h-14 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Observations complémentaires du Laborantin</Label>
                    <Textarea 
                      value={form.notes} 
                      onChange={e => setForm({...form, notes: e.target.value})}
                      placeholder="Remarques éventuelles sur la qualité du prélèvement..."
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50">
                    Enregistrer et Renvoyer au Médecin
                  </Button>
                </form>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <FlaskConical size={40} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Aucun Patient Sélectionné</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Radiology Dashboard with split console
export const RadiologyDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [form, setForm] = useState({ scanType: 'Radiographie X-Ray', bodyPart: '', findings: '', conclusion: '' });

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        const rads = data.filter((p: any) => p.status === 'RADIOLOGY_WAITING');
        setQueue(rads);
        if (rads.length > 0 && !selectedPatient) {
          setSelectedPatient(rads[0]);
        }

        const todayStr = new Date().toDateString();
        const completed = data.filter((p: any) => 
          p.status !== 'RADIOLOGY_WAITING' && 
          p.status !== 'RECEPTION' &&
          p.status !== 'NURSE_QUEUE' &&
          p.status !== 'NURSE_CHECKING' &&
          new Date(p.updatedAt || p.createdAt).toDateString() === todayStr
        ).length;
        setCompletedToday(completed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      await apiFetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          type: 'RADIOLOGY_REPORT',
          status: 'completed',
          description: `Radiologie: ${form.scanType} | Zone: ${form.bodyPart} | Constatations: ${form.findings} | Conclusion: ${form.conclusion}`
        })
      });

      await apiFetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DOCTOR_QUEUE' })
      });

      setForm({ scanType: 'Radiographie X-Ray', bodyPart: '', findings: '', conclusion: '' });
      setSelectedPatient(null);
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="radiology" />

      {/* Radiology Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examens en attente</p>
            <p className="text-2xl font-black text-slate-800">{queue.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examens terminés aujourd'hui</p>
            <p className="text-2xl font-black text-slate-800">{completedToday}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Scan className="text-purple-600" /> Imagerie Médicale</h3>
          <div className="space-y-4">
            {queue.map(p => (
              <motion.div 
                key={p.id} 
                layoutId={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedPatient?.id === p.id ? 'bg-purple-50/50 border-purple-500 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-purple-300'}`}
              >
                <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4>
                <p className="text-xs text-slate-400 mt-1">ID: #{p.id.slice(0, 8)}</p>
              </motion.div>
            ))}
            {queue.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} />
                <p className="text-sm font-medium">Aucune demande active</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key={selectedPatient.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-8 rounded-[2rem] border border-purple-100 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
                    <Scan size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-purple-600 font-semibold">Rédaction du rapport d'imagerie</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Type d'Imagerie</Label>
                      <select 
                        value={form.scanType} 
                        onChange={e => setForm({...form, scanType: e.target.value})}
                        className="w-full h-14 rounded-xl border border-slate-200 px-4 focus:outline-purple-500 text-slate-700 bg-white"
                      >
                        <option>Radiographie Standard</option>
                        <option>Échographie Abdominale / Pelvienne</option>
                        <option>Scanner CT (Tomographie)</option>
                        <option>IRM (Résonance Magnétique)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Région Anatomique</Label>
                      <Input 
                        value={form.bodyPart} 
                        onChange={e => setForm({...form, bodyPart: e.target.value})}
                        placeholder="Ex: Poumon, Genou Gauche..."
                        required
                        className="h-14 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Observations / Constatations radiologiques</Label>
                    <Textarea 
                      value={form.findings} 
                      onChange={e => setForm({...form, findings: e.target.value})}
                      placeholder="Décrivez les anomalies observées sur le cliché..."
                      required
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Conclusion d'Imagerie</Label>
                    <Textarea 
                      value={form.conclusion} 
                      onChange={e => setForm({...form, conclusion: e.target.value})}
                      placeholder="Ex: Intégrité osseuse préservée, suspicion de foyer infectieux..."
                      required
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>

                  <Button className="w-full h-16 rounded-2xl bg-purple-600 text-white font-black text-xl hover:bg-purple-700 shadow-lg shadow-purple-50">
                    Transmettre le Rapport au Médecin
                  </Button>
                </form>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <Scan size={40} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Aucun Patient Sélectionné</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Pharmacy Dashboard with Prescription cross-check and live stock decrement
export const PharmacyDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [dispensedItems, setDispensedItems] = useState<{ [key: string]: boolean }>({});

  const fetchQueue = async () => {
    try {
      const [patientsRes, catalogRes] = await Promise.all([
        apiFetch('/api/patients'),
        apiFetch('/api/catalog')
      ]);
      const data = await patientsRes.json();
      const pharms = Array.isArray(data) ? data.filter((p: any) => p.status === 'PHARMACY_WAITING') : [];
      setQueue(pharms);
      if (pharms.length > 0 && !selectedPatient) {
        setSelectedPatient(pharms[0]);
      }

      const catalogData = await catalogRes.json();
      if (Array.isArray(catalogData)) {
        setCatalogItems(catalogData);
        setLowStockItems(catalogData.filter((item: any) => item.stock <= item.minStock));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispense = async () => {
    if (!selectedPatient) return;

    try {
      // Find matches between catalog and prescription
      const latestConsultation = selectedPatient.treatments?.find(t => t.type === 'Consultation');
      const prescriptionsText = latestConsultation?.prescriptions || '';

      // Decrement stock for matched items in prescription text
      for (const item of catalogItems) {
        if (item.category === 'MEDICINE' && prescriptionsText.toLowerCase().includes(item.name.toLowerCase())) {
          const currentStock = item.stock;
          const newStock = Math.max(0, currentStock - 1);
          await apiFetch(`/api/catalog/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
          });
        }
      }

      // Complete patient step to Cashier Wait
      await apiFetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CASHIER_WAITING' })
      });

      setSelectedPatient(null);
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const getPrescriptionBreakdown = () => {
    if (!selectedPatient) return [];
    const latestConsultation = selectedPatient.treatments?.find(t => t.type === 'Consultation');
    const prescriptionsText = latestConsultation?.prescriptions || '';

    // Check catalog matches
    return catalogItems.filter(item => 
      prescriptionsText.toLowerCase().includes(item.name.toLowerCase())
    );
  };

  const latestConsultation = selectedPatient?.treatments?.find(t => t.type === 'Consultation');
  const prescriptionMatches = getPrescriptionBreakdown();

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="secondary" />

      {/* Low stock alerts panel */}
      {lowStockItems.length > 0 && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-800 space-y-2 shadow-sm">
          <h4 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
            ⚠️ Alerte Rupture de Stock Médicaments
          </h4>
          <p className="text-xs text-red-600 font-medium">Les articles suivants ont atteint ou dépassé leur seuil d'alerte :</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {lowStockItems.map(item => (
              <span key={item.id} className="px-3 py-1 bg-red-100 border border-red-200 text-red-700 rounded-xl text-[10px] font-black uppercase">
                {item.name} ({item.stock} restants)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Pill className="text-emerald-600" /> Prescriptions Attente</h3>
          <div className="space-y-4">
            {queue.map(p => (
              <motion.div 
                key={p.id} 
                layoutId={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedPatient?.id === p.id ? 'bg-emerald-50/50 border-emerald-500 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'}`}
              >
                <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4>
                <p className="text-xs text-slate-400 mt-1">ID: #{p.id.slice(0, 8)}</p>
              </motion.div>
            ))}
            {queue.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} />
                <p className="text-sm font-medium">Aucune ordonnance à délivrer</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key={selectedPatient.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Pill size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-emerald-600 font-semibold">Ordonnance rédigée par le médecin</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prescription Médecin</p>
                    <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed italic">
                      "{latestConsultation?.prescriptions || 'Aucune consigne médicamenteuse trouvée.'}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-600">Cross-référence Inventaire</h4>
                    {prescriptionMatches.length > 0 ? (
                      <div className="space-y-3">
                        {prescriptionMatches.map(item => (
                          <div key={item.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                            <div>
                              <p className="font-bold text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-500">Tarif : {item.price.toLocaleString()} FCFA</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.stock <= item.minStock ? (
                                <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg">Rupture / Faible ({item.stock})</span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg">Disponible ({item.stock})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucune correspondance trouvée dans le catalogue clinique.</p>
                    )}
                  </div>

                  <Button 
                    onClick={handleDispense}
                    className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50"
                  >
                    Délivrer & Mettre à jour les stocks
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <Pill size={40} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Aucun Patient Sélectionné</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Cashier / Billing Dashboard with printable receipts and invoice details
export const CashierDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [recentPaid, setRecentPaid] = useState<Invoice[]>([]);
  const [revenueToday, setRevenueToday] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await apiFetch('/api/invoices');
      const data = await res.json();
      if (Array.isArray(data)) {
        const pends = data.filter((inv: any) => inv.status === 'pending');
        setInvoices(pends);
        if (pends.length > 0 && !selectedInvoice) {
          setSelectedInvoice(pends[0]);
        }

        const todayStr = new Date().toDateString();
        const paidToday = data.filter((inv: any) => 
          inv.status === 'paid' && 
          new Date(inv.updatedAt || inv.createdAt).toDateString() === todayStr
        );
        setRecentPaid(paidToday);
        setRevenueToday(paidToday.reduce((acc, inv) => acc + inv.amount, 0));

        const pending = pends.reduce((acc, inv) => acc + inv.amount, 0);
        setPendingRevenue(pending);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  const pay = async (inv: Invoice) => {
    try {
      await apiFetch(`/api/invoices/${inv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });
      await apiFetch(`/api/patients/${inv.patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISCHARGED' })
      });
      setShowReceiptModal(true);
      fetchInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="billing" />
      
      {/* Cashier KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recette du Jour</p>
            <p className="text-2xl font-black text-slate-800">{revenueToday.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encours Factures</p>
            <p className="text-2xl font-black text-slate-800">{pendingRevenue.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="size-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Factures en attente</p>
            <p className="text-2xl font-black text-slate-800">{invoices.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Receipt className="text-emerald-600" /> Factures Impayées</h3>
          <div className="space-y-4">
            {invoices.map(inv => (
              <motion.div 
                key={inv.id} 
                layoutId={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedInvoice?.id === inv.id ? 'bg-emerald-50/50 border-emerald-500 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'}`}
              >
                <h4 className="font-bold text-slate-800">{inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : 'Patient Inconnu'}</h4>
                <p className="text-xs text-emerald-700 font-bold mt-1">{inv.amount.toLocaleString()} FCFA</p>
              </motion.div>
            ))}
            {invoices.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} />
                <p className="text-sm font-medium">Tout est en règle</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedInvoice ? (
              <motion.div 
                key={selectedInvoice.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Receipt size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">{selectedInvoice.patient ? `${selectedInvoice.patient.firstName} ${selectedInvoice.patient.lastName}` : 'Inconnu'}</h2>
                    <p className="text-emerald-600 font-semibold">Caisse & Règlement de la facture #{selectedInvoice.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prestation</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Montant</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                      <span>Prestations Cliniques Globales (Consultation, actes ou prescriptions)</span>
                      <span>{selectedInvoice.amount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black text-slate-800 pt-4 border-t border-dashed border-slate-200">
                      <span>Total</span>
                      <span className="text-emerald-700">{selectedInvoice.amount.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => pay(selectedInvoice)}
                    className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-xl hover:bg-emerald-700 shadow-lg shadow-emerald-50"
                  >
                    Confirmer le Règlement & Imprimer le Reçu
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <Receipt size={40} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Sélectionnez une facture</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-600" /> Historique Récent des Encaissements</h3>
        {recentPaid.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucun encaissement réalisé aujourd'hui.</p>
        ) : (
          <div className="space-y-3">
            {recentPaid.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : 'Inconnu'}</p>
                    <p className="text-[10px] text-slate-400">Facture #{inv.id.slice(0, 8)}</p>
                  </div>
                </div>
                <p className="font-black text-slate-800">{inv.amount.toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal Mockup */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-2xl space-y-6 relative border border-slate-100"
          >
            <div className="text-center space-y-2">
              <h3 className="font-black text-2xl text-slate-800">ClinicFlow</h3>
              <p className="text-xs text-slate-400">Reçu de Caisse Officiel</p>
              <div className="h-0.5 w-full border-t-2 border-dashed border-slate-200 my-4" />
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex justify-between"><span>Patient :</span><span className="text-slate-800 font-bold">{selectedInvoice?.patient ? `${selectedInvoice.patient.firstName} ${selectedInvoice.patient.lastName}` : 'Inconnu'}</span></div>
              <div className="flex justify-between"><span>Date :</span><span>{new Date().toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Statut :</span><span className="text-emerald-600 font-bold">PAYÉ</span></div>
              <div className="flex justify-between text-base font-black text-slate-800 pt-4 border-t border-dashed border-slate-200">
                <span>Montant perçu :</span>
                <span>{selectedInvoice?.amount.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="space-y-2 pt-6">
              <Button 
                onClick={() => setShowReceiptModal(false)}
                className="w-full h-12 bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Fermer & Imprimer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Hospitalization Dashboard with 20 Bed Grid Allocation layout
export const HospitalDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      setPatients(Array.isArray(data) ? data.filter((p: any) => p.status === 'HOSPITALIZED') : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDischarge = async (id: string) => {
    try {
      await apiFetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CASHIER_WAITING' })
      });
      setSelectedPatient(null);
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const totalBeds = 20;
  const occupancyPercentage = Math.round((patients.length / totalBeds) * 100);

  // Generate 20 Beds
  const beds = Array.from({ length: totalBeds }, (_, idx) => {
    const patient = patients[idx] || null;
    return {
      bedNumber: idx + 1,
      patient
    };
  });

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="secondary" />

      {/* Bed Occupancy Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xl font-black text-slate-800">Taux d'Occupation des Lits</h4>
            <p className="text-xs text-slate-400 font-medium">Capacité totale autorisée de l'établissement : 20 lits.</p>
          </div>
          <span className="text-lg font-black text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-2xl">
            {patients.length} / {totalBeds} Occupés ({occupancyPercentage}%)
          </span>
        </div>

        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${occupancyPercentage}%` }} 
            className="h-full bg-emerald-600 rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Beds layout grid */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Hospital className="text-emerald-600" /> Plan des Lits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {beds.map(bed => (
              <div 
                key={bed.bedNumber}
                onClick={() => bed.patient && setSelectedPatient(bed.patient)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                  bed.patient 
                    ? selectedPatient?.id === bed.patient.id 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md scale-95' 
                      : 'border-blue-200 bg-blue-50/20 hover:border-blue-400' 
                    : 'border-slate-100 bg-slate-50/50 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${bed.patient ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>Lit #{bed.bedNumber}</span>
                  <Hospital size={16} className={bed.patient ? 'text-blue-500' : 'text-slate-300'} />
                </div>
                
                {bed.patient ? (
                  <div>
                    <p className="font-black text-slate-800 text-xs truncate">{bed.patient.firstName} {bed.patient.lastName}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Occupé</p>
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400">Disponible</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected patient hospital details */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key={selectedPatient.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-xl space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-0.5">Dossier Hospitalisation</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex justify-between"><span>Identifiant :</span><span>#{selectedPatient.id.slice(0, 8)}</span></div>
                  
                  {selectedPatient.vitals && (
                    <div className="space-y-2 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="font-black text-slate-500 uppercase tracking-wider text-[10px] mb-2">Constantes d'Admission</p>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div className="flex items-center gap-1"><Heart size={12} className="text-red-500" /> HR: {selectedPatient.vitals.hr}</div>
                        <div className="flex items-center gap-1"><Activity size={12} className="text-emerald-500" /> BP: {selectedPatient.vitals.bp}</div>
                        <div className="flex items-center gap-1"><Activity size={12} className="text-amber-500" /> Temp: {selectedPatient.vitals.temp} °C</div>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleDischarge(selectedPatient.id)}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Libérer le lit & Envoyer à la Caisse
                </Button>
              </motion.div>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 text-center">
                <Hospital size={32} className="mb-2 opacity-30" />
                <p className="text-xs font-bold">Sélectionnez un lit occupé pour voir les détails cliniques</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Accounting Dashboard
export const AccountingDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await apiFetch('/api/invoices');
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 8000);
    return () => clearInterval(interval);
  }, []);

  const total = invoices.reduce((acc, inv) => acc + (inv.status === 'paid' ? inv.amount : 0), 0);
  const pending = invoices.reduce((acc, inv) => acc + (inv.status === 'pending' ? inv.amount : 0), 0);
  const count = invoices.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center"><TrendingUp size={40} className="mx-auto mb-3 animate-pulse opacity-30" /><p className="font-medium">Chargement des données…</p></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-100 flex justify-between items-center">
          <div><p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">Total Collecté</p><h3 className="text-4xl font-black">{total.toLocaleString()} FCFA</h3></div>
          <TrendingUp size={40} className="opacity-20" />
        </div>
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 flex justify-between items-center shadow-sm">
          <div><p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">En Attente</p><h3 className="text-4xl font-black text-amber-600">{pending.toLocaleString()} FCFA</h3></div>
          <Clock size={40} className="text-slate-100" />
        </div>
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 flex justify-between items-center shadow-sm">
          <div><p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Transactions</p><h3 className="text-4xl font-black text-slate-800">{count}</h3></div>
          <DollarSign size={40} className="text-slate-100" />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold mb-6">Transactions Récentes</h3>
        {invoices.length === 0 ? (
          <div className="py-16 text-center text-slate-300">
            <Receipt size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold italic">Aucune transaction</p>
            <p className="text-sm mt-1">Les factures apparaîtront après les consultations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.slice().reverse().map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {inv.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : `Facture #${inv.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">{inv.status === 'paid' ? 'Payée' : 'En attente'}</p>
                  </div>
                </div>
                <p className="font-black text-lg text-slate-800">{inv.amount.toLocaleString()} FCFA</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Surgery / Surgical Block Dashboard with report writing Split Screen console
export const SurgeryDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ surgeryType: 'Générale', anesthesia: 'Générale', duration: '60', details: '', nextStatus: 'HOSPITALIZED' });

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      const surgs = Array.isArray(data) ? data.filter((p: any) => p.status === 'SURGERY_WAITING') : [];
      setQueue(surgs);
      if (surgs.length > 0 && !selectedPatient) {
        setSelectedPatient(surgs[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      // 1. Create Surgical report treatment
      await apiFetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          type: 'SURGERY_REPORT',
          status: 'completed',
          description: `Type: ${form.surgeryType} | Anesthésie: ${form.anesthesia} | Durée: ${form.duration} mins | Observations: ${form.details}`
        })
      });

      // 2. Update patient status
      await apiFetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: form.nextStatus })
      });

      setForm({ surgeryType: 'Générale', anesthesia: 'Générale', duration: '60', details: '', nextStatus: 'HOSPITALIZED' });
      setSelectedPatient(null);
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="secondary" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Scissors className="text-red-600" /> Chirurgie Attente</h3>
          <div className="space-y-4">
            {queue.map(p => (
              <motion.div 
                key={p.id} 
                layoutId={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${selectedPatient?.id === p.id ? 'bg-red-50/50 border-red-500 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-red-300'}`}
              >
                <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4>
                <p className="text-xs text-slate-400 mt-1">ID: #{p.id.slice(0, 8)}</p>
              </motion.div>
            ))}
            {queue.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} />
                <p className="text-sm font-medium">Aucun patient en attente d'opération</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key={selectedPatient.id}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-8 rounded-[2rem] border border-red-100 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-700">
                    <Scissors size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-red-600 font-semibold">Rédaction du protocole opératoire</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Type d'Intervention</Label>
                      <Input 
                        value={form.surgeryType} 
                        onChange={e => setForm({...form, surgeryType: e.target.value})}
                        placeholder="Ex: Appendicectomie..."
                        required
                        className="h-14 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Anesthésie</Label>
                      <select 
                        value={form.anesthesia} 
                        onChange={e => setForm({...form, anesthesia: e.target.value})}
                        className="w-full h-14 rounded-xl border border-slate-200 px-4 focus:outline-red-500 text-slate-700 bg-white"
                      >
                        <option>Générale</option>
                        <option>Locale / Régionale</option>
                        <option>Péridurale</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Durée (minutes)</Label>
                      <Input 
                        value={form.duration} 
                        onChange={e => setForm({...form, duration: e.target.value})}
                        type="number"
                        placeholder="60"
                        required
                        className="h-14 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Protocole Opératoire / Incidents / Constats</Label>
                    <Textarea 
                      value={form.details} 
                      onChange={e => setForm({...form, details: e.target.value})}
                      placeholder="Indiquez les détails de l'intervention..."
                      required
                      className="rounded-xl min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Orientation Post-Opératoire</Label>
                    <select 
                      value={form.nextStatus} 
                      onChange={e => setForm({...form, nextStatus: e.target.value})}
                      className="w-full h-14 rounded-xl border border-slate-200 px-4 focus:outline-red-500 text-slate-700 bg-white"
                    >
                      <option value="HOSPITALIZED">Hospitalisation (Suivi post-opératoire requis)</option>
                      <option value="CASHIER_WAITING">Sortie Externe / Facturation immédiate</option>
                    </select>
                  </div>

                  <Button className="w-full h-16 rounded-2xl bg-red-600 text-white font-black text-xl hover:bg-red-700 shadow-lg shadow-red-50">
                    Valider l'Opération & Orienter le Patient
                  </Button>
                </form>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <Scissors size={40} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Aucun Patient Sélectionné</h3>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
