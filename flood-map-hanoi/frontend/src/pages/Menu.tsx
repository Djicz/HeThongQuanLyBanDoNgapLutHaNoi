import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User as UserIcon, Mail, CheckSquare, Layers,
    Activity, Users, Settings, LogOut, ChevronRight, Shield, Bell,
    ClipboardList
} from 'lucide-react';

const Menu: React.FC = () => {
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const isModOrAdmin = user?.role === 'MOD' || user?.role === 'ADMIN';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return (
            <div className="mobile-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={36} color="#94a3b8" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>Chưa đăng nhập</h3>
                <p style={{ margin: 0, color: '#64748b', textAlign: 'center' }}>Đăng nhập để sử dụng đầy đủ tính năng</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: '12px' }}>Đăng nhập</Link>
                    <Link to="/register" className="btn btn-outline" style={{ textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: '12px' }}>Đăng ký</Link>
                </div>
            </div>
        );
    }

    const initial = user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="mobile-page">
            {/* User Card */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
                borderRadius: '20px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'white',
                boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', fontWeight: 700, flexShrink: 0,
                    border: '2px solid rgba(255,255,255,0.4)'
                }}>
                    {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.fullName || user?.username}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <Mail size={13} /> {user?.email}
                    </div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '99px',
                        padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 600
                    }}>
                        <Shield size={12} /> {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'MOD' ? 'Kiểm duyệt viên' : 'Người dùng'}
                    </div>
                </div>
            </div>

            {/* User section */}
            <MenuSection title="Tài khoản">
                <MenuItem to="/profile" icon={<UserIcon size={20} />} label="Hồ sơ cá nhân" />
                <MenuItem to="/user/reports" icon={<ClipboardList size={20} />} label="Báo cáo của tôi" last />
            </MenuSection>

            {/* MOD section */}
            {isModOrAdmin && (
                <MenuSection title="Kiểm duyệt viên">
                    <MenuItem to="/mod/reports" icon={<CheckSquare size={20} />} label="Duyệt báo cáo" />
                    <MenuItem to="/mod/zones" icon={<Layers size={20} />} label="Quản lý điểm ngập" last />
                </MenuSection>
            )}

            {/* ADMIN section */}
            {isAdmin && (
                <MenuSection title="Quản trị">
                    <MenuItem to="/admin/dashboard" icon={<Activity size={20} />} label="Dashboard" />
                    <MenuItem to="/admin/users" icon={<Users size={20} />} label="Quản lý người dùng" />
                    <MenuItem to="/admin/notifications" icon={<Bell size={20} />} label="Thông báo hệ thống" />
                    <MenuItem to="/admin/config" icon={<Settings size={20} />} label="Cấu hình hệ thống" />
                    <MenuItem to="/admin/logs" icon={<ClipboardList size={20} />} label="Nhật ký hoạt động" last />
                </MenuSection>
            )}

            {/* Logout */}
            <button
                onClick={handleLogout}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    backgroundColor: '#fef2f2', color: '#dc2626',
                    fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem',
                    transition: 'background 0.2s'
                }}
            >
                <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut size={18} />
                </div>
                Đăng xuất
            </button>
        </div>
    );
};

interface MenuSectionProps {
    title: string;
    children: React.ReactNode;
}

const MenuSection: React.FC<MenuSectionProps> = ({ title, children }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
            {title}
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {children}
        </div>
    </div>
);

interface MenuItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    last?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ to, icon, label, last }) => (
    <Link
        to={to}
        style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.875rem 1.25rem', textDecoration: 'none', color: '#1e293b',
            borderBottom: last ? 'none' : '1px solid #f1f5f9',
            transition: 'background 0.15s'
        }}
    >
        <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
        </div>
        <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
        <ChevronRight size={16} color="#94a3b8" />
    </Link>
);

export default Menu;
