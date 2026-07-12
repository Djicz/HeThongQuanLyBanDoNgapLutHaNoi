import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ReportDetailModalProps {
    report: any;
    onClose: () => void;
}

const AddressDisplay: React.FC<{lat: number, lng: number}> = ({lat, lng}) => {
    const [address, setAddress] = useState<string>('Đang tải...');

    useEffect(() => {
        let isMounted = true;
        const fetchAddress = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/public/external/nominatim/reverse?lat=${lat}&lng=${lng}`);
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

    return <span>{address}</span>;
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
    if (!report) return null;

    const proofImage = report.proofs && report.proofs.length > 0 ? report.proofs[0].fileUrl : report.proofImage;
    const imageUrl = proofImage ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${proofImage}` : null;

    const levelColor = report.level === 'HIGH' ? '#dc2626' : report.level === 'MEDIUM' ? '#d97706' : '#16a34a';
    const levelBg = report.level === 'HIGH' ? '#fee2e2' : report.level === 'MEDIUM' ? '#fef3c7' : '#dcfce7';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', backgroundColor: 'white' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#f3f4f6' }}>
                    <X size={20} color="#4b5563" />
                </button>
                
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', color: '#111827' }}>Chi tiết báo cáo</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Trạng thái</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{report.status}</div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Mức độ ngập</div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, backgroundColor: levelBg, color: levelColor, display: 'inline-block' }}>
                        {report.level}
                    </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Vị trí</div>
                    <div style={{ color: '#111827', lineHeight: 1.5 }}>
                        {report.lat && report.lng ? <AddressDisplay lat={report.lat} lng={report.lng} /> : 'Không có tọa độ'}
                    </div>
                </div>

                {report.description && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Mô tả</div>
                        <div style={{ color: '#111827', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.5rem', whiteSpace: 'pre-wrap' }}>
                            {report.description}
                        </div>
                    </div>
                )}

                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Đồng ý</div>
                        <div style={{ color: '#16a34a', fontWeight: 'bold' }}>👍 {report.upvotes || 0}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Phản đối</div>
                        <div style={{ color: '#dc2626', fontWeight: 'bold' }}>👎 {report.downvotes || 0}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Thời gian</div>
                        <div style={{ color: '#111827' }}>{new Date(report.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                </div>

                {imageUrl && (
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Ảnh minh chứng</div>
                        <img src={imageUrl} alt="Proof" style={{ width: '100%', borderRadius: '0.5rem', objectFit: 'contain', maxHeight: '300px', backgroundColor: '#f3f4f6' }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDetailModal;
