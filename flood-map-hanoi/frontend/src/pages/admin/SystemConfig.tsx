import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Settings, Save, Loader } from 'lucide-react';

const SystemConfig: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [config, setConfig] = useState({
        alertRadius: 500,
        reportExpired: 24,
        autoDeletePercent: 70
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAdmin) {
            fetchConfig();
        }
    }, [isAdmin, token]);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải cấu hình');
            const data = await response.json();
            setConfig(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/config`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage(data.message || 'Lưu cấu hình thành công!');
            } else {
                setError(data.message || 'Lỗi khi lưu cấu hình');
            }
        } catch (err: any) {
            setError('Lỗi kết nối máy chủ');
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Không có quyền truy cập</h2><Link to="/">Về trang chủ</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div style={{ padding: '6rem 2rem 2rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings /> Cấu hình hệ thống</h2>
                <Link to="/admin/dashboard" className="btn btn-outline" style={{ textDecoration: 'none' }}>Về Dashboard</Link>
            </div>

            {message && <div className="status-success" style={{ marginBottom: '1rem', padding: '1rem', background: '#dcfce7', color: '#16a34a', borderRadius: '8px' }}>{message}</div>}
            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>{error}</div>}

            <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Bán kính nhận cảnh báo ngập (mét)
                    </label>
                    <input 
                        type="number" 
                        className="form-control"
                        value={config.alertRadius}
                        onChange={e => setConfig({...config, alertRadius: Number(e.target.value)})}
                        min="0"
                        step="10"
                        required
                    />
                    <small style={{ color: '#6b7280' }}>Hệ thống sẽ gửi thông báo cho user nếu họ ở trong bán kính này tính từ điểm ngập.</small>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Thời gian báo cáo tự động hết hạn (giờ)
                    </label>
                    <input 
                        type="number" 
                        className="form-control"
                        value={config.reportExpired}
                        onChange={e => setConfig({...config, reportExpired: Number(e.target.value)})}
                        min="0"
                        required
                    />
                    <small style={{ color: '#6b7280' }}>Sau khoảng thời gian này, báo cáo sẽ chuyển sang trạng thái EXPIRED.</small>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Ngưỡng tự động xóa báo cáo giả mạo (%)
                    </label>
                    <input 
                        type="number" 
                        className="form-control"
                        value={config.autoDeletePercent}
                        onChange={e => setConfig({...config, autoDeletePercent: Number(e.target.value)})}
                        min="0"
                        max="100"
                        required
                    />
                    <small style={{ color: '#6b7280' }}>Ví dụ: 70%. Nếu số lượt phủ nhận chiếm &gt; 70% tổng số vote (với số lượng vote đủ lớn), báo cáo sẽ tự xóa.</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                    {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
            </form>
        </div>
    );
};

export default SystemConfig;
