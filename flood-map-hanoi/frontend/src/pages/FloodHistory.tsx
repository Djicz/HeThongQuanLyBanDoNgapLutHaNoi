import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, MapPin, ArrowLeft, Loader, Droplets, Calendar, BarChart3 } from 'lucide-react';

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
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${item.lat}&lon=${item.lng}`);
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const street = data.address.road || data.address.pedestrian || data.address.path || data.address.suburb || data.display_name;
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
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', 
            padding: '6rem 2rem 4rem 2rem' 
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', gap: '1.5rem' }}>
                    <Link to="/" style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        textDecoration: 'none', color: '#1e293b', 
                        padding: '0.75rem 1.25rem', background: 'rgba(255, 255, 255, 0.7)', 
                        backdropFilter: 'blur(10px)', borderRadius: '12px',
                        fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <ArrowLeft size={18} /> Quay lại bản đồ
                    </Link>
                    <h2 style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', 
                        margin: 0, fontSize: '2rem', color: '#0f172a',
                        fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <History size={32} color="#0284c7" /> Lịch sử điểm ngập
                    </h2>
                </div>

                {error && (
                    <div style={{ 
                        background: 'rgba(254, 226, 226, 0.9)', color: '#991b1b',
                        padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem',
                        borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)'
                    }}>
                        <strong>Lỗi:</strong> {error}
                    </div>
                )}

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(16px)',
                    padding: '1.5rem 2rem', borderRadius: '16px', marginBottom: '2.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.8)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            background: '#e0f2fe', padding: '0.75rem', borderRadius: '12px', color: '#0284c7'
                        }}>
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Thống kê tổng quan</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Tổng số {filteredData.length} khu vực ngập được ghi nhận</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label style={{ fontWeight: 600, color: '#475569' }}>Lọc theo mức độ:</label>
                        <select 
                            style={{ 
                                padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1',
                                background: 'white', color: '#1e293b', fontWeight: 500,
                                outline: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
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
                </div>

                {loading ? (
                    <div style={{ 
                        textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.5)',
                        borderRadius: '24px', backdropFilter: 'blur(10px)'
                    }}>
                        <Loader className="animate-spin" size={48} style={{ margin: '0 auto 1.5rem', color: '#0ea5e9' }} />
                        <p style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 500 }}>Đang phân tích dữ liệu lịch sử...</p>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' 
                    }}>
                        {filteredData.length === 0 ? (
                            <div style={{ 
                                gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', 
                                background: 'rgba(255,255,255,0.7)', borderRadius: '24px',
                                color: '#64748b', fontSize: '1.1rem'
                            }}>
                                <Droplets size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                Không tìm thấy dữ liệu điểm ngập nào phù hợp với bộ lọc.
                            </div>
                        ) : (
                            filteredData.map((item, index) => (
                                <div key={item.id || index} style={{ 
                                    background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
                                    padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.6)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'default', position: 'relative', overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
                                }}
                                >
                                    <div style={{ 
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                                        background: item.level === 'HIGH' ? '#ef4444' : item.level === 'MEDIUM' ? '#f59e0b' : '#10b981'
                                    }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontWeight: 700 }}>
                                            <div style={{ 
                                                background: '#f1f5f9', padding: '0.5rem', borderRadius: '10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <MapPin size={20} color="#3b82f6" /> 
                                            </div>
                                            Khu vực ngập
                                        </h3>
                                        <span style={{ 
                                            padding: '0.35rem 0.85rem', 
                                            borderRadius: '9999px', 
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            backgroundColor: item.level === 'HIGH' ? '#fef2f2' : item.level === 'MEDIUM' ? '#fffbeb' : '#ecfdf5',
                                            color: item.level === 'HIGH' ? '#dc2626' : item.level === 'MEDIUM' ? '#d97706' : '#059669',
                                            border: `1px solid ${item.level === 'HIGH' ? '#fecaca' : item.level === 'MEDIUM' ? '#fde68a' : '#a7f3d0'}`
                                        }}>
                                            {item.level}
                                        </span>
                                    </div>
                                    
                                    <p style={{ 
                                        margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.95rem',
                                        lineHeight: '1.5', flex: 1
                                    }}>
                                        <span style={{ fontWeight: 600 }}>Tuyến đường: </span>
                                        {addresses[item.id] ? addresses[item.id] : <Loader className="animate-spin" size={14} style={{ display: 'inline' }} />}
                                    </p>
                                    
                                    <div style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                        background: '#f8fafc', padding: '1rem', borderRadius: '12px',
                                        border: '1px solid #f1f5f9'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Droplets size={14} /> Số lần ngập
                                            </span>
                                            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a' }}>
                                                {item.floodCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>lần</span>
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                <Calendar size={14} /> Cập nhật cuối
                                            </span>
                                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
                                                {new Date(item.lastUpdate).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloodHistory;
