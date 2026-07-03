import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, XCircle, Trash2, Loader, Eye, MapPin } from 'lucide-react';

const AddressCell: React.FC<{lat: number, lng: number}> = ({lat, lng}) => {
    const [address, setAddress] = useState<string>('Đang tải...');

    useEffect(() => {
        let isMounted = true;
        const fetchAddress = async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                const data = await res.json();
                if (isMounted) {
                    setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
            } catch (err) {
                if (isMounted) {
                    setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
            }
        };
        fetchAddress();
        return () => { isMounted = false; };
    }, [lat, lng]);

    return (
        <Link to={`/?lat=${lat}&lng=${lng}`} style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} title={address}>
            <MapPin size={14} style={{ flexShrink: 0 }} />
            <span style={{ display: 'inline-block', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {address}
            </span>
        </Link>
    );
};

const ReportManagement: React.FC = () => {
    const { token, user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isModOrAdmin = user?.role === 'MOD' || user?.role === 'ADMIN';

    useEffect(() => {
        if (isModOrAdmin) {
            fetchReports();
        }
    }, [isModOrAdmin, token]);

    const fetchReports = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mod/reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Không thể tải danh sách báo cáo');
            const data = await response.json();
            setReports(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'verify' | 'reject' | 'delete') => {
        if (action === 'delete' && !confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return;
        
        try {
            const method = action === 'delete' ? 'DELETE' : 'PUT';
            let url = `${import.meta.env.VITE_API_URL}/mod/reports/${id}`;
            if (action !== 'delete') {
                url += `/${action}`;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                fetchReports();
            } else {
                const data = await res.json();
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isModOrAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Không có quyền truy cập</h2><Link to="/">Về trang chủ</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div style={{ padding: '6rem 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClipboardList /> Quản lý báo cáo từ người dân</h2>
                <Link to="/mod/zones" className="btn btn-outline" style={{ textDecoration: 'none' }}>Quản lý điểm ngập</Link>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
                {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Chưa có báo cáo nào</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem' }}>Mô tả</th>
                                <th style={{ padding: '1rem' }}>Mức độ</th>
                                <th style={{ padding: '1rem' }}>Trạng thái</th>
                                <th style={{ padding: '1rem' }}>Địa điểm</th>
                                <th style={{ padding: '1rem' }}>Người gửi</th>
                                <th style={{ padding: '1rem' }}>Thời gian</th>
                                <th style={{ padding: '1rem' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>{r.description || 'Không có mô tả'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '9999px', 
                                            fontSize: '0.75rem',
                                            backgroundColor: r.level === 'HIGH' ? '#fee2e2' : r.level === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
                                            color: r.level === 'HIGH' ? '#dc2626' : r.level === 'MEDIUM' ? '#d97706' : '#16a34a'
                                        }}>
                                            {r.level}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                                        {r.status}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {r.lat && r.lng ? (
                                            <AddressCell lat={r.lat} lng={r.lng} />
                                        ) : 'N/A'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{r.user?.email || 'N/A'}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {r.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleAction(r.id, 'verify')} className="btn btn-outline" style={{ padding: '0.5rem', color: '#16a34a', borderColor: '#bbf7d0' }} title="Duyệt">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button onClick={() => handleAction(r.id, 'reject')} className="btn btn-outline" style={{ padding: '0.5rem', color: '#d97706', borderColor: '#fde68a' }} title="Từ chối">
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {r.status !== 'DELETED' && (
                                                <button onClick={() => handleAction(r.id, 'delete')} className="btn btn-outline" style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }} title="Xóa">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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

export default ReportManagement;
