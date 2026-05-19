import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Database, 
  PieChart, 
  BarChart3, 
  Settings,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Plus,
  Shield,
  Trash2,
  Key,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'settings'>('analytics');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    activeTreatments: 0,
    pendingInvoices: 0
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editingHospitalName, setEditingHospitalName] = useState('');
  const [provisioning, setProvisioning] = useState(false);

  // User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState('reception');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchData = async () => {
    try {
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsersList(usersData);

      const hospitalRes = await fetch('/api/hospital');
      const hospitalData = await hospitalRes.json();
      setEditingHospitalName(hospitalData.name);

      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateHospital = async () => {
    try {
      await fetch('/api/hospital', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingHospitalName })
      });
      alert("Hospital profiling updated!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername || undefined,
          email: newEmail || undefined,
          password: newPassword || undefined,
          pin: newPin || undefined,
          role: newRole,
          displayName: newUsername ? (newUsername.charAt(0).toUpperCase() + newUsername.slice(1)) : (newEmail ? newEmail.split('@')[0] : 'Staff')
        })
      });
      setNewUsername('');
      setNewPin('');
      setNewEmail('');
      setNewPassword('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: string, email?: string) => {
    if (email === 'ceo.codorah@gmail.com') return alert("Cannot delete main admin!");
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Analyses Diagnostiques</h1>
          <p className="text-slate-500 font-medium">Matrice de Performance Clinique</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {[
            { id: 'analytics', label: 'Analyses' },
            { id: 'users', label: 'Personnel' },
            { id: 'settings', label: 'Paramètres' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          <div className="flex gap-4 justify-end">
            <Button onClick={fetchData} className="rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold">
              <RefreshCcw size={18} />
            </Button>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard label="Revenu Brut" value={`${stats.totalRevenue.toLocaleString()} FCFA`} trend="+14.2%" icon={<DollarSign className="text-emerald-600" />} color="emerald" />
            <KPICard label="Total Patients" value={stats.totalPatients.toString()} trend="+28" icon={<Users className="text-blue-600" />} color="blue" />
            <KPICard label="Traitements Actifs" value={stats.activeTreatments.toString()} trend="-2" icon={<Activity className="text-purple-600" />} color="purple" />
            <KPICard label="En Attente" value={stats.pendingInvoices.toString()} trend="-3" icon={<TrendingUp className="text-amber-600" />} color="amber" isWarning />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-8">
                <BarChart3 className="text-emerald-600" /> Performance Services
              </h3>
              <div className="space-y-6">
                <BarItem label="Consultations" progress={85} color="bg-emerald-500" count={124} />
                <BarItem label="Laboratoire" progress={62} color="bg-blue-500" count={89} />
                <BarItem label="Pharmacie" progress={92} color="bg-amber-500" count={210} />
                <BarItem label="Hospitalisation" progress={34} color="bg-purple-500" count={12} />
              </div>
            </motion.div>

            <motion.div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-8">
                <PieChart className="text-emerald-600" /> Prévalence Maladies
              </h3>
              <div className="space-y-6">
                <BarItem label="Paludisme" progress={45} color="bg-red-500" count={156} />
                <BarItem label="Typhoïde" progress={25} color="bg-orange-500" count={86} />
                <BarItem label="Grippe" progress={20} color="bg-blue-400" count={69} />
                <BarItem label="Diabète" progress={10} color="bg-purple-400" count={34} />
              </div>
            </motion.div>

            <motion.div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden text-white">
              <div className="relative">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-8 border-b border-white/10 pb-6">
                  <PieChart className="text-emerald-400" /> Alertes Opérationnelles
                </h3>
                <div className="space-y-4">
                  <LogItem icon={<AlertTriangle className="text-amber-400" />} title="Base de Données" desc="Moteur Prisma optimisé avec succès." time="En direct" />
                  <LogItem icon={<CheckCircle2 className="text-emerald-400" />} title="Postes Actifs" desc="Tous les terminaux sont en ligne." time="maintenant" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><Shield className="text-emerald-600" /> Ajouter du Personnel</h3>
              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="space-y-1">
                  <Label>Rôle</Label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4">
                    <option value="admin">Administrateur Global</option>
                    <option value="reception">Réception</option><option value="nurse">Infirmier(e)</option><option value="doctor">Docteur</option>
                    <option value="lab">Laboratoire</option><option value="pharmacy">Pharmacie</option><option value="accounting">Comptabilité</option>
                    <option value="cashier">Caissier</option><option value="hospitalization">Hospitalisation</option>
                  </select>
                </div>
                {newRole === 'admin' ? (
                  <>
                    <div className="space-y-1"><Label>E-mail</Label><Input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="admin@grace.com" className="rounded-xl h-12" required /></div>
                    <div className="space-y-1"><Label>Mot de passe</Label><Input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="••••••••" className="rounded-xl h-12" required /></div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1"><Label>Nom d'utilisateur</Label><Input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="dr_smith" className="rounded-xl h-12" required /></div>
                    <div className="space-y-1"><Label>Code PIN (4 chiffres)</Label><Input value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={4} placeholder="1234" className="rounded-xl h-12" required /></div>
                  </>
                )}
                <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-lg">Activer le Compte</Button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between mb-8"><h3 className="text-xl font-bold">Annuaire Clinique</h3><span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black uppercase text-slate-500">{usersList.length} Profils Actifs</span></div>
              <div className="space-y-4">
                {usersList.map((usr) => (
                  <div key={usr.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">{usr.role?.[0]?.toUpperCase()}</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{usr.displayName || usr.username}</h4>
                        <span className="text-[10px] font-black uppercase bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">{usr.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold"><Key size={8} /> PIN: {usr.pin || 'Chiffré'}</div>
                      </div>
                      <button onClick={() => deleteUser(usr.id)} className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-3xl font-black mb-8 flex items-center gap-4"><Settings className="text-emerald-600" /> Profil de l'Hôpital</h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-bold">Nom de l'Établissement</Label>
              <Input value={editingHospitalName} onChange={e => setEditingHospitalName(e.target.value)} className="h-16 rounded-2xl border-2 text-xl font-bold px-6" />
            </div>
            <Button onClick={handleUpdateHospital} className="w-full h-16 bg-emerald-600 rounded-2xl font-black text-lg">Mettre à Jour</Button>
          </div>
        </div>
      )}
    </div>
  );
};

function KPICard({ label, value, trend, icon, color, isWarning = false }: any) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${isWarning ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-4"><div className={`size-12 rounded-2xl flex items-center justify-center bg-emerald-50`}>{icon}</div><span className="text-[10px] font-black uppercase text-emerald-700">{trend}</span></div>
      <div><h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</h4><p className="text-3xl font-black text-slate-800">{value}</p></div>
    </div>
  );
}

function BarItem({ label, progress, color, count }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold"><span className="text-slate-600">{label}</span><span className="text-slate-400">{count} Units</span></div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full ${color}`} /></div>
    </div>
  );
}

function LogItem({ icon, title, desc, time }: any) {
  return (
    <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between"><h5 className="font-bold text-sm">{title}</h5><span className="text-[10px] text-white/30">{time}</span></div>
        <p className="text-xs text-white/50">{desc}</p>
      </div>
    </div>
  );
}
