import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, MapPin, Globe, Search } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const AdminRetailers = () => {
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ retailer_id: '', name: '', email: '', phone: '', location: '', description: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/retailers/');
            const sorted = (res.data || []).sort((a, b) => b.retailer_id.localeCompare(a.retailer_id, undefined, { numeric: true, sensitivity: 'base' }));
            setRetailers(sorted);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRetailers = React.useMemo(() => {
        return (retailers || []).filter(r =>
            String(r.retailer_id).toLowerCase().includes(search.toLowerCase()) ||
            String(r.name).toLowerCase().includes(search.toLowerCase()) ||
            String(r.location).toLowerCase().includes(search.toLowerCase())
        );
    }, [retailers, search]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editing) {
                res = await apiClient.put('/retailers/', formData);
            } else {
                res = await apiClient.post('/retailers/', formData);
            }

            if (res.data.status === 'success') {
                setShowModal(false);
                setEditing(null);
                setFormData({ retailer_id: '', name: '', email: '', phone: '', location: '', description: '' });
                fetchData();
            } else {
                alert("Operation Blocked: " + (res.data.message || "Unknown error"));
            }
        } catch (err) {
            alert("System Error: " + (err.response?.data?.message || "Could not connect to the recruitment hub."));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this retailer?")) {
            try {
                await apiClient.delete(`/retailers/?id=${id}`);
                fetchData();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const fetchNextId = async () => {
        try {
            const res = await apiClient.get('/retailers/?action=next_val');
            setFormData(prev => ({ ...prev, retailer_id: res.data.next_id }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>Main Suppliers</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Manage the wholesale companies that supply medicines to shops.</p>
                </div>
                <button onClick={() => {
                    setEditing(null);
                    setFormData({ retailer_id: '', name: '', email: '', phone: '', location: '', description: '' });
                    fetchNextId();
                    setShowModal(true);
                }} className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px' }}>
                    <Plus size={24} /> REGISTER SUPPLIER
                </button>
            </div>

            {/* Filter Hub */}
            <div className="filter-hub" style={{ maxWidth: '800px' }}>
                 <div className="search-field">
                    <Search size={20} className="icon" />
                    <input
                        type="text"
                        placeholder="Search Supplier Name, ID, or City..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
                {filteredRetailers.map(r => (
                    <div key={r.retailer_id} className="data-grid-container" style={{ padding: '35px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--velvet-brick)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(192, 57, 43, 0.2)' }}>
                                    <Truck size={30} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--velvet-dark)', marginBottom: '4px' }}>{r.name}</h3>
                                    <span className="role-badge retailer">Wholesale Node</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => { setEditing(r); setFormData(r); setShowModal(true); }} className="btn-icon" style={{ background: '#f8fafc', color: '#64748b' }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(r.retailer_id)} className="btn-icon" style={{ background: '#fff1f2', color: '#be123c' }}><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div style={{ background: '#fcfcfc', border: '1px solid #f1f5f9', borderRadius: '15px', padding: '20px', marginBottom: '25px' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', fontWeight: '600' }}>{r.description}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800', color: '#475569' }}>
                                <Mail size={16} className="text-muted" /> 
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800', color: '#475569' }}>
                                <MapPin size={16} className="text-muted" /> {r.location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800', color: '#475569' }}>
                                <Phone size={16} className="text-muted" /> {r.phone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800', color: 'var(--velvet-brick)' }}>
                                <code style={{ letterSpacing: '1px' }}>ID: {r.retailer_id}</code>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '650px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>Supplier Registration</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Supplier ID</label>
                                    <input className="form-input" value={formData.retailer_id || ''} disabled placeholder="Auto-generated" />
                                </div>
                                <div>
                                    <label className="form-label">Supplier Name</label>
                                    <input className="form-input" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Corporate Email</label>
                                    <input className="form-input" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Contact Number</label>
                                    <input className="form-input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Primary Location</label>
                                <input className="form-input" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                            </div>

                            <div>
                                <label className="form-label">Business Description</label>
                                <textarea className="form-input" style={{ height: '100px' }} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, border: '1px solid #eee' }}>CLOSE</button>
                                <button type="submit" className="btn btn-brick" style={{ flex: 2 }}>{editing ? 'UPDATE SUPPLIER' : 'REGISTER PARTNER'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRetailers;
