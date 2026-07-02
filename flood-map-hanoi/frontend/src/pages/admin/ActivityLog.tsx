import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Loader } from 'lucide-react';

const ActivityLog: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAdmin) {
            fetchLogs();
        }
    }, [isAdmin, token]);

    const fetchLogs = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải nhật ký hoạt động');
            const data = await response.json();
            setLogs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Không có quyền truy cập</h2><Link to="/">Về trang chủ</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div style={{ padding: '6rem 2rem 2rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity /> Nhật ký hoạt động</h2>
                <Link to="/admin/dashboard" className="btn btn-outline" style={{ textDecoration: 'none' }}>Về Dashboard</Link>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>{error}</div>}

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                {logs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Không có lịch sử hoạt động</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem' }}>Thời gian</th>
                                <th style={{ padding: '1rem' }}>Người hành động</th>
                                <th style={{ padding: '1rem' }}>Hành động</th>
                                <th style={{ padding: '1rem' }}>Mô tả chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: any) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#4b5563' }}>
                                        {log.user?.fullName || log.user?.username || log.user?.email || 'N/A'}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: '#374151' }}>
                                        {log.action}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#4b5563' }}>
                                        {log.description}
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

export default ActivityLog;
