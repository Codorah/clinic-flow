import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/button';
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
  Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

interface Invoice {
  id: string;
  patientId: string;
  amount: number;
  status: string;
  patientName?: string;
  patient?: { firstName: string, lastName: string };
}

// Shared Queue View Helper
function QueueView({ title, icon, items, actionLabel, onAction }: { title: string, icon: React.ReactNode, items: Patient[], actionLabel: string, onAction: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm shadow-emerald-50">
          {icon}
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-emerald-300 transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <UserCheck size={24} />
                  </div>
                  <Clock size={16} className="text-slate-300" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-800 leading-tight">{p.firstName} {p.lastName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Traitement en attente</p>
                </div>

                <Button
                   onClick={() => onAction(p.id)}
                  className="w-full h-10 rounded-xl bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white border border-slate-100"
                >
                  {actionLabel}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-300 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold italic">Aucune demande active dans la file</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Laboratory Dashboard
export const LabDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);

  const fetchQueue = async () => {
    const res = await apiFetch('/api/patients');
    const data = await res.json();
    setQueue(Array.isArray(data) ? data.filter((p: any) => p.status === 'LAB_WAITING') : []);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const completeLab = async (id: string, next: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    });
    fetchQueue();
  };

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="secondary" />
      <QueueView
        title="File d'attente Laboratoire"
        icon={<FlaskConical />}
        items={queue}
        actionLabel="Terminer les Tests"
        onAction={(id) => completeLab(id, 'DOCTOR_QUEUE')}
      />
    </div>
  );
};

// Radiology Dashboard
export const RadiologyDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);

  const fetchQueue = async () => {
    const res = await apiFetch('/api/patients');
    const data = await res.json();
    setQueue(Array.isArray(data) ? data.filter((p: any) => p.status === 'RADIOLOGY_WAITING') : []);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const complete = async (id: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DOCTOR_QUEUE' })
    });
    fetchQueue();
  };

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="radiology" />
      <QueueView
        title="File d'attente Radiologie"
        icon={<Scan />}
        items={queue}
        actionLabel="Examens Terminés"
        onAction={complete}
      />
    </div>
  );
};

// Pharmacy Dashboard
export const PharmacyDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);

  const fetchQueue = async () => {
    const res = await apiFetch('/api/patients');
    const data = await res.json();
    setQueue(Array.isArray(data) ? data.filter((p: any) => p.status === 'PHARMACY_WAITING') : []);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const dispense = async (id: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CASHIER_WAITING' })
    });
    fetchQueue();
  };

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="secondary" />
      <QueueView
        title="Dispensaire Pharmacie"
        icon={<Pill />}
        items={queue}
        actionLabel="Délivrer Médicaments"
        onAction={dispense}
      />
    </div>
  );
};

// Cashier / Billing Dashboard
export const CashierDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchInvoices = async () => {
    const res = await apiFetch('/api/invoices');
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data.filter((inv: any) => inv.status === 'pending') : []);
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  const pay = async (inv: Invoice) => {
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
    fetchInvoices();
  };

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="billing" />
      <div className="flex items-center gap-3 mb-8">
        <Receipt className="text-emerald-600" size={32} />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Facturation & Paiements</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {invoices.map(inv => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black text-lg leading-tight">{inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : 'Inconnu'}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Facture #{inv.id.slice(0,8)}</p>
                </div>
                <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Montant Dû</p>
                <p className="text-3xl font-black text-emerald-700">{inv.amount.toLocaleString()} FCFA</p>
              </div>

              <Button
                onClick={() => pay(inv)}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-50"
              >
                Confirmer le Paiement
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {invoices.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-300">
            <CheckCircle2 size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold italic">Aucun paiement en attente</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Hospitalization Dashboard
export const HospitalDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchQueue = async () => {
    const res = await apiFetch('/api/patients');
    const data = await res.json();
    setPatients(Array.isArray(data) ? data.filter((p: any) => p.status === 'HOSPITALIZED') : []);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="secondary" />
      <QueueView
        title="Salles d'Hospitalisation"
        icon={<Hospital />}
        items={patients}
        actionLabel="Prêt pour Sortie"
        onAction={async (id) => {
          await apiFetch(`/api/patients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CASHIER_WAITING' })
          });
          fetchQueue();
        }}
      />
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
