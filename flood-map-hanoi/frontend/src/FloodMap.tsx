import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useMapState } from './context/MapContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Circle, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Navigation } from 'lucide-react';

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
        let isFlooded = false;
        for (const [lat, lng] of path) {
            if (distance(report.lat, report.lng, lat, lng) < radius) {
                isFlooded = true;
                break;
            }
        }
        if (isFlooded) count++;
    }
    return count;
}

function MapBoundsFitter({ path }: { path: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (path.length > 0) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [path, map]);
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

  return (mode === 'REPORT' && reportPos) ? (
    <Marker position={reportPos}>
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

  const position: L.LatLngTuple = [21.0285, 105.8542];

  const [alertRadius, setAlertRadius] = useState(500);

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

  const getAddressFromCoords = async (lat: number, lng: number) => {
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } catch (err) {
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
  };

  const getCoordsFromAddress = async (address: string): Promise<[number, number] | null> => {
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
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
      if (!isAuthenticated || user?.role !== 'USER') {
          alert('Chỉ người dùng mới được đánh giá báo cáo!');
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
      if (isAuthenticated && 'geolocation' in navigator) {
          const alertInterval = setInterval(() => {
              navigator.geolocation.getCurrentPosition((pos) => {
                  const userLat = pos.coords.latitude;
                  const userLng = pos.coords.longitude;
                  
                  // Check if any report is close (e.g. < 2km)
                  const closeReports = reports.filter(r => {
                      if (r.level === 'LOW') return false;
                      const dist = Math.sqrt(Math.pow(r.lat - userLat, 2) + Math.pow(r.lng - userLng, 2)) * 111; // approx km
                      return dist < 2;
                  });

                  if (closeReports.length > 0) {
                      // Optional: Use Notification API or custom toast
                      // alert(`CẢNH BÁO: Có ${closeReports.length} điểm ngập nghiêm trọng trong bán kính 2km xung quanh bạn!`);
                  }
              });
          }, 60000); // Check every 1 minute
          return () => clearInterval(alertInterval);
      }
  }, [reports, isAuthenticated]);

  useEffect(() => {
    if (routeStart && routeEnd) {
      fetch(`http://router.project-osrm.org/route/v1/driving/${routeStart.lng},${routeStart.lat};${routeEnd.lng},${routeEnd.lat}?overview=full&geometries=geojson&alternatives=3`)
        .then(res => res.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                const routesPaths = data.routes.map((route: any) => {
                    const coords = route.geometry.coordinates;
                    return coords.map((c: any) => [c[1], c[0]]);
                });
                setAlternativeRoutes(routesPaths);
            }
        })
        .catch(console.error);
    } else {
        setAlternativeRoutes([]);
    }
  }, [routeStart, routeEnd]);

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

  useEffect(() => {
      if (isSearchOpen && !routeStart && !startAddress) {
          if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(async (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  setRouteStart(new L.LatLng(lat, lng));
                  const addr = await getAddressFromCoords(lat, lng);
                  setStartAddress(addr);
              });
          }
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

  const handleReportSubmit = async (lat: number, lng: number) => {
      if (!isAuthenticated || user?.role !== 'USER') {
          alert('Chỉ người dùng mới được báo cáo điểm ngập!');
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
      {isSearchOpen && (
          <div className="glass-panel" style={{ 
              position: 'absolute', top: '20px', left: '60px', zIndex: 1000, 
              padding: '1.5rem', borderRadius: '12px', width: '320px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
          }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setIsSearchOpen(false)}>Đóng</button>
                  <button className="btn btn-primary" onClick={handleSearchRoute}>Tìm đường</button>
              </div>
          </div>
      )}

      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsFitter path={routePath} />
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
                    >
                        <Popup>
                            <div className="popup-content">
                                <h4 className="popup-title-danger">
                                    Điểm ngập ({report.level}) {report.status === 'PENDING' ? ' - Chờ duyệt' : ''}
                                </h4>
                                <p className="popup-text">{report.description}</p>
                                <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: '#4b5563' }}>
                                    <span style={{ marginRight: '10px', color: '#16a34a', fontWeight: 'bold' }}>👍 {report.upvotes || 0} Đồng ý</span>
                                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>👎 {report.downvotes || 0} Từ chối</span>
                                </div>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleVote(report.id, true)}>Xác nhận</button>
                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleVote(report.id, false)}>Phủ nhận</button>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                </React.Fragment>
            );
        })}
      </MapContainer>
    </div>
  );
}
