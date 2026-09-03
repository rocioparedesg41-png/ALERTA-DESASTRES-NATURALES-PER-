import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellOff, AlertOctagon, Volume2, ShieldAlert, Radio, VolumeX } from 'lucide-react';
import { alarmManager } from '../utils/audioAlarm';

interface AlarmBannerProps {
  currentThreat?: {
    type: string;
    intensity: string;
    message: string;
  };
  locationName: string;
  departmentName: string;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({
  currentThreat,
  locationName,
  departmentName,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const unsub = alarmManager.subscribe((playing) => {
      setIsPlaying(playing);
      if (!playing) {
        setElapsedSeconds(0);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handleDeactivate = () => {
    alarmManager.stopAlarm();
  };

  const handleTriggerManualAlarm = async () => {
    await alarmManager.startAlarm();
  };

  return (
    <>
      {/* Persistent Audio Siren Alarm Notification when active */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="sticky top-0 z-50 w-full bg-[#D20103] text-white shadow-2xl border-b-4 border-amber-400 px-4 py-3 sm:py-4"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-ping absolute inset-0" />
                  <div className="w-12 h-12 rounded-full bg-white text-[#D20103] flex items-center justify-center font-black relative z-10 shadow-lg">
                    <AlertOctagon className="w-7 h-7 animate-bounce" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider animate-pulse">
                      ¡ALARMA DE EMERGENCIA ACTIVA!
                    </span>
                    <span className="text-xs font-mono bg-black/30 text-white px-2 py-0.5 rounded font-bold">
                      {elapsedSeconds}s transcurridos
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 mt-0.5">
                    <span>Sincronizado con SASPE / IGP / INDECI:</span>
                    <span className="underline decoration-amber-400 font-extrabold">
                      {locationName} ({departmentName})
                    </span>
                  </h2>
                  <p className="text-xs text-red-100 line-clamp-1">
                    {currentThreat?.message ||
                      '¡Alerta Sísmica Temprana! Desplácese de inmediato a zonas seguras internas.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-xl border border-white/40 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-sm"
                >
                  <BellOff className="w-5 h-5 text-amber-400 animate-pulse" />
                  DESACTIVAR ALARMA
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating or Inline Alarm Activator Bar for drills/preparation */}
      {!isPlaying && (
        <div className="w-full bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse flex-shrink-0" />
            <span className="font-bold text-[#002B5B]">Canal Sísmico Oficial SASPE:</span>
            <span className="text-slate-500 hidden sm:inline">
              Monitoreo continuo de acelerógrafos y sismógrafos del IGP / INDECI en todo el territorio nacional.
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleTriggerManualAlarm}
              className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#D20103] border border-red-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 text-xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#D20103]" />
              Probar Alarma Sísmica SASPE (Sonido)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
