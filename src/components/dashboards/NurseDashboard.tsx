import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { UserCheck, Users, Activity, Thermometer, Heart, Wind, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FlowGuide } from '../FlowGuide';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  assignedNurseId?: string;
  vitals?: any;
}

export const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState({ temp: '', bp: '', hr: '', concerns: '' });
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      
      const newQueue = data.filter((p: any) => p.status === 'NURSE_QUEUE');
      if (newQueue.length > queue.length) {
        setShowNotification("Un nouveau patient est arrivé !");
        setTimeout(() => setShowNotification(null), 5000);
      }
      setQueue(newQueue);

      const active = data.find((p: any) => p.status === 'NURSE_CHECKING' && p.assignedNurseId === user?.id);
      setActivePatient(active || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [user?.id, queue.length]);

  const takePatient = async (id: string) => {
    try {
      await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'NURSE_CHECKING',
          assignedNurseId: user?.id
        })
      });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const submitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    try {
      await fetch(`/api/patients/${activePatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DOCTOR_QUEUE',
          vitals: {
            ...vitals,
            nurseId: user?.id,
            nurseName: user?.displayName,
            timestamp: new Date().toISOString()
          }
        })
      });
      setVitals({ temp: '', bp: '', hr: '', concerns: '' });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="nurse" />
      <AnimatePresence>
        {showNotification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-20 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-white/20 backdrop-blur-xl">
            <AlertCircle size={20} /><span className="font-bold">{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Users className="text-emerald-600" /> File d'Attente </h3>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">{queue.length} Patients</span>
          </div>
          <div className="space-y-4">
            {queue.map(p => (
              <motion.div key={p.id} layoutId={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group">
                <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4>
                <p className="text-xs text-slate-500 mb-4">ID Patient: {p.id.slice(0, 8)}</p>
                <Button onClick={() => takePatient(p.id)} className="w-full rounded-xl bg-white text-emerald-700 border-2 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-bold">Prendre en Charge</Button>
              </motion.div>
            ))}
            {queue.length === 0 && <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400"><CheckCircle2 className="mx-auto mb-2 opacity-20" size={40} /><p className="text-sm font-medium">Aucun patient en attente</p></div>}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activePatient ? (
              <motion.div key="active" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-50 relative overflow-hidden">
                <div className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="size-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700"><UserCheck size={32} /></div>
                    <div><h2 className="text-3xl font-black text-slate-800">{activePatient.firstName} {activePatient.lastName}</h2><p className="text-emerald-600 font-semibold">Vérification des signes vitaux</p></div>
                  </div>
                  <form onSubmit={submitVitals} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><Label className="flex items-center gap-2 font-bold"><Thermometer size={16} /> Temp (°C)</Label><Input value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="36.5" required className="h-14 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="flex items-center gap-2 font-bold"><Activity size={16} /> Tension (BP)</Label><Input value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} placeholder="120/80" required className="h-14 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="flex items-center gap-2 font-bold"><Heart size={16} /> Pouls (HR)</Label><Input value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} placeholder="72" required className="h-14 rounded-xl" /></div>
                    <div className="space-y-2 md:col-span-2"><Label className="flex items-center gap-2 font-bold"><MessageCircle size={16} /> Observations</Label><Textarea value={vitals.concerns} onChange={e => setVitals({...vitals, concerns: e.target.value})} placeholder="Notes cliniques..." required className="rounded-xl min-h-[100px]" /></div>
                    <Button className="md:col-span-2 h-16 rounded-2xl bg-emerald-600 text-white font-black text-xl">Transmettre au Docteur</Button>
                  </form>
                </div>
              </motion.div>
            ) : <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center"><UserCheck size={40} className="mb-4 opacity-20" /><h3 className="text-xl font-bold">Aucun Patient Sélectionné</h3></div> }
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
