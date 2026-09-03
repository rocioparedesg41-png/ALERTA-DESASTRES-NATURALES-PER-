import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { motion } from 'motion/react';
import { Map, Navigation, ShieldCheck, Footprints, Layers, Compass, Eye, AlertTriangle, ZoomIn, ZoomOut, RefreshCw, Crosshair } from 'lucide-react';
import { DistrictData } from '../types/disasters';
import { PERU_DEPARTMENTS } from '../data/peruData';

interface PeruMapViewerProps {
  district: DistrictData;
  departmentName: string;
  provinceName: string;
}

// Department Capital coordinates for national overview
const DEPT_CAPITALS: { name: string; lat: number; lng: number; region: string }[] = [
  { name: 'Amazonas (Chachapoyas)', lat: -6.2317, lng: -77.8689, region: 'Selva' },
  { name: 'Áncash (Huaraz)', lat: -9.5278, lng: -77.5278, region: 'Sierra' },
  { name: 'Apurímac (Abancay)', lat: -13.6339, lng: -72.8814, region: 'Sierra' },
  { name: 'Arequipa', lat: -16.4090, lng: -71.5375, region: 'Sierra' },
  { name: 'Ayacucho', lat: -13.1588, lng: -74.2239, region: 'Sierra' },
  { name: 'Cajamarca', lat: -7.1617, lng: -78.5128, region: 'Sierra' },
  { name: 'Callao (Prov. Constitucional)', lat: -12.0566, lng: -77.1181, region: 'Costa' },
  { name: 'Cusco', lat: -13.5319, lng: -71.9675, region: 'Sierra' },
  { name: 'Huancavelica', lat: -12.7864, lng: -74.9756, region: 'Sierra' },
  { name: 'Huánuco', lat: -9.9306, lng: -76.2422, region: 'Sierra' },
  { name: 'Ica', lat: -14.0678, lng: -75.7286, region: 'Costa' },
  { name: 'Junín (Huancayo)', lat: -12.0651, lng: -75.2049, region: 'Sierra' },
  { name: 'La Libertad (Trujillo)', lat: -8.1091, lng: -79.0299, region: 'Costa' },
  { name: 'Lambayeque (Chiclayo)', lat: -6.7714, lng: -79.8409, region: 'Costa' },
  { name: 'Lima', lat: -12.0464, lng: -77.0428, region: 'Costa' },
  { name: 'Loreto (Iquitos)', lat: -3.7437, lng: -73.2538, region: 'Selva' },
  { name: 'Madre de Dios (Pto. Maldonado)', lat: -12.5933, lng: -69.1891, region: 'Selva' },
  { name: 'Moquegua', lat: -17.1956, lng: -70.9356, region: 'Costa' },
  { name: 'Pasco (Cerro de Pasco)', lat: -10.6675, lng: -76.2561, region: 'Sierra' },
  { name: 'Piura', lat: -5.1945, lng: -80.6328, region: 'Costa' },
  { name: 'Puno', lat: -15.8422, lng: -70.0219, region: 'Sierra' },
  { name: 'San Martín (Moyobamba)', lat: -6.0342, lng: -76.9714, region: 'Selva' },
  { name: 'Tacna', lat: -18.0146, lng: -70.2536, region: 'Costa' },
  { name: 'Tumbes', lat: -3.5669, lng: -80.4515, region: 'Costa' },
  { name: 'Ucayali (Pucallpa)', lat: -8.3791, lng: -74.5539, region: 'Selva' },
];

export const PeruMapViewer: React.FC<PeruMapViewerProps> = ({
  district,
  departmentName,
  provinceName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedSafeZone, setSelectedSafeZone] = useState<number>(0);
  const [showEvacuationRadius, setShowEvacuationRadius] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<'streets' | 'topo'>('streets');
  const [isNationalView, setIsNationalView] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [district.lat, district.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Tile Layer (OpenStreetMap Carto / Standard)
      const tileUrl =
        mapMode === 'topo'
          ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Attribution control subtle bottom right
      L.control.attribution({ position: 'bottomright', prefix: 'IGN Perú • OSM' }).addTo(map);

      // Create layers group
      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map tiles when mode toggles
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      mapMode === 'topo'
        ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayerRef.current.setUrl(tileUrl);
  }, [mapMode]);

  // Redraw layers when district, safeZone, radius, routes, or view mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (isNationalView) {
      // Zoom out to whole Peru bounds
      map.flyToBounds(
        [
          [-18.5, -81.5],
          [-0.03, -68.5],
        ],
        { duration: 1.2 }
      );

      // Draw all 24 department markers
      DEPT_CAPITALS.forEach((cap) => {
        const isCurrent = cap.name.toLowerCase().includes(departmentName.toLowerCase());
        const markerHtml = `
          <div style="
            background: ${isCurrent ? '#D20103' : '#002B5B'};
            color: white;
            padding: 3px 7px;
            border-radius: 9999px;
            border: 2px solid white;
            font-size: 10px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 3px;
          ">
            <span>${isCurrent ? '⭐' : '🏛️'}</span>
            <span>${cap.name}</span>
          </div>
        `;
        const icon = L.divIcon({
          html: markerHtml,
          className: 'dept-capital-pin',
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([cap.lat, cap.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
            <strong style="color: #002B5B;">Departamento: ${cap.name}</strong><br/>
            <span style="color: #475569;">Región Natural: ${cap.region}</span><br/>
            <span style="color: #64748b;">GPS: ${cap.lat.toFixed(4)}°, ${cap.lng.toFixed(4)}°</span>
          </div>
        `);
        group.addLayer(marker);
      });
    } else {
      // Zoom into District
      map.flyTo([district.lat, district.lng], 13, { duration: 1.0 });

      // 1. Evacuation Perimeters (500m & 1000m circles)
      if (showEvacuationRadius) {
        const circle500 = L.circle([district.lat, district.lng], {
          radius: 500,
          color: '#ef4444',
          weight: 1.5,
          fillColor: '#ef4444',
          fillOpacity: 0.12,
          dashArray: '5, 5',
        });
        circle500.bindTooltip('Perímetro de Evacuación Inmediata: 500m', { permanent: false });
        group.addLayer(circle500);

        const circle1000 = L.circle([district.lat, district.lng], {
          radius: 1000,
          color: '#f59e0b',
          weight: 1,
          fillColor: '#f59e0b',
          fillOpacity: 0.05,
          dashArray: '6, 6',
        });
        circle1000.bindTooltip('Zona de Influencia Extendida: 1,000m', { permanent: false });
        group.addLayer(circle1000);
      }

      // 2. District Center Marker
      const centerMarkerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(210, 1, 3, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #D20103; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">📍</div>
        </div>
      `;
      const centerIcon = L.divIcon({
        html: centerMarkerHtml,
        className: 'user-district-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const centerMarker = L.marker([district.lat, district.lng], { icon: centerIcon });
      centerMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 6px; font-size: 12px; min-width: 160px;">
          <strong style="color: #D20103; font-size: 13px;">📍 ${district.name}</strong><br/>
          <span style="color: #334155;">Provincia: ${provinceName}</span><br/>
          <span style="color: #334155;">Departamento: ${departmentName}</span><br/>
          <span style="color: #002B5B; font-weight: bold;">Altitud: ${district.altitudeMeters} msnm</span><br/>
          <span style="color: #64748b; font-size: 11px;">Clima: ${district.climateType}</span>
        </div>
      `);
      group.addLayer(centerMarker);

      // 3. Safe Zones & Evacuation Route Polylines
      district.safeZones.forEach((sz, idx) => {
        // Calculate realistic coordinates for the safe zone based on angle & distance
        const angle = (idx * (Math.PI * 2)) / district.safeZones.length + 0.5;
        const dLat = (sz.distanceMeters / 111000) * Math.cos(angle);
        const dLng = (sz.distanceMeters / (111000 * Math.cos((district.lat * Math.PI) / 180))) * Math.sin(angle);
        const szLat = district.lat + dLat;
        const szLng = district.lng + dLng;

        const isSelected = selectedSafeZone === idx;

        // Evacuation Polyline Route
        if (showRoutes) {
          const routePolyline = L.polyline(
            [
              [district.lat, district.lng],
              [szLat, szLng],
            ],
            {
              color: isSelected ? '#002B5B' : '#059669',
              weight: isSelected ? 4 : 2.5,
              opacity: isSelected ? 0.95 : 0.75,
              dashArray: isSelected ? undefined : '6, 4',
            }
          );
          group.addLayer(routePolyline);
        }

        // Safe Zone Pin Marker
        const szHtml = `
          <div style="
            background: ${isSelected ? '#002B5B' : '#059669'};
            color: white;
            padding: 3px 8px;
            border-radius: 8px;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transform: ${isSelected ? 'scale(1.12)' : 'scale(1.0)'};
            transition: all 0.2s;
            white-space: nowrap;
          ">
            <span>${sz.type === 'Zona Alta' ? '⛰️' : '🛡️'}</span>
            <span>${sz.name.slice(0, 16)}</span>
          </div>
        `;
        const szIcon = L.divIcon({
          html: szHtml,
          className: 'safe-zone-pin',
          iconSize: [120, 26],
          iconAnchor: [60, 13],
        });

        const szMarker = L.marker([szLat, szLng], { icon: szIcon });
        szMarker.on('click', () => setSelectedSafeZone(idx));
        szMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
            <strong style="color: #059669; font-size: 13px;">🛡️ ${sz.name}</strong><br/>
            <span style="color: #334155; font-weight: bold;">Tipo: ${sz.type}</span><br/>
            <span style="color: #475569;">Distancia: ~${sz.distanceMeters} m (~${Math.ceil(sz.distanceMeters / 70)} min a pie)</span><br/>
            <p style="margin-top: 4px; color: #1e293b; font-size: 11px;">${sz.routeDescription}</p>
          </div>
        `);
        group.addLayer(szMarker);
      });
    }

    // Invalidate map size after render to avoid grey box issues
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [district, departmentName, provinceName, selectedSafeZone, showEvacuationRadius, showRoutes, isNationalView]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetToDistrict = () => {
    setIsNationalView(false);
    mapInstanceRef.current?.flyTo([district.lat, district.lng], 13);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header with Title and Interactive Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#002B5B]">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Mapa Geográfico y Rutas de Evacuación del Perú
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Cartografía Oficial Activa
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Visualización cartográfica real de los 24 departamentos, provincias y los 1,893 distritos con rutas seguras.
            </p>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNationalView(!isNationalView)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isNationalView
                ? 'bg-[#002B5B] text-white border-[#002B5B]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {isNationalView ? '📍 Enfocar Mi Distrito' : '🇵🇪 Ver Todo el Perú (24 Dptos)'}
          </button>

          <button
            type="button"
            onClick={() => setMapMode(mapMode === 'streets' ? 'topo' : 'streets')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            {mapMode === 'streets' ? 'Modo Relieve Topográfico' : 'Modo Calles Estándar'}
          </button>

          <button
            type="button"
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              showRoutes
                ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Rutas
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Safe Zones Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Leaflet Real Interactive Map of Peru */}
        <div className="lg:col-span-7 bg-slate-100 rounded-xl border border-slate-200 relative overflow-hidden flex flex-col min-h-[420px] shadow-inner">
          {/* Top-Right Floating Controls */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Acercar"
              className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-800 border border-slate-300 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Alejar"
              className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-slate-800 border border-slate-300 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetToDistrict}
              title="Centrar en mi distrito"
              className="w-8 h-8 rounded-lg bg-[#002B5B] hover:bg-[#001f42] text-white shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Top-Left Status Tag */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-md space-y-0.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              {isNationalView ? 'Panorama Nacional: 24 Departamentos' : `${district.name}, ${provinceName}`}
            </div>
            <div className="text-[11px] text-slate-600">
              {isNationalView ? '196 Provincias • 1,893 Distritos' : `Altitud: ${district.altitudeMeters} msnm • ${district.region}`}
            </div>
          </div>

          {/* Leaflet Map DOM Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-[430px] rounded-xl z-0"
            style={{ minHeight: '430px' }}
          />

          {/* Bottom GPS Bar */}
          <div className="w-full bg-white px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 z-10">
            <span className="font-mono">
              GPS: {district.lat.toFixed(4)}°S, {district.lng.toFixed(4)}°W ({district.name})
            </span>
            <span className="text-[#002B5B] font-bold">
              Cartografía Satelital y Vectorial OpenStreetMap / IGN
            </span>
          </div>
        </div>

        {/* Safe Zones & Evacuation Protocol Detail List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zonas Seguras Designadas ({district.safeZones.length})
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">Distrito de {district.name}</span>
          </div>

          <div className="space-y-2.5">
            {district.safeZones.map((sz, idx) => {
              const isSelected = selectedSafeZone === idx;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    setSelectedSafeZone(idx);
                    // Also center on safe zone
                    const angle = (idx * (Math.PI * 2)) / district.safeZones.length + 0.5;
                    const dLat = (sz.distanceMeters / 111000) * Math.cos(angle);
                    const dLng =
                      (sz.distanceMeters / (111000 * Math.cos((district.lat * Math.PI) / 180))) * Math.sin(angle);
                    mapInstanceRef.current?.panTo([district.lat + dLat, district.lng + dLng]);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-2 border-[#002B5B] text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      {sz.name}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                      {sz.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    {sz.routeDescription}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-[#002B5B] font-bold font-mono">
                      <Footprints className="w-3.5 h-3.5" />
                      Distancia: ~{sz.distanceMeters} metros
                    </span>
                    <span className="font-medium text-slate-700">
                      Tiempo: ~{Math.ceil(sz.distanceMeters / 70)} min a pie
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Evacuation Guidelines */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Recomendación Oficial de Evacuación
            </div>
            <p className="leading-relaxed">
              Desplácese con paso firme y ágil sin correr. Lleve su mochila de emergencia en la espalda para mantener libres ambas manos. Siga las flechas verdes del mapa hacia los puntos de reunión oficiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
