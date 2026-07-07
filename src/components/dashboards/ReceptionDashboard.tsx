import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { UserPlus, Users, ArrowRight, CheckCircle2, Clock, Search, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FlowGuide } from '../FlowGuide';
import { PatientHistory } from '../PatientHistory';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  emergencyContact: string;
  status: string;
  createdAt: string;
}

export const ReceptionDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [emergency, setEmergency] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) setPatients(data.filter((p: any) => p.status === 'RECEPTION'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch('/api/patients', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, age: parseInt(age), phone, emergencyContact: emergency, status: 'RECEPTION' })
      });
      setFirstName(''); setLastName(''); setAge(''); setPhone(''); setEmergency('');
      fetchQueue();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendToNurse = async (id: string) => {
    try {
      await apiFetch(`/api/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'NURSE_QUEUE' })
      });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="reception" />

      {/* Tabs */}
      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-2xl max-w-md border border-slate-100">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'register' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserPlus size={16} /> Enregistrement
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Search size={16} /> Recherche & Archives
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'register' ? (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8 text-emerald-700">
                <UserPlus size={24} />
                <h3 className="text-xl font-bold">Enregistrement Nouveau Patient</h3>
              </div>
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Prénom</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Prénom" className="rounded-xl h-12" /></div>
                  <div className="space-y-2"><Label>Nom de Famille</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Nom" className="rounded-xl h-12" /></div>
                  <div className="space-y-2"><Label>Âge</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} required placeholder="Ex: 25" className="rounded-xl h-12" /></div>
                  <div className="space-y-2"><Label>Numéro de Téléphone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="06.." className="rounded-xl h-12" /></div>
                </div>
                <div className="space-y-2"><Label>Contact d'Urgence</Label><Input value={emergency} onChange={e => setEmergency(e.target.value)} required placeholder="Nom & Tel" className="rounded-xl h-12" /></div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95">
                  {isSubmitting ? "Enregistrement..." : "Terminer l'Enregistrement"}
                </Button>
              </form>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-slate-700"><Users size={24} /><h3 className="text-xl font-bold">File d'Enregistrement</h3></div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{patients.length} En attente</span>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {patients.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 50 }}
                      className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                      <div>
                        <h4 className="font-bold text-slate-800">{p.firstName} {p.lastName}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12} /> Enregistré à {new Date(p.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <Button onClick={() => sendToNurse(p.id)} variant="outline" className="rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200">
                        <span className="mr-2 font-bold text-xs uppercase tracking-wider">Envoyer à l'Infirmier(e)</span>
                        <ArrowRight size={16} />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {patients.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200"><CheckCircle2 size={32} /></div>
                    <p className="font-medium italic">File d'attente vide</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <PatientHistory />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
