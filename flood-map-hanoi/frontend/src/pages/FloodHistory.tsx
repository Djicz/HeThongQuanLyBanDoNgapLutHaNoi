import React, { useState, useEffect } from 'react';
import { History, MapPin, Loader, Droplets, Calendar, BarChart3 } from 'lucide-react';

const FloodHistory: React.FC = () => {
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [addresses, setAddresses] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/history`);
                if (!response.ok) throw new Error('Không thể tải lịch sử điểm ngập');
                const data = await response.json();
                setHistoryData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredData = filterLevel
        ? historyData.filter(h => h.level === filterLevel)
        : historyData;

    useEffect(() => {
        if (historyData.length === 0) return;

        let isMounted = true;
        const fetchAddresses = async () => {
            const newAddresses = { ...addresses };
            for (const item of historyData) {
                if (!item.lat || !item.lng) continue;
                if (newAddresses[item.id]) continue; // already fetched

                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/public/external/nominatim/reverse?lat=${item.lat}&lng=${item.lng}`);
                    const data = await response.json();
                    
                    if (data && (data.address || data.display_name)) {
                        const street = data.display_name || (data.address && (data.address.road || data.address.pedestrian || data.address.path || data.address.suburb));
                        newAddresses[item.id] = street;
                        if (isMounted) {
                            setAddresses({ ...newAddresses });
                        }
                    }
                } catch (err) {
                    console.error("Lỗi khi lấy tên đường:", err);
                }
                
                // Delay to respect Nominatim usage policy (1 request per second)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (!isMounted) break;
            }
        };

        fetchAddresses();

        return () => {
            isMounted = false;
        };
    }, [historyData]);

    return (
        <div className="mobile-page">
            {/* Mobile header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <History size={22} color="#0284c7" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Lịch sử điểm ngập</h1>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Hà Nội</p>
                </div>
            </div>

            {error && (
                <div style={{ 
                    background: '#fef2f2', color: '#991b1b',
                    padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1rem',
                    borderLeft: '4px solid #ef4444', fontSize: '0.9rem'
                }}>
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            {/* Stats + filter bar */}
            <div style={{ 
                background: 'white', borderRadius: '14px', padding: '1rem',
                marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={18} color="#0284c7" />
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{filteredData.length} khu vực ngập</span>
                    </div>
                </div>
                <select 
                    style={{ 
                        width: '100%', padding: '0.625rem 1rem', borderRadius: '10px',
                        border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b',
                        fontWeight: 500, outline: 'none', fontSize: '0.9rem'
                    }}
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                >
                    <option value="">🌟 Tất cả mức độ</option>
                    <option value="LOW">🟢 Nhẹ (LOW)</option>
                    <option value="MEDIUM">🟠 Trung bình (MEDIUM)</option>
                    <option value="HIGH">🔴 Nghiêm trọng (HIGH)</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <Loader className="animate-spin" size={36} style={{ margin: '0 auto 1rem', color: '#0ea5e9', display: 'block' }} />
                    <p style={{ color: '#64748b' }}>Đang tải dữ liệu lịch sử...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {filteredData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '14px', color: '#64748b' }}>
                            <Droplets size={40} style={{ margin: '0 auto 1rem', opacity: 0.4, display: 'block' }} />
                            Không tìm thấy dữ liệu phù hợp.
                        </div>
                    ) : (
                        filteredData.map((item, index) => (
                            <div key={item.id || index} style={{ 
                                background: 'white', borderRadius: '14px', overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                            }}>
                                <div style={{ height: '3px', background: item.level === 'HIGH' ? '#ef4444' : item.level === 'MEDIUM' ? '#f59e0b' : '#10b981' }} />
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: 600 }}>
                                            <MapPin size={16} color="#3b82f6" />
                                            {addresses[item.id] ? addresses[item.id] : <Loader className="animate-spin" size={14} style={{ display: 'inline' }} />}
                                        </div>
                                        <span style={{ 
                                            padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                                            backgroundColor: item.level === 'HIGH' ? '#fef2f2' : item.level === 'MEDIUM' ? '#fffbeb' : '#ecfdf5',
                                            color: item.level === 'HIGH' ? '#dc2626' : item.level === 'MEDIUM' ? '#d97706' : '#059669'
                                        }}>{item.level}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Droplets size={13} /> {item.floodCount} lần ngập
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={13} /> {new Date(item.lastUpdate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FloodHistory;
