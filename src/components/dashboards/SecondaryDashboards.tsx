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
  Scan,
  Scissors
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
  const [completedToday, setCompletedToday] = useState(0);

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setQueue(data.filter((p: any) => p.status === 'LAB_WAITING'));
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

  const completeLab = async (id: string, next: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next })
    });
    fetchQueue();
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
  const [completedToday, setCompletedToday] = useState(0);

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setQueue(data.filter((p: any) => p.status === 'RADIOLOGY_WAITING'));
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

  const complete = async (id: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DOCTOR_QUEUE' })
    });
    fetchQueue();
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
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const fetchQueue = async () => {
    try {
      const [patientsRes, catalogRes] = await Promise.all([
        apiFetch('/api/patients'),
        apiFetch('/api/catalog')
      ]);
      const data = await patientsRes.json();
      setQueue(Array.isArray(data) ? data.filter((p: any) => p.status === 'PHARMACY_WAITING') : []);

      const catalogData = await catalogRes.json();
      if (Array.isArray(catalogData)) {
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

  const dispense = async (id: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CASHIER_WAITING' })
    });
    fetchQueue();
  };

  return (
    <div className="space-y-8">
      <FlowGuide currentStepId="secondary" />

      {/* Low stock alerts panel */}
      {lowStockItems.length > 0 && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-800 space-y-2">
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
  const [revenueToday, setRevenueToday] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);

  const fetchInvoices = async () => {
    try {
      const res = await apiFetch('/api/invoices');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data.filter((inv: any) => inv.status === 'pending'));

        // Calculate stats
        const todayStr = new Date().toDateString();
        const paidToday = data.filter((inv: any) => 
          inv.status === 'paid' && 
          new Date(inv.updatedAt || inv.createdAt).toDateString() === todayStr
        ).reduce((acc: number, inv: any) => acc + inv.amount, 0);
        setRevenueToday(paidToday);

        const pending = data.filter((inv: any) => inv.status === 'pending')
          .reduce((acc: number, inv: any) => acc + inv.amount, 0);
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

  const totalBeds = 20;
  const occupancyPercentage = Math.round((patients.length / totalBeds) * 100);

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

// Surgery / Surgical Block Dashboard
export const SurgeryDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [queue, setQueue] = useState<Patient[]>([]);

  const fetchQueue = async () => {
    const res = await apiFetch('/api/patients');
    const data = await res.json();
    setQueue(Array.isArray(data) ? data.filter((p: any) => p.status === 'SURGERY_WAITING') : []);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchQueue();
  };

  return (
    <div className="space-y-6">
      <FlowGuide currentStepId="secondary" />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-700 shadow-sm shadow-red-50">
          <Scissors size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">File d'attente Bloc Chirurgical</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {queue.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-red-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <UserCheck size={24} />
                  </div>
                  <Clock size={16} className="text-slate-300" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-800 leading-tight">{p.firstName} {p.lastName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intervention chirurgicale requise</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => updateStatus(p.id, 'HOSPITALIZED')}
                  className="w-full h-11 rounded-xl bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 border border-transparent shadow-sm shadow-red-100"
                >
                  Opérer et Hospitaliser
                </Button>
                <Button
                  onClick={() => updateStatus(p.id, 'CASHIER_WAITING')}
                  className="w-full h-11 rounded-xl bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 border border-slate-100"
                >
                  Opérer externe & Facturer
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {queue.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-300 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold italic">Aucun patient en attente d'opération</p>
          </div>
        )}
      </div>
    </div>
  );
};
