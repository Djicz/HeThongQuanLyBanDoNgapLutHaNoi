import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Map, Trash2, Loader, ArrowLeft, Navigation } from 'lucide-react';

const SavedRoutes: React.FC = () => {
    const { token, user } = useAuth();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchRoutes();
        }
    }, [user, token]);

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/routes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải danh sách lộ trình');
            const data = await response.json();
            setRoutes(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lộ trình này?')) return;
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/routes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                fetchRoutes();
            } else {
                const data = await res.json();
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!user) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Vui lòng đăng nhập</h2><Link to="/login">Đăng nhập</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div className="mobile-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Về bản đồ
                </Link>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Map /> Lộ trình đã lưu
                </h2>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                {routes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Bạn chưa lưu lộ trình nào.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {routes.map(r => (
                            <div key={r.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', position: 'relative' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Navigation size={18} color="#2563eb" /> {r.name || 'Lộ trình không tên'}
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                                    <div>Từ: {r.startPointJson}</div>
                                    <div>Đến: {r.endPointJson}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Lưu lúc: {new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                    <button onClick={() => handleDelete(r.id)} className="btn btn-outline" style={{ padding: '0.4rem', color: '#dc2626', borderColor: '#fecaca' }} title="Xóa">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedRoutes;
