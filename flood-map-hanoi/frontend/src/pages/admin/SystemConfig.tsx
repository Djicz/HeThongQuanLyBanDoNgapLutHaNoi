import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Settings, Save, Loader, ShieldAlert, Clock, ShieldX } from 'lucide-react';

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
        <div className="mobile-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', color: '#1f2937' }}>
                    <Settings className="text-primary" size={32} /> 
                    Cấu hình hệ thống
                </h2>
                <Link to="/admin/dashboard" className="btn btn-outline" style={{ textDecoration: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem' }}>Về Dashboard</Link>
            </div>

            {message && <div className="status-success" style={{ marginBottom: '1.5rem', padding: '1.2rem', background: '#dcfce7', color: '#16a34a', borderLeft: '4px solid #16a34a', borderRadius: '8px', fontWeight: 500 }}>{message}</div>}
            {error && <div className="status-danger" style={{ marginBottom: '1.5rem', padding: '1.2rem', background: '#fee2e2', color: '#dc2626', borderLeft: '4px solid #dc2626', borderRadius: '8px', fontWeight: 500 }}>{error}</div>}

            <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    
                    {/* Bán kính */}
                    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '1rem', borderRadius: '50%', height: 'fit-content' }}>
                            <ShieldAlert size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>
                                Bán kính nhận cảnh báo ngập (mét)
                            </label>
                            <input 
                                type="number" 
                                className="form-control"
                                style={{ width: '100%', maxWidth: '300px', fontSize: '1.1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                value={config.alertRadius}
                                onChange={e => setConfig({...config, alertRadius: Number(e.target.value)})}
                                min="0"
                                step="10"
                                required
                            />
                            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Hệ thống sẽ gửi thông báo cho user nếu họ ở trong bán kính này tính từ điểm ngập.</p>
                        </div>
                    </div>

                    {/* Hết hạn */}
                    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ background: '#fef3c7', color: '#d97706', padding: '1rem', borderRadius: '50%', height: 'fit-content' }}>
                            <Clock size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>
                                Thời gian tự động hết hạn (giờ)
                            </label>
                            <input 
                                type="number" 
                                className="form-control"
                                style={{ width: '100%', maxWidth: '300px', fontSize: '1.1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                value={config.reportExpired}
                                onChange={e => setConfig({...config, reportExpired: Number(e.target.value)})}
                                min="0"
                                required
                            />
                            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Báo cáo cũ quá thời gian này sẽ chuyển sang trạng thái EXPIRED, và Vùng Ngập tương ứng sẽ bị đánh dấu RESOLVED.</p>
                        </div>
                    </div>

                    {/* Xóa tự động */}
                    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '50%', height: 'fit-content' }}>
                            <ShieldX size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>
                                Ngưỡng tự động xóa báo cáo (%)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    style={{ width: '100%', maxWidth: '300px', fontSize: '1.1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={config.autoDeletePercent}
                                    onChange={e => setConfig({...config, autoDeletePercent: Number(e.target.value)})}
                                    min="0"
                                    max="100"
                                    required
                                />
                                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#475569' }}>%</span>
                            </div>
                            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Báo cáo có &ge; 10 lượt đánh giá, nếu tỷ lệ <b>Từ chối</b> &gt; {config.autoDeletePercent}% thì sẽ chuyển sang trạng thái DELETED, và Vùng Ngập tương ứng sẽ bị xóa/đánh dấu RESOLVED.
                            </p>
                        </div>
                    </div>

                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '8px' }}>
                        {saving ? <Loader className="animate-spin" size={22} /> : <Save size={22} />}
                        {saving ? 'Đang lưu cài đặt...' : 'Lưu lại thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SystemConfig;
