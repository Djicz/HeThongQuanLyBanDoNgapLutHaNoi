import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User as UserIcon, Star, Mail, ArrowLeft, Loader, ClipboardList } from 'lucide-react';

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
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Vui lòng đăng nhập</h2><Link to="/login">Đăng nhập</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div style={{ padding: '6rem 2rem 2rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Về bản đồ
                </Link>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <UserIcon /> Hồ sơ cá nhân
                </h2>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

            {profile && (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '2rem', marginBottom: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                            {profile.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{profile.fullName}</h3>
                            <p style={{ margin: 0, color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} /> {profile.email}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                            <Star size={32} color="#d97706" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.25rem' }}>Điểm uy tín</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{profile.reputationPoint}</div>
                        </div>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                            <ClipboardList size={32} color="#2563eb" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.25rem' }}>Quản lý báo cáo</div>
                            <Link to="/user/reports" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>Xem báo cáo</Link>
                        </div>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                            <ClipboardList size={32} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                            <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.25rem' }}>Lộ trình đã lưu</div>
                            <Link to="/user/routes" className="btn btn-outline" style={{ marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>Xem lộ trình</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
