import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Map as MapIcon, History, User, MapPin, CheckSquare, Layers, Users, Settings, Activity, Bell, LogOut, Search, X } from 'lucide-react';
import './dropdown.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MapProvider, useMapState } from './context/MapContext';
import FloodMap from './FloodMap';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/admin/UserManagement';
import Dashboard from './pages/admin/Dashboard';
import SystemConfig from './pages/admin/SystemConfig';
import ActivityLog from './pages/admin/ActivityLog';
import NotificationManagement from './pages/admin/NotificationManagement';
import ReportManagement from './pages/mod/ReportManagement';
import FloodPointManagement from './pages/mod/FloodPointManagement';
import MyReports from './pages/user/MyReports';
import Profile from './pages/user/Profile';
import SavedRoutes from './pages/user/SavedRoutes';
import FloodHistory from './pages/FloodHistory';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mapClickMode, setMapClickMode, routeStart, routeEnd, floodedAreasCount, routePath, isSearchOpen, setIsSearchOpen } = useMapState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isModOrAdmin = user?.role === 'MOD' || user?.role === 'ADMIN';
  const isHomePage = location.pathname === '/';

  return (
    <header className="app-header">
      <Link to="/" onClick={() => window.location.href = '/'} className="app-title" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex' }}>
            <MapIcon size={24} />
        </div>
        <span className="app-title-text">FMap</span>
      </Link>
      <div className="app-header-actions" style={{ alignItems: 'center' }}>
        {routePath.length > 0 && isHomePage && (
            <span style={{ marginRight: '10px', color: floodedAreasCount > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {floodedAreasCount > 0 ? `Cảnh báo: Đi qua ${floodedAreasCount} vùng ngập!` : 'Đường an toàn'}
            </span>
        )}
        
        {isHomePage && (
            <button 
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', marginRight: '10px', borderRadius: '50%' }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                title="Tìm kiếm tuyến đường"
            >
                <Search size={20} color="#2563eb" />
            </button>
        )}
        
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="user-greeting" style={{ fontWeight: 500, color: '#374151' }}>
                Xin chào, {user?.fullName} ({user?.role})
            </span>
            <div className="dropdown-container" ref={dropdownRef}>
              <button 
                  className={`dropdown-trigger ${dropdownOpen ? 'active' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title="Menu tùy chọn"
              >
                  <ChevronDown size={20} />
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                    <Link to="/history" onClick={() => setDropdownOpen(false)}>
                        <History size={18} /> Lịch sử ngập
                    </Link>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                        <User size={18} /> Hồ sơ cá nhân
                    </Link>
                    
                    {user?.role === 'USER' && (
                        <Link to="/user/reports" onClick={() => setDropdownOpen(false)}>
                            <MapPin size={18} /> Báo cáo của tôi
                        </Link>
                    )}
                    
                    {isModOrAdmin && (
                        <>
                            <div className="dropdown-divider"></div>
                            <Link to="/mod/reports" onClick={() => setDropdownOpen(false)}>
                                <CheckSquare size={18} /> Duyệt báo cáo (MOD)
                            </Link>
                            <Link to="/mod/zones" onClick={() => setDropdownOpen(false)}>
                                <Layers size={18} /> Quản lý điểm ngập (MOD)
                            </Link>
                        </>
                    )}
                    
                    {isAdmin && (
                        <>
                            <div className="dropdown-divider"></div>
                            <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>
                                <Activity size={18} /> Dashboard (ADMIN)
                            </Link>
                            <Link to="/admin/users" onClick={() => setDropdownOpen(false)}>
                                <Users size={18} /> Người dùng (ADMIN)
                            </Link>
                            <Link to="/admin/config" onClick={() => setDropdownOpen(false)}>
                                <Settings size={18} /> Cấu hình hệ thống (ADMIN)
                            </Link>
                            <Link to="/admin/logs" onClick={() => setDropdownOpen(false)}>
                                <History size={18} /> Nhật ký hoạt động (ADMIN)
                            </Link>
                            <Link to="/admin/notifications" onClick={() => setDropdownOpen(false)}>
                                <Bell size={18} /> Thông báo (ADMIN)
                            </Link>
                        </>
                    )}
                    
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} style={{ color: '#dc2626' }}>
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </div>
            )}
            </div>
          </div>
        ) : (
          <>
            <Link to="/history" className="btn btn-outline" style={{ textDecoration: 'none', marginRight: '10px' }}>Lịch sử ngập</Link>
            <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  );
};

const SystemNotificationBanner = () => {
  const [notif, setNotif] = useState<any>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dismissedNotifs');
    if (saved) {
      setDismissedIds(JSON.parse(saved));
    }
  }, []);

  const fetchNotification = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/latest`);
      if (res.status === 200) {
        const data = await res.json();
        setNotif(data);
      } else {
        setNotif(null);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotification();
    const interval = setInterval(fetchNotification, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    if (notif) {
      const newDismissed = [...dismissedIds, notif.id];
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedNotifs', JSON.stringify(newDismissed));
    }
  };

  if (!notif || dismissedIds.includes(notif.id)) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1e40af',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      maxWidth: '350px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} /> {notif.title}
        </h4>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
          <X size={16} />
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{notif.message}</p>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container">
      <Header />
      <SystemNotificationBanner />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/public/visit`, { method: 'POST' }).catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <MapProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><FloodMap /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/history" element={<Layout><FloodHistory /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/user/reports" element={<Layout><MyReports /></Layout>} />
          <Route path="/user/routes" element={<Layout><SavedRoutes /></Layout>} />
          <Route path="/admin/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/admin/config" element={<Layout><SystemConfig /></Layout>} />
          <Route path="/admin/logs" element={<Layout><ActivityLog /></Layout>} />
          <Route path="/admin/notifications" element={<Layout><NotificationManagement /></Layout>} />
          <Route path="/mod/reports" element={<Layout><ReportManagement /></Layout>} />
          <Route path="/mod/zones" element={<Layout><FloodPointManagement /></Layout>} />
        </Routes>
        </BrowserRouter>
      </MapProvider>
    </AuthProvider>
  );
}

export default App;
