import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Stethoscope, 
  User, 
  Activity, 
  FlaskConical, 
  Pill, 
  Hospital, 
  ChevronRight, 
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FlowGuide } from '../FlowGuide';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  assignedDoctorId?: string;
  vitals?: any;
}

interface Treatment {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  const fetchData = async () => {
    try {
      const catRes = await fetch('/api/catalog');
      const catData = await catRes.json();
      setTreatments(catData);

      const qRes = await fetch('/api/patients');
      const qData = await qRes.json();
      setQueue(qData.filter((p: any) => p.status === 'DOCTOR_QUEUE'));
      
      const active = qData.find((p: any) => p.status === 'DOCTOR_CONSULTING' && p.assignedDoctorId === user?.id);
      setActivePatient(active || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const cost = selectedTreatments.reduce((acc, t) => acc + t.price, 0);
    setTotalCost(cost);
  }, [selectedTreatments]);

  const takePatient = async (id: string) => {
    const patient = queue.find(p => p.id === id);
    if (!patient) return;
    
    // Immediate UI feedback
    setQueue(prev => prev.filter(p => p.id !== id));
    
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DOCTOR_CONSULTING', assignedDoctorId: user?.id })
    });
    fetchData();
  };

  const toggleTreatment = (t: Treatment) => {
    if (selectedTreatments.find(item => item.id === t.id)) {
      setSelectedTreatments(selectedTreatments.filter(item => item.id !== t.id));
    } else {
      setSelectedTreatments([...selectedTreatments, t]);
    }
  };

  const handleComplete = async (nextStatus: string) => {
    if (!activePatient) return;
    
    // Create Treatment Record
    await fetch('/api/treatments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: activePatient.id,
        type: 'General Consultation',
        status: 'completed',
        diagnosis: diagnosis,
        prescriptions: selectedTreatments.map(t => t.name).join(', '),
        description: `Consultation by Dr. ${user?.displayName}`
      })
    });

    // Create Invoice
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: activePatient.id,
        amount: totalCost,
        status: 'pending',
        service: selectedTreatments.map(t => t.name).join(', ')
      })
    });

    // Update Patient Status
    await fetch(`/api/patients/${activePatient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, vitals: activePatient.vitals })
    });

    setDiagnosis('');
    setSelectedTreatments([]);
    fetchData();
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="doctor" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><ClipboardList className="text-emerald-600" /> File d'Attente </h3>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">{queue.length} Prêts</span>
          </div>
          <div className="space-y-4">
            {queue.map(p => (
              <motion.div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm group hover:border-emerald-300 transition-all">
                <div className="flex justify-between items-start mb-2"> <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4><ChevronRight size={16} /></div>
                <Button onClick={() => takePatient(p.id)} className="w-full rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-600 hover:text-white font-bold">Lancer la Consultation</Button>
              </motion.div>
            ))}
            {queue.length === 0 && <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400"><CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} /><p className="text-sm font-medium italic">Tous les dossiers traités</p></div>}
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activePatient ? (
              <motion.div key="active" className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                      <div className="size-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700"><User size={28} /></div>
                      <div><h3 className="font-bold text-xl">{activePatient.firstName} {activePatient.lastName}</h3><p className="text-xs text-slate-400">{activePatient.id.slice(0,8)}</p></div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-slate-400">Observations Infirmières</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-2xl border"><p className="text-[9px] uppercase font-bold text-slate-400">Temp</p><p className="text-sm font-black">{activePatient.vitals?.temp}°C</p></div>
                        <div className="bg-slate-50 p-3 rounded-2xl border"><p className="text-[9px] uppercase font-bold text-slate-400">Tension</p><p className="text-sm font-black">{activePatient.vitals?.bp}</p></div>
                        <div className="bg-slate-50 p-3 rounded-2xl border"><p className="text-[9px] uppercase font-bold text-slate-400">Pouls</p><p className="text-sm font-black">{activePatient.vitals?.hr} bpm</p></div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 italic font-medium">"{activePatient.vitals?.concerns}"</div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between mb-8">
                       <div className="flex items-center gap-3"><Stethoscope className="text-emerald-600" /><h3 className="text-2xl font-black text-slate-800">Évaluation Clinique</h3></div>
                       <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-lg">{totalCost.toLocaleString()} FCFA</div>
                    </div>
                    <div className="space-y-8 flex-1">
                      <div className="space-y-4"><Label className="text-lg font-bold">Diagnostic Final</Label><Textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Saisir les conclusions..." className="min-h-[120px] rounded-2xl bg-slate-50 p-4" /></div>
                      <div className="space-y-4"><Label className="text-lg font-bold">Traitements & Procédures</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {treatments.map(t => (
                            <button key={t.id} onClick={() => toggleTreatment(t)} className={`p-3 rounded-2xl border text-left transition-all ${selectedTreatments.find(item => item.id === t.id) ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>
                              <p className="text-xs font-bold truncate">{t.name}</p><p className="text-[10px] opacity-70">{t.price} FCFA</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                      <Button className="h-14 rounded-xl" variant="outline" onClick={() => handleComplete('LAB_WAITING')}><FlaskConical className="mr-2" size={18} /> Laboratoire</Button>
                      <Button className="h-14 rounded-xl" variant="outline" onClick={() => handleComplete('PHARMACY_WAITING')}><Pill className="mr-2" size={18} /> Pharmacie</Button>
                      <Button className="h-14 rounded-xl" variant="outline" onClick={() => handleComplete('HOSPITALIZED')}><Hospital className="mr-2" size={18} /> Hospit.</Button>
                      <Button className="h-14 rounded-xl bg-emerald-600 text-white" onClick={() => handleComplete('CASHIER_WAITING')}><CheckCircle2 className="mr-2" size={18} /> Terminer</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"> <Stethoscope size={48} className="mb-4 opacity-20" /><h3 className="text-xl font-bold">Sélectionnez un Patient</h3></div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
