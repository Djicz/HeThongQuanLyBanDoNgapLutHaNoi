import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useMapState } from './context/MapContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Circle, CircleMarker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Navigation, Car, Footprints, Play, Square } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { registerPlugin } from "@capacitor/core";

const BackgroundGeolocation = registerPlugin<any>("BackgroundGeolocation");

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface FloodReportDTO {
    id: string;
    lat: number;
    lng: number;
    level: string;
    description: string;
    status: string;
    userId: string;
    upvotes: number;
    downvotes: number;
    proofImage?: string;
}

function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function countFloodedAreas(path: [number, number][], reports: FloodReportDTO[], radius: number) {
    const verifiedReports = reports.filter(r => r.status === 'VERIFIED');
    let count = 0;
    for (const report of verifiedReports) {
        for (const pt of path) {
            const dist = distance(pt[0], pt[1], report.lat, report.lng);
            if (dist <= radius) {
                count++;
                break;
            }
        }
    }
    return count;
}

function MapController({ center, zoom, onZoomChange, onCenterChange }: { center: L.LatLngTuple, zoom: number, onZoomChange?: (z: number) => void, onCenterChange?: (c: L.LatLngTuple) => void }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    
    useMapEvents({
        zoomend() {
            if (onZoomChange) {
                onZoomChange(map.getZoom());
            }
        },
        moveend() {
            if (onCenterChange) {
                const currentCenter = map.getCenter();
                onCenterChange([currentCenter.lat, currentCenter.lng]);
            }
        }
    });
    
    return null;
}

function MapBoundsFitter({ path, isNavigating }: { path: [number, number][], isNavigating: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (path.length > 0 && !isNavigating) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [path, map, isNavigating]);
    return null;
}

function MapClickHandler({ 
  mode, 
  onReportSubmit, 
  onSetStart, 
  onSetEnd 
}: { 
  mode: 'REPORT' | 'ROUTE_START' | 'ROUTE_END' | 'VIEW',
  onReportSubmit: (lat: number, lng: number) => void,
  onSetStart: (latlng: L.LatLng) => void,
  onSetEnd: (latlng: L.LatLng) => void
}) {
  const [reportPos, setReportPos] = useState<L.LatLng | null>(null);
  const markerRef = useRef<any>(null);

  useMapEvents({
    click(e) {
      if (mode === 'ROUTE_START') {
        onSetStart(e.latlng);
      } else if (mode === 'ROUTE_END') {
        onSetEnd(e.latlng);
      } else if (mode === 'REPORT') {
        setReportPos(e.latlng);
      }
    },
  });

  useEffect(() => {
    if (reportPos && markerRef.current) {
        markerRef.current.openPopup();
    }
  }, [reportPos]);

  return (mode === 'REPORT' && reportPos) ? (
    <Marker position={reportPos} ref={markerRef}>
      <Popup>
        <div className="popup-content">
          <h3 className="popup-title">Điểm đã chọn</h3>
          <p className="popup-text">Lat: {reportPos.lat.toFixed(4)}</p>
          <p className="popup-text">Lng: {reportPos.lng.toFixed(4)}</p>
          <button 
            onClick={() => {
              onReportSubmit(reportPos.lat, reportPos.lng);
              setReportPos(null);
            }}
            className="btn-report">
            Báo cáo điểm ngập
          </button>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function FloodMap() {
    const { user, token, isAuthenticated } = useAuth();
    const [reports, setReports] = useState<FloodReportDTO[]>([]);
    const notifiedReports = useRef<Set<string>>(new Set());
    const [selectedReport, setSelectedReport] = useState<FloodReportDTO | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const setupNotifications = async () => {
            try {
                await LocalNotifications.requestPermissions();
                await LocalNotifications.createChannel({
                    id: 'flood_alerts',
                    name: 'Cảnh báo ngập lụt',
                    description: 'Thông báo khi đi vào vùng ngập nguy hiểm',
                    importance: 5,
                    visibility: 1
                });
            } catch (e) {
                console.error("Local notifications setup failed", e);
            }
        };
        setupNotifications();
    }, []);

    const location = useLocation();
  const { 
    mapClickMode, setMapClickMode, 
    routeStart, setRouteStart, 
    routeEnd, setRouteEnd, 
    routePath, setRoutePath, 
    floodedAreasCount, setFloodedAreasCount,
    isSearchOpen, setIsSearchOpen 
  } = useMapState();

  const [alternativeRoutes, setAlternativeRoutes] = useState<[number, number][][]>([]);

  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');

  const [position, setPosition] = useState<L.LatLngTuple>([21.0285, 105.8542]);
  const [mapZoom, setMapZoom] = useState(13);
  const [userLocationMarker, setUserLocationMarker] = useState<L.LatLngTuple | null>(null);

  const [vehicleType, setVehicleType] = useState<'driving' | 'foot'>('driving');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navWatcherId, setNavWatcherId] = useState<string | null>(null);

  const [alertRadius, setAlertRadius] = useState(500);

  useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const lat = queryParams.get('lat');
      const lng = queryParams.get('lng');
      if (lat && lng) {
          setPosition([parseFloat(lat), parseFloat(lng)]);
          setMapZoom(17);
      }
  }, [location.search]);

  const fetchConfig = async () => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/flood-reports/config`);
          if (res.ok) {
              const data = await res.json();
              if (data.alertRadius) setAlertRadius(data.alertRadius);
          }
      } catch (err) {
          console.error("Failed to fetch config", err);
      }
  };

  const handleLocateMe = async () => {
      try {
          const positionData = await Geolocation.getCurrentPosition();
          const latlng: L.LatLngTuple = [positionData.coords.latitude, positionData.coords.longitude];
          setPosition(latlng);
          setUserLocationMarker(latlng);
          setMapZoom(16);
      } catch (error) {
          console.error("Lỗi lấy vị trí:", error);
          alert("Không thể lấy vị trí. Vui lòng kiểm tra quyền GPS của bạn.");
      }
  };

  const getAddressFromCoords = async (lat: number, lng: number) => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/public/external/nominatim/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch (err) {
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
  };

  const getCoordsFromAddress = async (address: string): Promise<[number, number] | null> => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/public/external/nominatim/search?q=${encodeURIComponent(address)}`);
          const data = await res.json();
          if (data && data.length > 0) {
              return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          }
      } catch (err) {
          console.error(err);
      }
      return null;
  };

  const fetchReports = async () => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/flood-reports`, {
              headers: isAuthenticated ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
              const data = await res.json();
              setReports(data);
          }
      } catch (err) {
          console.error("Failed to fetch reports", err);
      }
  };

  const handleVote = async (id: string, isUpvote: boolean) => {
      if (!isAuthenticated) {
          alert('Vui lòng đăng nhập để đánh giá báo cáo!');
          return;
      }
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/user/reports/${id}/vote?isUpvote=${isUpvote}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          alert(data.message || (res.ok ? 'Thành công' : 'Thất bại'));
          if (res.ok) fetchReports();
      } catch (err) {
          console.error(err);
          alert('Lỗi kết nối');
      }
  };

  useEffect(() => {
      fetchConfig();
      fetchReports();
      const intervalId = setInterval(fetchReports, 30000); // Poll every 30s
      return () => clearInterval(intervalId);
  }, [isAuthenticated, token]);

  useEffect(() => {
      // Request notification permissions immediately on app start
      LocalNotifications.requestPermissions().then((perm) => {
          if (perm.display === 'granted') {
              LocalNotifications.createChannel({
                  id: 'flood_alerts',
                  name: 'Cảnh báo ngập lụt',
                  description: 'Thông báo khi đi vào vùng ngập nguy hiểm',
                  importance: 5,
                  visibility: 1
              });
          }
      });
  }, []);

  useEffect(() => {
      let watcherId: string | null = null;
      
      const startBackgroundTracking = async () => {
          try {
              watcherId = await BackgroundGeolocation.addWatcher(
                  {
                      backgroundMessage: "Ứng dụng đang theo dõi vị trí để cảnh báo ngập lụt.",
                      backgroundTitle: "Cảnh báo ngập lụt đang chạy",
                      requestPermissions: true,
                      stale: false,
                      distanceFilter: 10 // Trigger every 10 meters of movement
                  },
                  function callback(location: any, error: any) {
                      if (error) {
                          if (error.code === "NOT_AUTHORIZED") {
                              console.error("Background location not authorized");
                          }
                          return;
                      }
                      
                      const userLat = location.latitude;
                      const userLng = location.longitude;
                      
                      const closeReports = reports.filter(r => {
                          if (r.level === 'LOW') return false;
                          const dist = Math.sqrt(Math.pow(r.lat - userLat, 2) + Math.pow(r.lng - userLng, 2)) * 111; // approx km
                          return dist <= (alertRadius / 1000);
                      });

                      // Reset notified status for reports that are no longer close
                      const closeReportIds = new Set(closeReports.map(r => r.id));
                      const idsToRemove: string[] = [];
                      notifiedReports.current.forEach(id => {
                          if (!closeReportIds.has(id)) {
                              idsToRemove.push(id);
                          }
                      });
                      idsToRemove.forEach(id => notifiedReports.current.delete(id));

                      const unnotifiedReports = closeReports.filter(r => !notifiedReports.current.has(r.id));

                      if (unnotifiedReports.length > 0) {
                          const msg = `Bạn đang ở gần ${unnotifiedReports.length} điểm ngập nguy hiểm. Hãy chuyển hướng ngay!`;

                          LocalNotifications.checkPermissions().then(async (perm) => {
                              let canNotify = perm.display === 'granted';
                              if (!canNotify) {
                                  const req = await LocalNotifications.requestPermissions();
                                  canNotify = req.display === 'granted';
                              }

                              if (canNotify) {
                                  try {
                                      await LocalNotifications.schedule({
                                          notifications: [
                                              {
                                                  title: "Cảnh báo ngập lụt",
                                                  body: msg,
                                                  id: Math.floor(Math.random() * 1000000),
                                                  channelId: 'flood_alerts'
                                              }
                                          ]
                                      });
                                      // Mark as notified only after successful scheduling
                                      unnotifiedReports.forEach(r => notifiedReports.current.add(r.id));
                                  } catch (e) {
                                      console.error("Failed to schedule notification", e);
                                  }
                              }
                          });
                      }
                  }
              );
          } catch (error) {
              console.error("Failed to start background geolocation", error);
          }
      };

      startBackgroundTracking();

      return () => {
          if (watcherId) {
              BackgroundGeolocation.removeWatcher({ id: watcherId });
          }
      };
  }, [reports, alertRadius]);

  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  const [routeInstructions, setRouteInstructions] = useState<any[]>([]);

  useEffect(() => {
    if (routeStart && routeEnd) {
      fetch(`${import.meta.env.VITE_API_URL}/public/external/osrm/route?startLng=${routeStart.lng}&startLat=${routeStart.lat}&endLng=${routeEnd.lng}&endLat=${routeEnd.lat}&vehicleType=${vehicleType}`)
        .then(res => res.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                // Parse alternative routes
                const routesPaths = data.routes.map((route: any) => {
                    const coords = route.geometry.coordinates;
                    return coords.map((c: any) => [c[1], c[0]]);
                });
                setAlternativeRoutes(routesPaths);

                // Parse instructions for the best route (usually first route)
                const route = data.routes[0];
                if (route.legs && route.legs.length > 0 && route.legs[0].steps) {
                    setRouteInstructions(route.legs[0].steps);
                    if (route.legs[0].steps.length > 0) {
                        updateInstructionText(route.legs[0].steps[0]);
                    }
                }
            }
        })
        .catch(console.error);
    } else {
        setAlternativeRoutes([]);
        setRouteInstructions([]);
        setCurrentInstruction('');
    }
  }, [routeStart, routeEnd, vehicleType]);

  const updateInstructionText = (step: any) => {
      if (!step || !step.maneuver) return;
      const type = step.maneuver.type;
      const modifier = step.maneuver.modifier;
      const name = step.name ? ` vào ${step.name}` : '';
      
      let text = 'Đi tiếp';
      if (type === 'depart') text = 'Bắt đầu đi';
      else if (type === 'arrive') text = 'Đã đến nơi';
      else if (modifier) {
          if (modifier.includes('left')) text = 'Rẽ trái';
          if (modifier.includes('right')) text = 'Rẽ phải';
          if (modifier.includes('uturn')) text = 'Quay đầu';
      }
      
      setCurrentInstruction(`${text}${name} (${Math.round(step.distance)}m)`);
  };

  useEffect(() => {
      if (alternativeRoutes.length > 0) {
          let bestPath = alternativeRoutes[0];
          let minFlooded = Infinity;
          for (const path of alternativeRoutes) {
              const count = countFloodedAreas(path, reports, alertRadius);
              if (count < minFlooded) {
                  minFlooded = count;
                  bestPath = path;
              }
              if (count === 0) break;
          }
          setRoutePath(bestPath);
          setFloodedAreasCount(minFlooded);
      } else {
          setRoutePath([]);
          setFloodedAreasCount(0);
      }
  }, [alternativeRoutes, reports, alertRadius]);

  const handleUseCurrentLocationForStart = async () => {
      try {
          const position = await Geolocation.getCurrentPosition();
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setRouteStart(new L.LatLng(lat, lng));
          setStartAddress("Đang tải địa chỉ...");
          const addr = await getAddressFromCoords(lat, lng);
          setStartAddress(addr);
      } catch (e) {
          console.error("Lỗi vị trí:", e);
          alert("Không thể lấy vị trí. Hãy bật GPS và cấp quyền truy cập.");
      }
  };

  useEffect(() => {
      if (isSearchOpen && !routeStart && !startAddress) {
          handleUseCurrentLocationForStart();
      }
  }, [isSearchOpen]);

  const handleSearchRoute = async () => {
      if (startAddress && !routeStart) {
          const coords = await getCoordsFromAddress(startAddress);
          if (coords) setRouteStart(new L.LatLng(coords[0], coords[1]));
      }
      if (endAddress && !routeEnd) {
          const coords = await getCoordsFromAddress(endAddress);
          if (coords) setRouteEnd(new L.LatLng(coords[0], coords[1]));
      }
      setIsSearchOpen(false);
  };

  const startNavigation = async () => {
      setIsNavigating(true);
      setMapZoom(17);
      try {
          const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
              if (position) {
                  const latlng: L.LatLngTuple = [position.coords.latitude, position.coords.longitude];
                  setPosition(latlng);
                  setUserLocationMarker(latlng);
                  // Reroute every time location updates significantly (optional optimization)
                  setRouteStart(new L.LatLng(latlng[0], latlng[1]));
              }
          });
          setNavWatcherId(id);
      } catch (e) {
          console.error(e);
      }
  };

  const stopNavigation = async () => {
      setIsNavigating(false);
      if (navWatcherId) {
          await Geolocation.clearWatch({ id: navWatcherId });
          setNavWatcherId(null);
      }
      setRouteStart(null);
      setRouteEnd(null);
      setStartAddress('');
      setEndAddress('');
      setRoutePath([]);
      setAlternativeRoutes([]);
      setRouteInstructions([]);
      setCurrentInstruction('');
  };

  const handleReportSubmit = async (lat: number, lng: number) => {
      if (!isAuthenticated) {
          alert('Vui lòng đăng nhập để báo cáo điểm ngập!');
          return;
      }
      try {
          const payload = { lat, lng, level: 'MEDIUM', description: 'Ngập do mưa lớn' };
          const res = await fetch(`${import.meta.env.VITE_API_URL}/flood-reports`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });
          if (res.ok) {
              alert('Báo cáo điểm ngập thành công! Đang chờ duyệt.');
              fetchReports();
              setMapClickMode('VIEW');
          } else {
              alert('Báo cáo thất bại. Có thể bạn không có quyền.');
          }
      } catch (err) {
          alert('Lỗi kết nối tới máy chủ!');
      }
  }

  return (
    <div className="map-container-wrapper">
      {/* Mobile search trigger */}
      {!isSearchOpen && isMobile && (
          <div 
            onClick={() => setIsSearchOpen(true)}
            style={{ 
              position: 'absolute', top: 'calc(1rem + max(env(safe-area-inset-top, 0px), 50px))', left: '1rem', width: 'calc(100% - 2rem)', zIndex: 1000, 
              padding: '0.85rem 1.25rem', borderRadius: '99px',
              backgroundColor: 'var(--bg-panel)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex', alignItems: 'center', gap: '12px',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '1rem',
              boxSizing: 'border-box'
          }}>
              <Search size={20} color="#2563eb" />
              <span>Tìm kiếm tuyến đường...</span>
          </div>
      )}

      {/* Floating Action Button for Location */}
      {mapClickMode === 'VIEW' && (
        <button 
          className="btn-primary"
          onClick={handleLocateMe}
          style={{
            position: 'absolute',
            bottom: isMobile ? '6rem' : '2rem',
            right: '1rem',
            zIndex: 1000,
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Vị trí của tôi"
        >
          <Navigation size={24} color="#fff" />
        </button>
      )}

      {mapClickMode === 'REPORT' && (
        <div style={{
          position: 'absolute',
          top: 'calc(5rem + max(env(safe-area-inset-top, 0px), 50px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'var(--primary)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '99px',
          boxShadow: 'var(--shadow-md)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: 'max-content',
          maxWidth: '90%',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          Vui lòng chọn một điểm trên bản đồ
          <button 
            onClick={() => setMapClickMode('VIEW')}
            style={{ background: 'none', border: 'none', color: 'white', padding: 0, marginLeft: '8px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {isSearchOpen && (
          <div className="search-panel" style={{ 
              position: 'absolute', top: '20px', left: '60px', zIndex: 1000, 
              padding: '1.5rem', borderRadius: '16px', width: '320px',
              backgroundColor: 'var(--bg-panel)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-lg)'
          }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <Navigation size={20} color="#2563eb" /> Tìm tuyến đường
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Điểm xuất phát</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Vị trí hiện tại hoặc nhập địa chỉ..." 
                          value={startAddress}
                          onChange={(e) => { setStartAddress(e.target.value); setRouteStart(null); }}
                          style={{ flex: 1, padding: '0.5rem' }}
                      />
                      <button 
                          className="btn btn-outline" 
                          onClick={handleUseCurrentLocationForStart}
                          title="Sử dụng vị trí hiện tại"
                      >
                          <Navigation size={16} />
                      </button>
                      <button 
                          className="btn btn-outline" 
                          onClick={() => { setMapClickMode('ROUTE_START'); setIsSearchOpen(false); }}
                          title="Chọn trên bản đồ"
                      >
                          <MapPin size={16} />
                      </button>
                  </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Điểm đến</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nhập địa chỉ điểm đến..." 
                          value={endAddress}
                          onChange={(e) => { setEndAddress(e.target.value); setRouteEnd(null); }}
                          style={{ flex: 1, padding: '0.5rem' }}
                      />
                      <button 
                          className="btn btn-outline" 
                          onClick={() => { setMapClickMode('ROUTE_END'); setIsSearchOpen(false); }}
                          title="Chọn trên bản đồ"
                      >
                          <MapPin size={16} />
                      </button>
                  </div>
              </div>

              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                      className={`btn ${vehicleType === 'driving' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setVehicleType('driving')}
                      style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center' }}
                  >
                      <Car size={18} /> Đi xe
                  </button>
                  <button 
                      className={`btn ${vehicleType === 'foot' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setVehicleType('foot')}
                      style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center' }}
                  >
                      <Footprints size={18} /> Đi bộ
                  </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setIsSearchOpen(false)}>Đóng</button>
                  <button className="btn btn-primary" onClick={handleSearchRoute}>Tìm đường</button>
              </div>
          </div>
      )}

      {/* Navigation Controls Overlay */}
      {routePath.length > 0 && !isSearchOpen && (
          <div style={{
              position: 'absolute',
              bottom: isMobile ? '6rem' : '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              width: '90%',
              maxWidth: '400px'
          }}>
              {isNavigating && currentInstruction && (
                  <div style={{
                      background: 'var(--surface)',
                      padding: '1rem 1.5rem',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-lg)',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: 'var(--primary)',
                      textAlign: 'center',
                      width: '100%',
                      border: '2px solid var(--primary-light)'
                  }}>
                      {currentInstruction}
                  </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                  {!isNavigating ? (
                      <button className="btn-primary" onClick={startNavigation} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 2rem', borderRadius: '30px', boxShadow: 'var(--shadow-lg)', fontWeight: 'bold' }}>
                          <Play size={20} /> Bắt đầu đi
                      </button>
                  ) : (
                      <button className="btn" onClick={stopNavigation} style={{ background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 2rem', borderRadius: '30px', boxShadow: 'var(--shadow-lg)', fontWeight: 'bold', border: 'none' }}>
                          <Square size={20} /> Kết thúc
                      </button>
                  )}
              </div>
          </div>
      )}

      <MapContainer center={position} zoom={mapZoom} scrollWheelZoom={true} className="map-container" zoomControl={false}>
        <ZoomControl position="bottomright" />
        <MapController center={position} zoom={mapZoom} onZoomChange={setMapZoom} onCenterChange={setPosition} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsFitter path={routePath} isNavigating={isNavigating} />
        <MapClickHandler 
          mode={mapClickMode}
          onReportSubmit={handleReportSubmit} 
          onSetStart={(latlng) => {
              setRouteStart(latlng);
              setMapClickMode('VIEW');
              setIsSearchOpen(true);
              getAddressFromCoords(latlng.lat, latlng.lng).then(setStartAddress);
          }}
          onSetEnd={(latlng) => {
              setRouteEnd(latlng);
              setMapClickMode('VIEW');
              setIsSearchOpen(true);
              getAddressFromCoords(latlng.lat, latlng.lng).then(setEndAddress);
          }}
        />

        {userLocationMarker && (
            <Marker position={userLocationMarker}>
                <Popup>Vị trí của bạn</Popup>
            </Marker>
        )}
        
        {routeStart && <Marker position={routeStart}><Popup>Điểm đi</Popup></Marker>}
        {routeEnd && <Marker position={routeEnd}><Popup>Điểm đến</Popup></Marker>}

        {routePath.length > 0 && (
          <Polyline 
            positions={routePath} 
            pathOptions={{ 
              color: floodedAreasCount > 0 ? '#dc2626' : '#16a34a', 
              weight: 5 
            }} 
          />
        )}

        {reports.filter(r => r.status === 'VERIFIED').map((report, index) => {
            const color = report.level === 'HIGH' ? '#dc2626' : report.level === 'MEDIUM' ? '#d97706' : '#facc15';
            return (
                <React.Fragment key={index}>
                    <Circle 
                        center={[report.lat, report.lng]} 
                        radius={alertRadius} 
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 1 }} 
                    />
                    <CircleMarker 
                        center={[report.lat, report.lng]} 
                        radius={6} 
                        pathOptions={{ color: '#000', weight: 1, fillColor: color, fillOpacity: 1 }}
                        eventHandlers={{
                            click: () => {
                                setSelectedReport(report);
                                setSelectedAddress('');
                                setIsLoadingAddress(true);
                                getAddressFromCoords(report.lat, report.lng)
                                    .then(addr => {
                                        setSelectedAddress(addr);
                                        setIsLoadingAddress(false);
                                    });
                            },
                        }}
                    >
                    </CircleMarker>
                </React.Fragment>
            );
        })}
      </MapContainer>

      <div className={`flood-info-panel ${isMobile ? 'mobile' : 'desktop'} ${selectedReport ? 'open' : ''}`}>
          <div className="flood-info-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '1rem 1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '600' }}>Thông tin điểm ngập</h3>
              <button 
                  onClick={() => setSelectedReport(null)}
                  style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                  &times;
              </button>
          </div>
          <div className="flood-info-body" style={{ padding: '1.5rem' }}>
              {selectedReport && (
                  <>
                      <div className="flood-address-container" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'flex-start' }}>
                          <MapPin size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.4' }}>
                              {isLoadingAddress ? <span style={{ color: '#9ca3af' }}>Đang tải địa chỉ...</span> : selectedAddress}
                          </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                          <span className={`flood-badge level-${selectedReport.level.toLowerCase()}`}>
                              Mức độ: {selectedReport.level}
                          </span>
                      </div>
                      
                      {selectedReport.description && (
                          <div className="flood-desc-container" style={{ marginBottom: '1rem' }}>
                              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#4b5563' }}>Mô tả</h4>
                              <p style={{ margin: 0, fontSize: '0.95rem', color: '#1f2937' }}>
                                  {selectedReport.description}
                              </p>
                          </div>
                      )}

                      {selectedReport.proofImage && (
                          <div className="flood-image-container" style={{ marginBottom: '1rem' }}>
                              <img 
                                  src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedReport.proofImage}`} 
                                  alt="Proof" 
                                  style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '200px' }} 
                              />
                          </div>
                      )}
                      
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '1rem' }}>
                          ID: {selectedReport.id.substring(0, 8)}...<br/>
                          Tọa độ: {selectedReport.lat.toFixed(5)}, {selectedReport.lng.toFixed(5)}
                      </div>
                  </>
              )}
          </div>
          {selectedReport && (
              <div className="flood-info-footer" style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>👍 {selectedReport.upvotes || 0} Đồng ý</span>
                      <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem' }}>👎 {selectedReport.downvotes || 0} Từ chối</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                          className="btn btn-outline" 
                          style={{ flex: 1, borderColor: '#10b981', color: '#10b981', borderRadius: '8px', padding: '0.6rem' }}
                          onClick={() => handleVote(selectedReport.id, true)}
                      >
                          Xác nhận
                      </button>
                      <button 
                          className="btn btn-outline" 
                          style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', borderRadius: '8px', padding: '0.6rem' }}
                          onClick={() => handleVote(selectedReport.id, false)}
                      >
                          Phủ nhận
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}
