import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  MapPin,
  Radio,
  Send,
  PhoneCall,
  FileText,
  AlertOctagon,
  ExternalLink,
  ChevronRight,
  Compass,
  Map,
  BookOpen,
  Backpack,
  PhoneForwarded,
  Layers,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { DepartmentData, DistrictData, DisasterType, ProvinceData } from './types/disasters';
import { PERU_DEPARTMENTS } from './data/peruData';
import { LoginCover } from './components/LoginCover';
import { HeaderNav } from './components/HeaderNav';
import { AlarmBanner } from './components/AlarmBanner';
import { LocationSelector } from './components/LocationSelector';
import { PeruMapViewer } from './components/PeruMapViewer';
import { DisasterRiskCard } from './components/DisasterRiskCard';
import { InfographicViewer } from './components/InfographicViewer';
import { ChecklistOk } from './components/ChecklistOk';
import { SosModal } from './components/SosModal';
import { OfficialEntitiesModal } from './components/OfficialEntitiesModal';
import { TermsModal } from './components/TermsModal';
import { alarmManager } from './utils/audioAlarm';

export type AppTab = 'ubicacion' | 'mapa' | 'infografias' | 'mochila' | 'emergencia';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('peru_alerta_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Active Application Tab (eliminates long landing page scrolling)
  const [activeTab, setActiveTab] = useState<AppTab>('ubicacion');

  // Selected Geography (Defaults to Lima - Lima - Cercado de Lima)
  const [selectedDept, setSelectedDept] = useState<DepartmentData>(() => PERU_DEPARTMENTS[0]);
  const [selectedProv, setSelectedProv] = useState<ProvinceData>(() => PERU_DEPARTMENTS[0].provinces[0]);
  const [selectedDist, setSelectedDist] = useState<DistrictData>(() => PERU_DEPARTMENTS[0].provinces[0].districts[0]);

  // Active Disaster
  const [activeDisaster, setActiveDisaster] = useState<DisasterType>(() => 'sismo');

  // Modals state (PromptGuide removed per explicit user instruction)
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isPhonesOpen, setIsPhonesOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // When user logs in
  const handleLoginSuccess = (user: { email: string; name: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('peru_alerta_auth_user', JSON.stringify(user));
    } catch (e) {}
  };

  // Logout
  const handleLogout = () => {
    alarmManager.stopAlarm();
    setCurrentUser(null);
    try {
      localStorage.removeItem('peru_alerta_auth_user');
    } catch (e) {}
  };

  // Change location handler
  const handleLocationChange = (dept: DepartmentData, prov: ProvinceData, dist: DistrictData) => {
    setSelectedDept(dept);
    setSelectedProv(prov);
    setSelectedDist(dist);

    // If active disaster is not relevant to this district, switch to primary
    if (!dist?.predominantDisasters?.includes(activeDisaster)) {
      const newDisaster = dist?.predominantDisasters?.[0] || 'sismo';
      setActiveDisaster(newDisaster);
    }
  };

  // If user is not logged in, render the interactive cover with video & translucent glassmorphism
  if (!currentUser) {
    return <LoginCover onLoginSuccess={handleLoginSuccess} />;
  }

  const tabsConfig = [
    {
      id: 'ubicacion' as AppTab,
      label: 'Ubicación y Riesgos',
      icon: MapPin,
      badge: `${selectedDept.name}`,
    },
    {
      id: 'mapa' as AppTab,
      label: 'Mapa y Evacuación',
      icon: Map,
      badge: 'Cartografía',
    },
    {
      id: 'infografias' as AppTab,
      label: 'Infografías y Protocolos',
      icon: BookOpen,
      badge: 'INDECI',
    },
    {
      id: 'mochila' as AppTab,
      label: 'Mochila de Emergencia',
      icon: Backpack,
      badge: '72 Horas',
    },
    {
      id: 'emergencia' as AppTab,
      label: 'Central SOS y Teléfonos',
      icon: PhoneForwarded,
      badge: '105 / 116 / 106',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-[#D20103] selection:text-white pb-16">
      {/* Top Header Navigation */}
      <HeaderNav
        user={currentUser}
        onLogout={handleLogout}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenPhones={() => setIsPhonesOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* Synchronized Siren Alarm Banner */}
      <AlarmBanner
        locationName={selectedDist.name}
        departmentName={selectedDept.name}
        currentThreat={{
          type: activeDisaster.toUpperCase(),
          intensity: 'ALTA PRIORIDAD',
          message: `Alerta Geodinámica en ${selectedDist.name} (${selectedProv.name}, ${selectedDept.name}) con protocolos activos de Defensa Civil e IGP.`,
        }}
      />

      {/* Main Tabbed Application Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-2 mb-6">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[140px] sm:min-w-0 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none relative ${
                    isActive
                      ? 'bg-[#002B5B] text-white shadow-md font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-1 left-4 right-4 h-0.5 bg-[#D20103] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Active Location Mini-Status Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-500">Jurisdicción Activa:</span>
            <span className="font-bold text-slate-900">
              {selectedDist.name}, {selectedProv.name} ({selectedDept.name})
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline font-mono text-slate-600">
              Altitud: {selectedDist.altitudeMeters ?? 0} m s. n. m.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Amenaza Monitoreada:</span>
            <span className="px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] bg-red-100 text-red-700 border border-red-200 tracking-wide">
              {activeDisaster}
            </span>
          </div>
        </div>

        {/* Tab Content Panels (Tabbed Application Layout) */}
        <div className="transition-all duration-300">
          <AnimatePresence mode="wait">
            {/* TAB 1: Ubicación & Riesgo Geodinámico */}
            {activeTab === 'ubicacion' && (
              <motion.div
                key="tab-ubicacion"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <LocationSelector
                  selectedDept={selectedDept}
                  selectedProv={selectedProv}
                  selectedDist={selectedDist}
                  onSelectLocation={handleLocationChange}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7">
                    <DisasterRiskCard
                      district={selectedDist}
                      activeDisaster={activeDisaster}
                      onSelectDisaster={(disaster) => setActiveDisaster(disaster)}
                    />
                  </div>
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002B5B] flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Acceso Directo a Módulos</h4>
                        <p className="text-[11px] text-slate-500">Navegue por las herramientas especializadas</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('mapa')}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 flex items-center justify-between group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Map className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Ver Mapa Cartográfico y Rutas</p>
                            <p className="text-[10px] text-slate-500">Zonas seguras y capas satelitales</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('infografias')}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 flex items-center justify-between group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Ver Infografía Oficial INDECI</p>
                            <p className="text-[10px] text-slate-500">Protocolos ante {activeDisaster.toUpperCase()}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('mochila')}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 flex items-center justify-between group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Backpack className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Revisar Mochila de Emergencia</p>
                            <p className="text-[10px] text-slate-500">Checklist interactivo de 72 horas</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Mapa y Rutas de Evacuación */}
            {activeTab === 'mapa' && (
              <motion.div
                key="tab-mapa"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <PeruMapViewer
                  district={selectedDist}
                  departmentName={selectedDept.name}
                  provinceName={selectedProv.name}
                />
              </motion.div>
            )}

            {/* TAB 3: Infografías y Protocolos INDECI */}
            {activeTab === 'infografias' && (
              <motion.div
                key="tab-infografias"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <InfographicViewer activeDisaster={activeDisaster} />
              </motion.div>
            )}

            {/* TAB 4: Mochila de Emergencia 72h */}
            {activeTab === 'mochila' && (
              <motion.div
                key="tab-mochila"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <ChecklistOk
                  activeDisaster={activeDisaster}
                  districtName={selectedDist.name}
                />
              </motion.div>
            )}

            {/* TAB 5: Central SOS y Teléfonos de Emergencia */}
            {activeTab === 'emergencia' && (
              <motion.div
                key="tab-emergencia"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Offline SOS Card */}
                <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-[#D20103] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#D20103] mb-4">
                      <Send className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Mensajería de Emergencia SOS Offline
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Envíe un mensaje SMS preformateado con su ubicación GPS exacta y distrito ({selectedDist.name}) a sus dos contactos de confianza, funcionando 100% sin internet ni red de datos móviles.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 mb-4">
                      <p className="text-[11px] font-bold text-red-600 mb-1">PLANTILLA SMS AUTOMÁTICA:</p>
                      "EMERGENCIA PERÚ: Necesito ayuda inmediata en {selectedDist.name} ({selectedProv.name}, {selectedDept.name}). Coordenadas aprox: Lat {selectedDist.lat?.toFixed?.(4) ?? selectedDist.lat}, Lng {selectedDist.lng?.toFixed?.(4) ?? selectedDist.lng}."
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`sms:?body=${encodeURIComponent(`[ALERTA DESASTRE PERÚ] Necesito ayuda inmediata en ${selectedDist.name} (${selectedProv.name}, ${selectedDept.name}). Coordenadas: ${selectedDist.lat?.toFixed?.(4) ?? selectedDist.lat}, ${selectedDist.lng?.toFixed?.(4) ?? selectedDist.lng}`)}`}
                      className="py-3 px-3 bg-[#D20103] hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                    >
                      <Smartphone className="w-4 h-4" />
                      Enviar SMS directo al Celular
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsSosOpen(true)}
                      className="py-3 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Personalizar Destinatarios SOS
                    </button>
                  </div>
                </div>

                {/* Emergency Lines Directory */}
                <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-[#002B5B] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#002B5B] mb-4">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Líneas Telefónicas Gratuitas Nacionales
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Centrales de despacho para rescate, primeros auxilios, evacuación médica y seguridad ciudadana disponibles 24/7 en todo el Perú.
                    </p>

                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      <a
                        href="tel:105"
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-center block transition-all"
                      >
                        <span className="text-xl font-black text-[#002B5B] block">105</span>
                        <span className="text-[10px] text-slate-600 font-semibold block">Policía</span>
                      </a>
                      <a
                        href="tel:116"
                        className="p-3 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 text-center block transition-all"
                      >
                        <span className="text-xl font-black text-[#D20103] block">116</span>
                        <span className="text-[10px] text-slate-600 font-semibold block">Bomberos</span>
                      </a>
                      <a
                        href="tel:106"
                        className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-center block transition-all"
                      >
                        <span className="text-xl font-black text-emerald-600 block">106</span>
                        <span className="text-[10px] text-slate-600 font-semibold block">SAMU</span>
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhonesOpen(true)}
                    className="w-full py-3 bg-[#002B5B] hover:bg-blue-900 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-300" />
                    Ver Directorio Completo de Organismos
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer with Subtle, Professional, and Harmonious Authorship */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 mt-12 border-t border-slate-200/90 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800">
            Alerta de Desastres Naturales del Perú &copy; 2026
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#2B6CB0] font-semibold">
              Autoría, Desarrollo y Dirección Técnica:
            </span>
            <span
              style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
              className="text-xs sm:text-sm font-bold tracking-wider text-[#1C4E80] bg-[#F0F7FF] border border-[#4682B4]/40 px-3 py-0.5 rounded-full shadow-2xs"
            >
              Ing. Rocío Paredes Gamarra • Casa Serpentis
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="text-slate-600 hover:text-[#002B5B] transition-colors underline cursor-pointer font-medium"
          >
            Términos, Condiciones y Medalla
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => setIsPhonesOpen(true)}
            className="text-slate-600 hover:text-[#002B5B] transition-colors underline cursor-pointer font-medium"
          >
            Organismos Científicos
          </button>
        </div>
      </footer>

      {/* Interactive Modals */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        district={selectedDist}
        provinceName={selectedProv.name}
        departmentName={selectedDept.name}
      />

      <OfficialEntitiesModal
        isOpen={isPhonesOpen}
        onClose={() => setIsPhonesOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
