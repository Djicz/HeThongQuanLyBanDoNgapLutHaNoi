import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Map, Edit2, Trash2, Loader, Save, X } from 'lucide-react';

const FloodPointManagement: React.FC = () => {
    const { token, user } = useAuth();
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingZone, setEditingZone] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const isModOrAdmin = user?.role === 'MOD' || user?.role === 'ADMIN';

    useEffect(() => {
        if (isModOrAdmin) {
            fetchZones();
            const interval = setInterval(fetchZones, 1000);
            return () => clearInterval(interval);
        }
    }, [isModOrAdmin, token]);

    const fetchZones = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mod/zones`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải danh sách vùng ngập');
            const data = await response.json();
            setZones(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingZone) return;
        setSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mod/zones/${editingZone.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingZone)
            });
            if (!response.ok) throw new Error('Lỗi khi cập nhật vùng ngập');

            setEditingZone(null);
            fetchZones();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa điểm ngập này? (Nước đã rút?)')) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mod/zones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchZones();
            else alert('Lỗi khi xóa');
        } catch (e) {
            console.error(e);
        }
    };

    if (!isModOrAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Không có quyền truy cập</h2><Link to="/">Về trang chủ</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div className="mobile-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Map /> Quản lý Vùng Ngập Lụt</h2>
                <Link to="/mod/reports" className="btn btn-outline" style={{ textDecoration: 'none' }}>Kiểm duyệt báo cáo</Link>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

            {editingZone && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleUpdate} className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Cập nhật điểm ngập</h3>
                            <button type="button" onClick={() => setEditingZone(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mức độ ngập</label>
                            <select className="form-control" value={editingZone.level} onChange={e => setEditingZone({ ...editingZone, level: e.target.value })}>
                                <option value="LOW">Nhẹ (LOW)</option>
                                <option value="MEDIUM">Trung bình (MEDIUM)</option>
                                <option value="HIGH">Nặng (HIGH)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mô tả</label>
                            <textarea className="form-control" rows={3} value={editingZone.description || ''} onChange={e => setEditingZone({ ...editingZone, description: e.target.value })}></textarea>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Trạng thái</label>
                            <select className="form-control" value={editingZone.status} onChange={e => setEditingZone({ ...editingZone, status: e.target.value })}>
                                <option value="ACTIVE">Đang ngập (ACTIVE)</option>
                                <option value="RESOLVED">Đã rút (RESOLVED)</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Lưu thay đổi
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
                {zones.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Không có điểm ngập nào trên hệ thống</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem' }}>Mô tả</th>
                                <th style={{ padding: '1rem' }}>Bán kính (m)</th>
                                <th style={{ padding: '1rem' }}>Mức độ</th>
                                <th style={{ padding: '1rem' }}>Trạng thái</th>
                                <th style={{ padding: '1rem' }}>Cập nhật lần cuối</th>
                                <th style={{ padding: '1rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map(z => (
                                <tr key={z.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{z.description || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{z.radius}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            backgroundColor: z.level === 'HIGH' ? '#fee2e2' : z.level === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
                                            color: z.level === 'HIGH' ? '#dc2626' : z.level === 'MEDIUM' ? '#d97706' : '#16a34a'
                                        }}>
                                            {z.level}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: z.status === 'ACTIVE' ? '#dc2626' : '#16a34a' }}>
                                        {z.status}
                                    </td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                        {new Date(z.updatedAt || z.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setEditingZone(z)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#2563eb', borderColor: '#bfdbfe' }} title="Cập nhật">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(z.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }} title="Xóa">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FloodPointManagement;
