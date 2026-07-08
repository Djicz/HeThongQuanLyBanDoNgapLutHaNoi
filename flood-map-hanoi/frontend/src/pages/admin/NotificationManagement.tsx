import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, Plus, Trash2, Loader, Save, X } from 'lucide-react';

const NotificationManagement: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '', type: 'GENERAL' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchNotifications();
        }
    }, [isAdmin, token]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải thông báo');
            const data = await response.json();
            setNotifications(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/notifications`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Lỗi khi tạo thông báo');
            
            setShowForm(false);
            setFormData({ title: '', message: '', type: 'GENERAL' });
            fetchNotifications();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchNotifications();
            else alert('Lỗi khi xóa');
        } catch (e) {
            console.error(e);
        }
    };

    if (!isAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Không có quyền truy cập</h2><Link to="/">Về trang chủ</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div className="mobile-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Bell /> Quản lý thông báo</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Hủy' : 'Tạo mới'}
                    </button>
                    <Link to="/admin/dashboard" className="btn btn-outline" style={{ textDecoration: 'none' }}>Về Dashboard</Link>
                </div>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>{error}</div>}

            {showForm && (
                <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0 }}>Tạo thông báo mới</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tiêu đề</label>
                        <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nội dung</label>
                        <textarea className="form-control" rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Gửi thông báo
                    </button>
                </form>
            )}

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Không có thông báo nào</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem' }}>Tiêu đề</th>
                                <th style={{ padding: '1rem' }}>Nội dung</th>
                                <th style={{ padding: '1rem' }}>Thời gian</th>
                                <th style={{ padding: '1rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((notif: any) => (
                                <tr key={notif.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{notif.title}</td>
                                    <td style={{ padding: '1rem' }}>{notif.message}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleDelete(notif.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fee2e2' }}>
                                            <Trash2 size={16} />
                                        </button>
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

export default NotificationManagement;
