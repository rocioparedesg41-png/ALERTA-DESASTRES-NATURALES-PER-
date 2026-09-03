import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, ZoomIn, X, Download, Shield, ExternalLink } from 'lucide-react';
import { DisasterType } from '../types/disasters';
import { DISASTER_PROTOCOLS } from '../data/peruData';

interface InfographicViewerProps {
  activeDisaster: DisasterType;
}

export const InfographicViewer: React.FC<InfographicViewerProps> = ({ activeDisaster }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const protocol = DISASTER_PROTOCOLS[activeDisaster] || DISASTER_PROTOCOLS.sismo;

  return (
    <div className="w-full bg-white border border-slate-200 border-t-4 border-t-[#D20103] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-[#D20103]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Infografía Oficial de Evacuación Sincronizada
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {protocol.infographicFile.replace('/', '')}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Guía gráfica oficial de Defensa Civil / INDECI para {protocol.title}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          <ZoomIn className="w-3.5 h-3.5 text-[#002B5B]" />
          Ver en Pantalla Completa
        </button>
      </div>

      {/* Main Infographic Image Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group">
        <img
          src={protocol.infographicFile}
          alt={`Infografía oficial de ${protocol.title}`}
          referrerPolicy="no-referrer"
          className="w-full max-h-[520px] object-contain transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
          onClick={() => setIsZoomed(true)}
        />

        {/* Hover overlay hint */}
        <div
          onClick={() => setIsZoomed(true)}
          className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <span className="px-4 py-2 rounded-lg bg-white/95 text-slate-900 text-xs font-bold border border-slate-200 shadow-xl flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-[#002B5B]" />
            Haga clic para ampliar al 100%
          </span>
        </div>

        {/* Floating badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#D20103]" />
          Protocolo Oficial Sincronizado
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-auto"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-5xl w-full max-h-[92vh] bg-white rounded-2xl border border-slate-200 p-2 sm:p-4 overflow-hidden flex flex-col items-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#D20103]" />
                  {protocol.title} - Protocolo Oficial de Protección
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={protocol.infographicFile}
                    download={protocol.infographicFile.replace('/', '')}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                    title="Descargar infografía"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsZoomed(false)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-[#D20103] border border-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-auto max-h-[80vh] w-full flex items-center justify-center p-2 bg-slate-50 rounded-xl mt-2">
                <img
                  src={protocol.infographicFile}
                  alt={protocol.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[76vh] w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
