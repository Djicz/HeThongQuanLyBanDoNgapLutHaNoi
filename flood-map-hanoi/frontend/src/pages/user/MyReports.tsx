import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Trash2, Loader, ArrowLeft, Plus, MapPin, Upload } from 'lucide-react';
import { useMapState } from '../../context/MapContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

function LocationPicker({ onLocationSelect, initialLat, initialLng }: { onLocationSelect: (lat: number, lng: number) => void, initialLat: number, initialLng: number }) {
    const [pos, setPos] = useState<L.LatLng | null>(initialLat ? new L.LatLng(initialLat, initialLng) : null);
    
    useMapEvents({
        click(e) {
            setPos(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
    });

    return pos ? <Marker position={pos} /> : null;
}

const MyReports: React.FC = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [formData, setFormData] = useState({ lat: 21.0285, lng: 105.8542, level: 'MEDIUM', description: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [address, setAddress] = useState('');

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            setAddress('Đang tải địa chỉ...');
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            setAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } catch (err) {
            setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
    };

    useEffect(() => {
        if (showForm) {
            fetchAddress(formData.lat, formData.lng);
        }
    }, [formData.lat, formData.lng, showForm]);

    const handleCreateNewReport = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }))
            );
        }
        setShowForm(true);
    };

    const handleMapLocationSelect = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, lat, lng }));
        setShowMap(false);
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('lat', formData.lat.toString());
            fd.append('lng', formData.lng.toString());
            fd.append('level', formData.level);
            fd.append('description', formData.description);
            if (imageFile) {
                fd.append('image', imageFile);
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/flood-reports`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (res.ok) {
                alert('Gửi báo cáo thành công!');
                setShowForm(false);
                setImageFile(null);
                setFormData({ lat: 21.0285, lng: 105.8542, level: 'MEDIUM', description: '' });
                fetchMyReports();
            } else {
                alert('Có lỗi xảy ra');
            }
        } catch (err) {
            alert('Lỗi kết nối tới máy chủ');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyReports();
        }
    }, [user, token]);

    const fetchMyReports = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user/reports`, {
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

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return;
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/reports/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                fetchMyReports();
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
        <div style={{ padding: '6rem 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Về bản đồ
                    </Link>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <ClipboardList /> Báo cáo của tôi
                    </h2>
                </div>
                <button onClick={handleCreateNewReport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Thêm báo cáo mới
                </button>
            </div>

            {error && <div className="status-danger" style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>{error}</div>}

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
                {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Bạn chưa có báo cáo nào.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem' }}>Mô tả</th>
                                <th style={{ padding: '1rem' }}>Mức độ</th>
                                <th style={{ padding: '1rem' }}>Trạng thái</th>
                                <th style={{ padding: '1rem' }}>Đồng ý</th>
                                <th style={{ padding: '1rem' }}>Từ chối</th>
                                <th style={{ padding: '1rem' }}>Thời gian tạo</th>
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
                                        {r.status === 'PENDING' ? 'Đang chờ' : r.status === 'VERIFIED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Bị từ chối' : r.status}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 'bold' }}>{r.upvotes || 0}</td>
                                    <td style={{ padding: '1rem', color: '#dc2626', fontWeight: 'bold' }}>{r.downvotes || 0}</td>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {r.status !== 'DELETED' && (
                                            <button onClick={() => handleDelete(r.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }} title="Xóa">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showForm && !showMap && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Thêm báo cáo mới</h3>
                        <form onSubmit={handleSubmitReport}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vị trí / Tọa độ</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" readOnly value={address || `${formData.lat.toFixed(6)}, ${formData.lng.toFixed(6)}`} className="form-control" style={{ flex: 1, backgroundColor: '#f3f4f6' }} title={`${formData.lat.toFixed(6)}, ${formData.lng.toFixed(6)}`} />
                                    <button type="button" onClick={() => setShowMap(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                                        <MapPin size={16} /> Chọn trên bản đồ
                                    </button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mức độ ngập</label>
                                <select className="form-control" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}>
                                    <option value="LOW">Thấp</option>
                                    <option value="MEDIUM">Trung bình</option>
                                    <option value="HIGH">Nghiêm trọng</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Mô tả</label>
                                <textarea className="form-control" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Ngập do mưa lớn, tắc cống..."></textarea>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ảnh minh chứng</label>
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="form-control" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Hủy</button>
                                <button type="submit" disabled={submitting} className="btn btn-primary">
                                    {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMap && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Click trên bản đồ để chọn vị trí</h3>
                        <button onClick={() => setShowMap(false)} className="btn btn-outline">Đóng</button>
                    </div>
                    <div style={{ flex: 1 }}>
                        <MapContainer center={[formData.lat || 21.0285, formData.lng || 105.8542]} zoom={14} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationPicker onLocationSelect={handleMapLocationSelect} initialLat={formData.lat} initialLng={formData.lng} />
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReports;
