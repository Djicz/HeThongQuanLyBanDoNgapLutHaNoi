import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Unlock, KeyRound, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserManagement: React.FC = () => {
    const { token, isAdmin } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Không thể tải danh sách người dùng');
            const data = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, token]);

    const handleToggleLock = async (userId: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/lock`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchUsers();
            else alert('Lỗi khi khóa/mở khóa');
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleRole = async (userId: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchUsers();
            else alert('Lỗi khi đổi quyền');
        } catch (e) {
            console.error(e);
        }
    };

    const handleResetPassword = async (userId: string) => {
        const newPassword = prompt("Nhập mật khẩu mới cho người dùng này (ít nhất 6 ký tự):");
        if (!newPassword || newPassword.length < 6) {
            alert("Mật khẩu không hợp lệ!");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/reset-password`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ newPassword })
            });
            if (res.ok) alert('Đổi mật khẩu thành công!');
            else alert('Lỗi khi đổi mật khẩu');
        } catch (e) {
            console.error(e);
        }
    };

    if (!isAdmin) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Không có quyền truy cập</h2><Link to="/">Về trang chủ</Link></div>;
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader className="animate-spin" /> Đang tải...</div>;

    return (
        <div className="mobile-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Quản lý người dùng</h2>
            {error && <div className="status-danger">{error}</div>}
            
            <div style={{ overflowX: 'auto', marginTop: '1rem', background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '1rem' }}>Email</th>
                            <th style={{ padding: '1rem' }}>Họ tên</th>
                            <th style={{ padding: '1rem' }}>Vai trò</th>
                            <th style={{ padding: '1rem' }}>Trạng thái</th>
                            <th style={{ padding: '1rem' }}>Uy tín</th>
                            <th style={{ padding: '1rem' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '1rem' }}>{u.email}</td>
                                <td style={{ padding: '1rem' }}>{u.fullName}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '9999px', 
                                        fontSize: '0.875rem',
                                        backgroundColor: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'MOD' ? '#dbeafe' : '#f3f4f6',
                                        color: u.role === 'ADMIN' ? '#92400e' : u.role === 'MOD' ? '#1e40af' : '#374151',
                                        fontWeight: 600
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ color: u.status === 'ACTIVE' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{u.reputationPoint}</td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    {u.role !== 'ADMIN' && (
                                        <>
                                            <button onClick={() => handleToggleRole(u.id)} className="btn btn-outline" title="Cấp/Thu hồi Mod" style={{ padding: '0.5rem' }}>
                                                <Shield size={16} />
                                            </button>
                                            <button onClick={() => handleToggleLock(u.id)} className="btn btn-outline" title="Khóa/Mở khóa" style={{ padding: '0.5rem', color: u.status === 'ACTIVE' ? '#dc2626' : '#16a34a' }}>
                                                {u.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                            <button onClick={() => handleResetPassword(u.id)} className="btn btn-outline" title="Đổi mật khẩu" style={{ padding: '0.5rem' }}>
                                                <KeyRound size={16} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
