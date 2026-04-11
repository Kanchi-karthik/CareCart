import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, Phone, MapPin, Globe, Share2, Search } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const AdminClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ client_id: '', name: '', email: '', phone: '', address: '', city: '', country: '', description: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/clients/');
            const sorted = (res.data || []).sort((a, b) => b.client_id - a.client_id);
            setClients(sorted);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = React.useMemo(() => {
        return (clients || []).filter(c =>
            String(c.client_id).toLowerCase().includes(search.toLowerCase()) ||
            String(c.name).toLowerCase().includes(search.toLowerCase()) ||
            String(c.city).toLowerCase().includes(search.toLowerCase())
        );
    }, [clients, search]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editing) {
                res = await apiClient.put('/clients/', formData);
            } else {
                res = await apiClient.post('/clients/', formData);
            }

            if (res.data.status === 'success') {
                setShowModal(false);
                setEditing(null);
                setFormData({ client_id: '', name: '', email: '', phone: '', address: '', city: '', country: '', description: '' });
                fetchData();
            } else {
                alert("Procurement Error: " + (res.data.message || "Could not register clinical hub."));
            }
        } catch (err) {
            alert("Network Failure: " + (err.response?.data?.message || "Connection to the medical network lost."));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Remove this client organization?")) {
            try {
                await apiClient.delete(`/clients/?id=${id}`);
                fetchData();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const fetchNextId = async () => {
        try {
            const res = await apiClient.get('/clients/?action=next_val');
            setFormData(prev => ({ ...prev, client_id: res.data.next_id }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>Clinical Hubs</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Manage hospital networks and B2B medical procurement clients.</p>
                </div>
                <button onClick={() => {
                    setEditing(null);
                    setFormData({ client_id: '', name: '', email: '', phone: '', address: '', city: '', country: '', description: '' });
                    fetchNextId();
                    setShowModal(true);
                }} className="btn btn-brick" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px' }}>
                    <Plus size={24} /> REGISTER HUB
                </button>
            </div>

            {/* Filter Hub */}
            <div className="filter-hub" style={{ maxWidth: '800px' }}>
                 <div className="search-field">
                    <Search size={20} className="icon" />
                    <input
                        type="text"
                        placeholder="Search Clinical Hub, ID, or City..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Hub Registry Grid */}
            <div className="data-grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>Hub Reference</th>
                            <th>Organization</th>
                            <th>Contact Node</th>
                            <th>Geographic Location</th>
                            <th style={{ textAlign: 'right' }}>Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(c => (
                            <tr key={c.client_id}>
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>#CH-{c.client_id}</code>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ padding: '10px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '12px', color: 'var(--vibrant-blue)' }}>
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '18px', color: 'var(--velvet-dark)' }}>{c.name}</div>
                                            <span className="role-badge client">Medical Hub</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                                            <Mail size={14} className="text-muted" /> {c.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                                            <Phone size={14} className="text-muted" /> {c.phone}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>{c.city}, {c.country}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{c.address}</div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setEditing(c); setFormData(c); setShowModal(true); }} className="btn-icon" style={{ background: '#f8fafc', color: '#64748b' }}><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(c.client_id)} className="btn-icon" style={{ background: '#fff1f2', color: '#be123c' }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>Clinical Hub Registration</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Client ID (Numeric)</label>
                                    <input className="form-input" type="number" value={formData.client_id || ''} onChange={e => setFormData({ ...formData, client_id: e.target.value })} disabled placeholder='Auto-generated' />
                                </div>
                                <div>
                                    <label className="form-label">Organization Name</label>
                                    <input className="form-input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Apollo Victoria Hospital" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Procurement Email</label>
                                    <input className="form-input" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Phone Line</label>
                                    <input className="form-input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>
                            </div>

                            <label className="form-label">Full Address</label>
                            <input className="form-input" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} required />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">City</label>
                                    <input className="form-input" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Country</label>
                                    <input className="form-input" value={formData.country || ''} onChange={e => setFormData({ ...formData, country: e.target.value })} required />
                                </div>
                            </div>

                            <label className="form-label">Operational Description</label>
                            <textarea className="form-input" style={{ height: '80px' }} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} required placeholder="Tell us about this medical hub..." />

                            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, border: '1px solid #eee' }}>CANCEL</button>
                                <button type="submit" className="btn btn-brick" style={{ flex: 2 }}>{editing ? 'UPDATE CLINIC' : 'FINALIZE REGISTRATION'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClients;
