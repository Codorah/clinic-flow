import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
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
  Sparkles,
  Package,
  Check,
  Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export const AdminDashboard: React.FC = () => {
  const { apiFetch, updateHospitalName } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'users' | 'settings'>('analytics');
  const [stats, setStats] = useState<any>({
    totalPatients: 0,
    totalRevenue: 0,
    activeTreatments: 0,
    pendingInvoices: 0,
    dailyStats: []
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHospitalName, setEditingHospitalName] = useState('');

  // User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState('reception');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // In-line editing states for catalog items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMinStock, setEditMinStock] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, hospitalRes, catalogRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/users'),
        apiFetch('/api/hospital'),
        apiFetch('/api/catalog'),
      ]);
      setStats(await statsRes.json());
      setUsersList(await usersRes.json());
      const hospitalData = await hospitalRes.json();
      setEditingHospitalName(hospitalData.name);
      setCatalogItems(await catalogRes.json());
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
      await updateHospitalName(editingHospitalName);
      alert("Établissement mis à jour !");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          username: newUsername || undefined,
          email: newEmail || undefined,
          password: newPassword || undefined,
          pin: newPin || undefined,
          role: newRole,
          displayName: newUsername
            ? newUsername.charAt(0).toUpperCase() + newUsername.slice(1)
            : newEmail ? newEmail.split('@')[0] : 'Staff'
        })
      });
      setNewUsername(''); setNewPin(''); setNewEmail(''); setNewPassword('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (id: string, email?: string) => {
    if (email === 'ceo.codorah@gmail.com') return alert("Impossible de supprimer le compte principal !");
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStock = async (id: string) => {
    try {
      await apiFetch(`/api/catalog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: editPrice ? parseFloat(editPrice) : undefined,
          stock: editStock ? parseInt(editStock) : undefined,
          minStock: editMinStock ? parseInt(editMinStock) : undefined
        })
      });
      setEditingItemId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditItem = (item: any) => {
    setEditingItemId(item.id);
    setEditPrice(item.price.toString());
    setEditStock(item.stock.toString());
    setEditMinStock(item.minStock.toString());
  };

  if (loading) return <div className="p-12 text-center text-slate-400 italic">Chargement des données administratives...</div>;

  // Compute stats or warnings
  const lowStockItems = catalogItems.filter(item => item.stock <= item.minStock);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Analyses Diagnostiques</h1>
          <p className="text-slate-500 font-medium">Matrice de Performance Clinique & Stocks</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto max-w-full">
          {[
            { id: 'analytics', label: 'Analyses' },
            { id: 'inventory', label: 'Stocks & Prix' },
            { id: 'users', label: 'Personnel' },
            { id: 'settings', label: 'Paramètres' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap capitalize ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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

          {/* Real-time SVG Curves Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="text-emerald-500" /> Courbe des Revenus Hebdomadaires</h3>
              <SVGLineChart data={stats.dailyStats} dataKey="revenue" color="#10b981" label="Revenus en FCFA" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-blue-500" /> Fréquentation des Patients (7 jours)</h3>
              <SVGLineChart data={stats.dailyStats} dataKey="patients" color="#3b82f6" label="Nombre de Patients" />
            </div>
          </div>

          {/* Lower Section (Performance, Prevalence & Workstation Checklists) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-8"><BarChart3 className="text-emerald-600" /> Performance Services</h3>
              <div className="space-y-6">
                <BarItem label="Consultations" progress={85} color="bg-emerald-500" count={124} />
                <BarItem label="Laboratoire" progress={62} color="bg-blue-500" count={89} />
                <BarItem label="Pharmacie" progress={92} color="bg-amber-500" count={210} />
                <BarItem label="Hospitalisation" progress={34} color="bg-purple-500" count={12} />
              </div>
            </motion.div>

            {/* Checklist of added items and workstations */}
            <motion.div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><CheckCircle2 className="text-emerald-600" /> Intégration des Postes</h3>
              <div className="space-y-4">
                <WorkstationCheckItem label="Réception (Fichiers, Archives)" checked />
                <WorkstationCheckItem label="Soins Infirmiers (Vitrages, Vitaux)" checked />
                <WorkstationCheckItem label="Consultation Docteur (Diagnostique)" checked />
                <WorkstationCheckItem label="Laboratoire & Analyses" checked />
                <WorkstationCheckItem label="Imagerie & Radiologie" checked />
                <WorkstationCheckItem label="Bloc Chirurgical (Opérations)" checked />
                <WorkstationCheckItem label="Pharmacie & Catalogue Médical" checked />
                <WorkstationCheckItem label="Facturation & Caisse" checked />
                <WorkstationCheckItem label="Comptabilité Clinique" checked />
              </div>
            </motion.div>

            <motion.div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden text-white">
              <div className="relative">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-8 border-b border-white/10 pb-6"><PieChart className="text-emerald-400" /> Alertes Opérationnelles</h3>
                <div className="space-y-4">
                  {lowStockItems.length > 0 && (
                    <LogItem 
                      icon={<AlertTriangle className="text-red-400 animate-pulse" />} 
                      title="Rupture / Alerte Stock" 
                      desc={`${lowStockItems.length} article(s) sous le seuil minimum !`} 
                      time="ALERTE" 
                    />
                  )}
                  <LogItem icon={<AlertTriangle className="text-amber-400" />} title="Base de Données" desc="Moteur Prisma optimisé avec succès." time="En direct" />
                  <LogItem icon={<CheckCircle2 className="text-emerald-400" />} title="Postes Actifs" desc="Tous les terminaux sont en ligne." time="maintenant" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : activeTab === 'inventory' ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Package className="text-emerald-600" /> Gestion des Stocks & Tarifs
              </h3>
              <p className="text-sm text-slate-400 font-medium">Consulter et modifier les quantités de médicaments, analyses et services de la clinique.</p>
            </div>
            {lowStockItems.length > 0 && (
              <span className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-xs animate-bounce">
                ⚠️ {lowStockItems.length} Articles en alerte stock
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-black tracking-wider">
                  <th className="py-4">Nom de l'Article</th>
                  <th className="py-4">Catégorie</th>
                  <th className="py-4">Prix (FCFA)</th>
                  <th className="py-4">Stock Actuel</th>
                  <th className="py-4">Seuil Minimum</th>
                  <th className="py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {catalogItems.map(item => {
                  const isEditing = editingItemId === item.id;
                  const isLowStock = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isLowStock ? 'bg-red-50/10' : ''}`}>
                      <td className="py-4 font-bold text-slate-800">
                        {item.name}
                        {isLowStock && (
                          <span className="ml-2 text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-black uppercase">
                            Faible
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs font-bold uppercase text-slate-400">{item.category || 'Général'}</td>
                      <td className="py-4 font-black">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={editPrice} 
                            onChange={e => setEditPrice(e.target.value)} 
                            className="w-24 h-9 text-sm"
                          />
                        ) : (
                          `${item.price.toLocaleString()} FCFA`
                        )}
                      </td>
                      <td className="py-4 font-medium">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={editStock} 
                            onChange={e => setEditStock(e.target.value)} 
                            className="w-20 h-9 text-sm"
                          />
                        ) : (
                          item.stock
                        )}
                      </td>
                      <td className="py-4 text-slate-500">
                        {isEditing ? (
                          <Input 
                            type="number" 
                            value={editMinStock} 
                            onChange={e => setEditMinStock(e.target.value)} 
                            className="w-20 h-9 text-sm"
                          />
                        ) : (
                          item.minStock
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <Button 
                              onClick={() => handleUpdateStock(item.id)} 
                              className="size-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center p-0"
                            >
                              <Check size={16} />
                            </Button>
                            <Button 
                              onClick={() => setEditingItemId(null)} 
                              variant="outline" 
                              className="size-9 rounded-lg flex items-center justify-center p-0"
                            >
                              X
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => startEditItem(item)} 
                            variant="outline" 
                            className="h-9 px-3 rounded-lg text-xs font-bold"
                          >
                            Modifier
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
                    <option value="reception">Réception</option>
                    <option value="nurse">Infirmier(e)</option>
                    <option value="doctor">Docteur</option>
                    <option value="lab">Laboratoire</option>
                    <option value="radiology">Radiologie</option>
                    <option value="surgery">Bloc Chirurgical</option>
                    <option value="pharmacy">Pharmacie</option>
                    <option value="accounting">Comptabilité</option>
                    <option value="cashier">Caissier</option>
                    <option value="hospitalization">Hospitalisation</option>
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
                      <button onClick={() => deleteUser(usr.id, usr.email)} className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
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

function WorkstationCheckItem({ label, checked }: { label: string, checked?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className={`size-5 rounded-full flex items-center justify-center ${checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
        <Check size={12} />
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );
}

function SVGLineChart({ data, dataKey, color, label }: { data: any[], dataKey: string, color: string, label: string }) {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-slate-400">Aucune donnée historique</div>;

  const width = 500;
  const height = 150;
  const padding = 25;

  const maxVal = Math.max(...data.map(d => d[dataKey]), 1);

  // Generate points
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d[dataKey] / maxVal) * (height - padding * 2);
    return { x, y, val: d[dataKey], label: d.day };
  });

  // Generate SVG path string (curved line using cubic bezier)
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  // Path for the closed area under the curve
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
    : '';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</h4>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
          Max: {dataKey === 'revenue' ? `${maxVal.toLocaleString()} FCFA` : `${maxVal} Patients`}
        </span>
      </div>
      <div className="relative bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line
                key={index}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Under Curve */}
          {areaD && <path d={areaD} fill={`url(#gradient-${dataKey})`} />}

          {/* The Curve Line */}
          {pathD && (
            <motion.path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group/point">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ffffff"
                stroke={color}
                strokeWidth="2.5"
                className="transition-all duration-200 cursor-pointer hover:r-6"
              />
              {/* Tooltip on hover */}
              <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200">
                <rect
                  x={p.x - 30}
                  y={p.y - 30}
                  width="60"
                  height="20"
                  rx="5"
                  fill="#1e293b"
                />
                <text
                  x={p.x}
                  y={p.y - 17}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {dataKey === 'revenue' ? `${p.val / 1000}k` : p.val}
                </text>
              </g>
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 2}
              fill="#94a3b8"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
