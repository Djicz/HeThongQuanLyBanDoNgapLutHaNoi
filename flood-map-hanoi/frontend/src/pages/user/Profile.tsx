import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User as UserIcon, Star, Mail, Loader, ClipboardList, Shield } from 'lucide-react';

const Profile: React.FC = () => {
    const { token, user: authUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authUser) {
            fetchProfile();
        }
    }, [authUser, token]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải thông tin cá nhân');
            const data = await response.json();
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!authUser) {
        return (
            <div className="mobile-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
                <h2>Vui lòng đăng nhập</h2>
                <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Đăng nhập</Link>
            </div>
        );
    }

    if (loading) return (
        <div className="mobile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
            <Loader className="animate-spin" size={36} color="#2563eb" />
        </div>
    );

    const initial = profile?.fullName?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="mobile-page">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={22} color="#2563eb" />
                </div>
                <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Ho so ca nhan</h1>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.875rem', borderRadius: '12px', marginBottom: '1rem', borderLeft: '4px solid #ef4444' }}>{error}</div>}

            {profile && (
                <>
                    <div style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem',
                        display: 'flex', alignItems: 'center', gap: '1rem', color: 'white',
                        boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', fontWeight: 700,
                            border: '2px solid rgba(255,255,255,0.4)'
                        }}>{initial}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{profile.fullName}</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                <Mail size={13} /> {profile.email}
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '99px',
                                padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 600
                            }}>
                                <Shield size={12} /> {authUser?.role === 'ADMIN' ? 'Quan tri vien' : authUser?.role === 'MOD' ? 'Kiem duyet vien' : 'Nguoi dung'}
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Star size={22} color="#d97706" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Diem uy tin</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1f2937' }}>{profile.reputationPoint}</div>
                            </div>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default Profile;
