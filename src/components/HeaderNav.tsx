import React from 'react';
import { ShieldAlert, PhoneCall, FileText, LogOut, Radio, Send } from 'lucide-react';

interface HeaderNavProps {
  user: { email: string; name: string };
  onLogout: () => void;
  onOpenSos: () => void;
  onOpenPhones: () => void;
  onOpenTerms: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  user,
  onLogout,
  onOpenSos,
  onOpenPhones,
  onOpenTerms,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#002B5B] text-white border-b-4 border-[#D20103] shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <div className="w-8 h-8 bg-[#D20103] rounded flex items-center justify-center font-black text-white text-[9px] sm:text-[10px] text-center leading-tight tracking-tighter">
              ALERTA
              <br />
              PERÚ
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white leading-none">
                SISTEMA NACIONAL DE ALERTA TEMPRANA
              </h1>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D20103] text-white uppercase tracking-wider">
                SAT Oficial
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/70 hidden sm:block mt-0.5">
              24 Dptos, Callao, 196 Provincias y 1893 Distritos del Perú
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick SOS Offline Pill Button (Pulsing Red) */}
          <button
            type="button"
            onClick={onOpenSos}
            className="bg-[#D20103] hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
            <span className="hidden sm:inline">ENVIAR SOS (OFFLINE)</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Emergency Phones Button */}
          <button
            type="button"
            onClick={onOpenPhones}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Líneas de Emergencia 105 / 116 / 106"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xl:inline">105 / 116 / 106</span>
          </button>

          {/* Terms & Conditions */}
          <button
            type="button"
            onClick={onOpenTerms}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
            title="Términos y Condiciones / Autora"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* User Profile Badge & Logout */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-2.5 sm:pl-3">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-white/70 leading-none">Usuario</p>
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {user.name || 'Ing. Rocío Paredes'}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-red-600/80 text-white border border-white/20 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
