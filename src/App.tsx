import React, { useState, useEffect } from 'react';
import LoginPage from './components/ui/animated-characters-login-page';
import { useAuth } from './store/AuthContext';
import { ClinicLayout } from './components/ClinicLayout';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ReceptionDashboard } from './components/dashboards/ReceptionDashboard';
import { NurseDashboard } from './components/dashboards/NurseDashboard';
import { DoctorDashboard } from './components/dashboards/DoctorDashboard';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'motion/react';
import {
  LabDashboard,
  RadiologyDashboard,
  PharmacyDashboard,
  CashierDashboard,
  HospitalDashboard,
  AccountingDashboard,
  SurgeryDashboard
} from './components/dashboards/SecondaryDashboards';
import { PatientHistory } from './components/PatientHistory';

export default function App() {
  const { user, activeWorkstation, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || showSplash) {
    return (
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (activeWorkstation) {
      case 'admin': return <AdminDashboard />;
      case 'reception': return <ReceptionDashboard />;
      case 'nurse': return <NurseDashboard />;
      case 'doctor': return <DoctorDashboard />;
      case 'lab': return <LabDashboard />;
      case 'radiology': return <RadiologyDashboard />;
      case 'surgery': return <SurgeryDashboard />;
      case 'pharmacy': return <PharmacyDashboard />;
      case 'cashier': return <CashierDashboard />;
      case 'hospitalization': return <HospitalDashboard />;
      case 'accounting': return <AccountingDashboard />;
      case 'records': return <PatientHistory />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <h3 className="text-2xl font-bold">Awaiting Authorization</h3>
          <p>Please contact the system administrator to assign your clinical role.</p>
        </div>
      );
    }
  };

  return (
    <ClinicLayout>
      {renderDashboard()}
    </ClinicLayout>
  );
}

