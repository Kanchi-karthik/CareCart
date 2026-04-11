import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Filter, Shield, UserCheck, UserX, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [formData, setFormData] = useState({ user_id: '', username: '', password: '', role: 'BUYER', status: 'ACTIVE' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/users/');
            const sorted = (res.data || []).sort((a, b) => b.user_id.localeCompare(a.user_id, undefined, { numeric: true, sensitivity: 'base' }));
            setUsers(sorted);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = React.useMemo(() => {
        return (users || []).filter(u => {
            const matchesSearch =
                String(u.user_id).toLowerCase().includes(search.toLowerCase()) ||
                String(u.username).toLowerCase().includes(search.toLowerCase());

            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await apiClient.put('/admin/users/', formData);
            } else {
                await apiClient.post('/admin/users/', formData);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ user_id: '', username: '', password: '', role: 'BUYER', status: 'ACTIVE' });
            fetchUsers();
        } catch (err) {
            alert("Operation failed: " + (err.response?.data?.message || "Verify your administrative privileges."));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this user account? This will remove all linked data.")) {
            try {
                const res = await apiClient.delete(`/admin/users/?id=${id}`);
                if (res.data.status === 'success') {
                    fetchUsers();
                } else {
                    alert("Restriction: " + (res.data.message || "Cannot delete user with active transaction history."));
                }
            } catch (err) {
                alert("Comm-link Fault: Backend unreachable.");
            }
        }
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setFormData(user);
        setShowModal(true);
    };

    const fetchNextId = async () => {
        try {
            const res = await apiClient.get('/admin/users/?action=next_val');
            setFormData(prev => ({ ...prev, user_id: res.data.next_id }));
        } catch (err) {
            console.error(err);
        }
    };

    const stats = React.useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        suspended: users.filter(u => u.status === 'SUSPENDED').length,
        admins: users.filter(u => u.role === 'ADMIN').length
    }), [users]);

    return (
        <div className="page-transition">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>User Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Manage all <span style={{ color: 'var(--velvet-brick)' }}>CareCart</span> user accounts and roles.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => {
                        setEditingUser(null);
                        setFormData({ user_id: '', username: '', password: '', role: 'BUYER', status: 'ACTIVE' });
                        fetchNextId();
                        setShowModal(true);
                    }} className="btn btn-brick" style={{ height: 'fit-content', display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 40px', borderRadius: '20px' }}>
                        <Plus size={26} /> ADD NEW USER
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
                {[
                    { label: 'TOTAL USERS', value: stats.total, color: 'var(--velvet-brick)', icon: Users },
                    { label: 'ACTIVE USERS', value: stats.active, color: '#27ae60', icon: UserCheck },
                    { label: 'SUSPENDED', value: stats.suspended, color: '#e74c3c', icon: UserX },
                    { label: 'ADMINS', value: stats.admins, color: 'var(--vibrant-gold)', icon: Shield },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '2px solid #f1f5f9' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="filter-hub">
                 <div className="search-field">
                    <Search size={20} className="icon" />
                    <input
                        type="text"
                        placeholder="Search by ID or Username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="form-input" style={{ marginBottom: 0, width: '180px', borderRadius: '15px', fontWeight: '800', background: 'white' }}>
                        <option value="ALL">All System Roles</option>
                        <option value="ADMIN">System Administrator</option>
                        <option value="SELLER">Pharmaceutical Seller</option>
                        <option value="BUYER">Healthcare Buyer</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ marginBottom: 0, width: '180px', borderRadius: '15px', fontWeight: '800', background: 'white' }}>
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Authorized</option>
                        <option value="SUSPENDED">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Identity Grid */}
            <div className="data-grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.user_id} onClick={() => {
                                let type = u.role.toLowerCase();
                                if (type !== 'admin') {
                                    // Normally we'd use the profile_id, but profile view handles its own lookup
                                    // For now, many profile views are secondary. Let's try to pass the ID.
                                    navigate(`/app/admin/profile/${type}/${u.user_id}`);
                                }
                            }} style={{ cursor: u.role !== 'ADMIN' ? 'pointer' : 'default' }} className="row-hover">
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>#{u.user_id}</code>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--velvet-brick)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                                            {u.username && u.username[0] ? u.username[0].toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '18px', color: 'var(--velvet-dark)' }}>{u.username}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>User ID: {u.user_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${u.role.toLowerCase()}`}>
                                        <Shield size={12} />
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                        padding: '8px 16px', borderRadius: '30px',
                                        background: u.status === 'ACTIVE' ? '#ecfdf5' : '#fff1f2',
                                        color: u.status === 'ACTIVE' ? '#059669' : '#e11d48',
                                        fontSize: '11px', fontWeight: '900'
                                    }}>
                                        {u.status === 'ACTIVE' ? <UserCheck size={14} /> : <UserX size={14} />}
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button onClick={(e) => { e.stopPropagation(); openEdit(u); }} className="btn-icon" style={{ background: '#f8fafc', color: '#64748b' }}><Edit2 size={18} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(u.user_id); }} className="btn-icon" style={{ background: '#fff1f2', color: '#be123c' }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px', background: 'white' }}>
                         <Users size={48} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                         <p style={{ fontWeight: '800', color: '#94a3b8' }}>No users found matching your search.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '600px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>{editingUser ? 'Edit' : 'New'} Account</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">User ID</label>
                                    <input className="form-input" value={formData.user_id} disabled placeholder="Auto-generated" />
                                </div>
                                <div>
                                    <label className="form-label">Username</label>
                                    <input className="form-input" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} required placeholder="Enter login name" />
                                </div>
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="form-label">Password</label>
                                    <input className="form-input" type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label className="form-label">System Role</label>
                                    <select className="form-input" value={formData.role || 'BUYER'} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="ADMIN">System Administrator</option>
                                        <option value="SELLER">Pharmaceutical Seller</option>
                                        <option value="BUYER">Healthcare Buyer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Account Status</label>
                                    <select className="form-input" value={formData.status || 'ACTIVE'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="ACTIVE">Allow Access</option>
                                        <option value="SUSPENDED">Block Access</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, border: '1px solid #eee' }}>CANCEL</button>
                                <button type="submit" className="btn btn-brick" style={{ flex: 2 }}>{editingUser ? 'SAVE CHANGES' : 'CREATE USER'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
