import React from 'react';
import { motion } from 'motion/react';
import { AlertOctagon, ShieldAlert, Waves, Mountain, CloudRain, Snowflake, SunMedium, Flame } from 'lucide-react';
import { DisasterType, DistrictData } from '../types/disasters';
import { DISASTER_PROTOCOLS } from '../data/peruData';

interface DisasterRiskCardProps {
  district: DistrictData;
  activeDisaster: DisasterType;
  onSelectDisaster: (type: DisasterType) => void;
}

export const DisasterRiskCard: React.FC<DisasterRiskCardProps> = ({
  district,
  activeDisaster,
  onSelectDisaster,
}) => {
  const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case 'sismo':
        return <ActivityIcon className="w-4 h-4" />;
      case 'tsunami':
        return <Waves className="w-4 h-4" />;
      case 'huayco':
        return <Mountain className="w-4 h-4" />;
      case 'inundacion':
        return <CloudRain className="w-4 h-4" />;
      case 'helada_friaje':
        return <Snowflake className="w-4 h-4" />;
      case 'sequia':
        return <SunMedium className="w-4 h-4" />;
      case 'erupcion_volcanica':
        return <Flame className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  const currentProtocol = DISASTER_PROTOCOLS[activeDisaster] || DISASTER_PROTOCOLS.sismo;

  return (
    <div className="w-full bg-white border border-slate-200 border-t-4 border-t-[#002B5B] rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#002B5B]">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Identificación de Desastres según Territorio
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-50 text-[#D20103] border border-red-200 uppercase">
                Peligro Geodinámico
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluación multirriesgo calculada para el distrito de{' '}
              <strong className="text-slate-800 font-bold">{district.name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Disasters tabs for this district */}
      <div className="mb-5">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Desastres Prioritarios Identificados en esta Zona:
        </div>
        <div className="flex flex-wrap gap-2">
          {district.predominantDisasters.map((dtype) => {
            const proto = DISASTER_PROTOCOLS[dtype];
            const isSelected = activeDisaster === dtype;
            return (
              <motion.button
                key={dtype}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDisaster(dtype)}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#002B5B] text-white shadow-sm border border-[#002B5B]'
                    : 'bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getDisasterIcon(dtype)}
                <span>{proto.title}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Current Protocol details */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#D20103]">
              Protocolo Activo
            </span>
            <h4 className="text-lg font-black text-slate-900">{currentProtocol.title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-[#D20103] border border-red-200">
              Nivel de Riesgo: {currentProtocol.riskLevel}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Aviso SAT: {currentProtocol.warningTime}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {currentProtocol.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Causa Geofísica Principal:
            </span>
            <span className="text-xs text-slate-800 font-medium">{currentProtocol.primaryCause}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Microclima Distrital Asociado:
            </span>
            <span className="text-xs text-amber-700 font-bold">{district.climateType}</span>
          </div>
        </div>

        {/* Recommended Actions Bullet points */}
        <div className="pt-1">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
            Acciones Clave Recomendadas por INDECI:
          </span>
          <ul className="space-y-1.5">
            {currentProtocol.recommendedActions.map((act, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D20103] mt-1.5 flex-shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Activity Icon helper
function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
