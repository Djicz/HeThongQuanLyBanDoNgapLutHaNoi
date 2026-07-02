import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, Eye, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#ff7300'];

const Dashboard: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [districtData, setDistrictData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin, token]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, districtRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/reports-by-district`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!statsRes.ok || !districtRes.ok) throw new Error('Không thể tải dữ liệu thống kê');

            const statsData = await statsRes.json();
            const districtJson = await districtRes.json();

            setStats(statsData);
            setDistrictData(districtJson);
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
        <div style={{ padding: '6rem 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Thống kê hệ thống</h2>
                <Link to="/admin/users" className="btn btn-outline" style={{ textDecoration: 'none' }}>Quản lý người dùng</Link>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '50%', color: '#2563eb' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontWeight: 500 }}>Tổng User</p>
                        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#1f2937' }}>{stats?.totalUsers || 0}</h3>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontWeight: 500 }}>Tổng Báo Cáo Ngập</p>
                        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#1f2937' }}>{stats?.totalReports || 0}</h3>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
                        <Eye size={32} />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#6b7280', fontWeight: 500 }}>Lượt truy cập hệ thống</p>
                        <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#1f2937' }}>{stats?.totalVisits || 0}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#374151' }}>Số báo cáo theo Quận/Huyện</h3>
                    {districtData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={districtData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Số lượng báo cáo" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Chưa có dữ liệu báo cáo ngập</div>
                    )}
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#374151' }}>Tỷ lệ ngập theo khu vực</h3>
                    {districtData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={districtData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {districtData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Chưa có dữ liệu</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
