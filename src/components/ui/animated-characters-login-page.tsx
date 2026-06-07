"use client";

import React, { useState } from "react";
import {
  Heart,
  Stethoscope,
  FlaskConical,
  Pill,
  Calculator,
  Wallet,
  Hospital,
  Scan,
  ChevronLeft,
  ArrowRight,
  Shield,
  Key,
  Users,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  Activity,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { useAuth, UserRole } from "@/src/store/AuthContext";

const workstations: { id: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "reception",       label: "Réception",      icon: <Users size={24} />,       color: "bg-blue-500"    },
  { id: "doctor",          label: "Consultation",   icon: <Stethoscope size={24} />, color: "bg-emerald-500" },
  { id: "nurse",           label: "Infirmerie",     icon: <Heart size={24} />,       color: "bg-rose-500"    },
  { id: "lab",             label: "Laboratoire",    icon: <FlaskConical size={24} />,color: "bg-amber-500"   },
  { id: "radiology",       label: "Radiologie",     icon: <Scan size={24} />,        color: "bg-violet-500"  },
  { id: "pharmacy",        label: "Pharmacie",      icon: <Pill size={24} />,        color: "bg-purple-500"  },
  { id: "accounting",      label: "Comptabilité",   icon: <Calculator size={24} />,  color: "bg-slate-700"   },
  { id: "cashier",         label: "Caisse",         icon: <Wallet size={24} />,      color: "bg-cyan-500"    },
  { id: "hospitalization", label: "Hospitalisation",icon: <Hospital size={24} />,    color: "bg-indigo-500"  },
];

export default function LoginPage() {
  const { loginWithPin, loginWithEmail, hospitalName } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) setPin(prev => prev + digit);
  };

  const handleBackspace = () => setPin(prev => prev.slice(0, -1));

  const handleLogin = async () => {
    if (!selectedRole || pin.length < 4) return;
    setIsLoading(true);
    setError("");
    try {
      await loginWithPin(selectedRole, pin);
    } catch (e: any) {
      setError("Échec de l'autorisation : Code PIN invalide");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
    } catch (e: any) {
      setError("Échec de l'authentification : Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 overflow-hidden font-sans">
      {/* Left Branding Panel */}
      <div className="relative w-full lg:w-1/2 bg-emerald-900 p-12 flex flex-col justify-between text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{ 
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, Math.random() * 50 - 25, 0],
                rotate: [0, 360]
              }}
              transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Activity size={120 + i * 40} className="text-white" strokeWidth={0.5} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-emerald-700 shadow-2xl">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white">Clinical Flow</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Suite Médicale Intégrée</p>
            </div>
          </div>
 
          <div className="space-y-6">
            <h1 className="text-7xl font-black leading-none tracking-tighter">
              Poste de <br />
              <span className="text-emerald-400 font-medium">Travail</span>
            </h1>
            <div className="w-24 h-2 bg-emerald-500 rounded-full" />
            
            <div className="mt-8 flex items-center gap-4 text-emerald-100 font-bold uppercase tracking-widest text-xs">
              <span className="px-3 py-1 bg-white/10 rounded-lg">{formatTime(currentTime)}</span>
              <span className="px-3 py-1 bg-white/10 rounded-lg">{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl inline-block min-w-[320px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Hospital className="text-emerald-400" size={18} />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300">Établissement Officiel</span>
            </div>
            <h3 className="text-3xl font-black mb-1">{hospitalName}</h3>
            <p className="text-emerald-100/40 text-sm font-medium">Surveillance clinique active réservée au personnel autorisé.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Workstation Panel */}
      <div className="w-full lg:w-1/2 p-8 lg:p-24 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!selectedRole && !isAdminMode ? (
              <motion.div 
                key="tiles"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-16"
              >
                <div className="text-center lg:text-left">
                  <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">Portail d'Accès</h2>
                  <div className="flex items-center gap-2 text-slate-400 font-bold italic uppercase tracking-widest text-xs">
                    <Shield size={14} className="text-emerald-500" />
                    SÉLECTION SÉCURISÉE DU POSTE CLINIQUE
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {workstations.map((ws) => (
                    <motion.button
                      key={ws.id}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedRole(ws.id);
                        setPin("");
                        setError("");
                      }}
                      className="group relative flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 transition-all aspect-square"
                    >
                      <div className={`size-12 rounded-2xl ${ws.color} text-white flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                        {ws.icon}
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-tighter text-slate-500 group-hover:text-emerald-700">{ws.label}</span>
                    </motion.button>
                  ))}
                  
                  <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => setIsAdminMode(true)}
                    className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-900 text-white hover:bg-slate-800 transition-all aspect-square outline-none"
                  >
                    <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                      <LayoutDashboard size={20} className="text-emerald-400" />
                    </div>
                    <span className="font-black text-[9px] uppercase tracking-[0.2em] text-white/50">Admin</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : isAdminMode ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <button 
                  onClick={() => { setIsAdminMode(false); setError(""); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-black uppercase text-[10px] tracking-widest mb-8 outline-none"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                  Retour au Portail
                </button>

                <div className="text-center lg:text-left">
                  <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">Console d'Administration</h3>
                  <p className="text-slate-400 font-medium italic">Gestion et configuration de l'établissement à haut niveau.</p>
                </div>

                <form onSubmit={handleAdminAuth} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Identifiant de Connexion</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@graceclinic.com"
                        className="w-full h-16 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-14 font-bold text-slate-800 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mot de Passe Sécurisé</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-16 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white px-14 font-bold text-slate-800 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 font-bold text-xs px-6 py-3 bg-red-50 rounded-2xl">{error}</p>}

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-2xl transition-all group"
                  >
                    {isLoading ? "Vérification de Session..." : "Établir la Connexion"}
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <button 
                  onClick={() => { setSelectedRole(null); setPin(""); setError(""); }}
                  className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-black uppercase text-[10px] tracking-widest mb-8 outline-none"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                  Retour aux Postes
                </button>

                <div className="text-center">
                  <div className={`size-24 rounded-[2rem] ${workstations.find(w => w.id === selectedRole)?.color} text-white flex items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-slate-50`}>
                    {workstations.find(w => w.id === selectedRole)?.icon}
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">Authentification</h3>
                  <p className="text-slate-400 font-medium italic">Accès au poste : <span className="text-slate-800 font-bold">{workstations.find(w => w.id === selectedRole)?.label}</span></p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex gap-3 mb-8">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`size-12 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                          pin.length > i ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                      >
                        {pin[i] ? '•' : ''}
                      </div>
                    ))}
                  </div>

                  {error && <p className="text-red-500 font-bold text-xs mb-6 px-4 py-2 bg-red-50 rounded-full">{error}</p>}

                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePinInput(num.toString())}
                        className={`size-14 rounded-full font-black text-xl flex items-center justify-center bg-slate-50 text-slate-900 hover:bg-emerald-500 hover:text-white shadow-sm active:scale-90 transition-all outline-none ${num === 0 ? 'col-start-2' : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={handleBackspace}
                      className="size-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all active:scale-95 outline-none"
                    >
                      <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleLogin}
                  disabled={isLoading || pin.length < 4}
                  className="w-full h-16 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-2xl shadow-emerald-200 transition-all group"
                >
                  {isLoading ? "Autorisation en cours..." : "Autoriser le Poste"}
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
