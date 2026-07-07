import React from 'react';
import { useAuth, UserRole } from '../store/AuthContext';
import {
  Users,
  Calendar,
  Settings,
  LogOut,
  Search,
  Plus,
  Activity,
  Clock,
  ChevronRight,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  Pill,
  Wallet,
  Scan,
  LayoutDashboard,
  Hospital,
  Calculator,
  History,
  Scissors
} from 'lucide-react';
import { Button } from './ui/button';

interface ClinicLayoutProps {
  children: React.ReactNode;
}

export const ClinicLayout: React.FC<ClinicLayoutProps> = ({ children }) => {
  const { role, activeWorkstation, user, logout, setWorkstation } = useAuth();

  const menuItems: { role: UserRole | 'all' | 'records'; icon: React.ReactNode; label: string; id: UserRole }[] = [
    { role: 'admin', icon: <LayoutDashboard size={20} />, label: 'Statistiques', id: 'admin' },
    { role: 'records', icon: <History size={20} />, label: 'Archives Globales', id: 'records' },
    { role: 'reception', icon: <Plus size={20} />, label: 'Réception', id: 'reception' },
    { role: 'nurse', icon: <Activity size={20} />, label: 'Signes Vitaux', id: 'nurse' },
    { role: 'doctor', icon: <Stethoscope size={20} />, label: 'Consultation', id: 'doctor' },
    { role: 'lab', icon: <FlaskConical size={20} />, label: 'Laboratoire', id: 'lab' },
    { role: 'radiology', icon: <Scan size={20} />, label: 'Radiologie', id: 'radiology' },
    { role: 'surgery', icon: <Scissors size={20} />, label: 'Bloc Chirurgical', id: 'surgery' },
    { role: 'pharmacy', icon: <Pill size={20} />, label: 'Pharmacie', id: 'pharmacy' },
    { role: 'accounting', icon: <Calculator size={20} />, label: 'Comptabilité', id: 'accounting' },
    { role: 'cashier', icon: <Wallet size={20} />, label: 'Caisse', id: 'cashier' },
    { role: 'hospitalization', icon: <Hospital size={20} />, label: 'Hospitalisation', id: 'hospitalization' },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (item.id === 'records') return role === 'admin' || role === 'doctor' || role === 'reception';
    return item.role === 'all' || item.role === role || role === 'admin';
  });

  const workstationLabels: Record<string, string> = {
    reception: 'Réception',
    nurse: 'Infirmerie',
    doctor: 'Consultation',
    lab: 'Laboratoire',
    radiology: 'Radiologie',
    surgery: 'Bloc Chirurgical',
    pharmacy: 'Pharmacie',
    accounting: 'Comptabilité',
    cashier: 'Caisse',
    hospitalization: 'Hospitalisation',
    admin: 'Administration',
    records: 'Archives'
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <Stethoscope size={24} />
          </div>
          <span className="font-bold text-xl text-emerald-900 tracking-tight">ClinicFlow</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeWorkstation === item.id} 
              onClick={() => (role === 'admin' || (role === 'doctor' && item.id === 'records')) ? setWorkstation(item.id) : null}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user?.displayName || 'Utilisateur'}</p>
              <p className="text-[10px] text-slate-500 uppercase">{role}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg text-slate-800 uppercase italic tracking-tighter">
              {workstationLabels[activeWorkstation || ''] || 'Session Active'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Recherche rapide..." 
                 className="bg-slate-100 border-none rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all w-64"
               />
            </div>
            <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-emerald-50 ring-offset-2">
              <Clock size={16} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-semibold text-sm w-full text-left ${
        active 
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
