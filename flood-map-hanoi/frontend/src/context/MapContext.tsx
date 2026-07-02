import React, { createContext, useContext, useState } from 'react';
import L from 'leaflet';

interface MapContextType {
  mapClickMode: 'REPORT' | 'ROUTE_START' | 'ROUTE_END' | 'VIEW';
  setMapClickMode: (mode: 'REPORT' | 'ROUTE_START' | 'ROUTE_END' | 'VIEW') => void;
  routeStart: L.LatLng | null;
  setRouteStart: (pos: L.LatLng | null) => void;
  routeEnd: L.LatLng | null;
  setRouteEnd: (pos: L.LatLng | null) => void;
  routePath: [number, number][];
  setRoutePath: (path: [number, number][]) => void;
  floodedAreasCount: number;
  setFloodedAreasCount: (count: number) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapClickMode, setMapClickMode] = useState<'REPORT' | 'ROUTE_START' | 'ROUTE_END' | 'VIEW'>('VIEW');
  const [routeStart, setRouteStart] = useState<L.LatLng | null>(null);
  const [routeEnd, setRouteEnd] = useState<L.LatLng | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [floodedAreasCount, setFloodedAreasCount] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  return (
    <MapContext.Provider value={{
      mapClickMode, setMapClickMode,
      routeStart, setRouteStart,
      routeEnd, setRouteEnd,
      routePath, setRoutePath,
      floodedAreasCount, setFloodedAreasCount,
      isSearchOpen, setIsSearchOpen
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapState = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapState must be used within a MapProvider');
  }
  return context;
};
