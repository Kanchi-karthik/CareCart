import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Mail, Phone, MapPin, Search, Eye, EyeOff, Hash, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

const AdminBuyers = () => {
    const navigate = useNavigate();
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');

    
    const [formData, setFormData] = useState({ 
        buyer_id: '', 
        user_id: '',
        organization_name: '', 
        email: '', 
        phone: '', 
        license_no: '',
        address: '', 
        city: '', 
        country: 'India',
        wallet_balance: 0 
    });



    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/buyers/');
            const sorted = (res.data || []).sort((a, b) => b.buyer_id.localeCompare(a.buyer_id, undefined, { numeric: true, sensitivity: 'base' }));
            setBuyers(sorted);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBuyers = React.useMemo(() => {
        return (buyers || []).filter(b =>
            String(b.city).toLowerCase().includes(search.toLowerCase())
        );
    }, [buyers, search]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await apiClient.put('/buyers/', formData);
            } else {
                await apiClient.post('/buyers/', formData);
            }
            setShowModal(false);
            setEditing(null);
            fetchData();
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Terminate this buyer registry?")) {
            try {
                await apiClient.delete(`/buyers/?id=${id}`);
                fetchData();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const handleQuickApprove = async (buyer) => {
        try {
            const updated = { ...buyer, verification_status: 'VERIFIED' };
            await apiClient.put('/buyers/', updated);
            fetchData();
        } catch (err) {
            alert("Digital consensus failed. Ledger locked.");
        }
    };

    const fetchNextId = async () => {
        try {
            const res = await apiClient.get('/buyers/?action=next_val');
            setFormData(prev => ({ ...prev, buyer_id: res.data.next_id }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>Clinical Network</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Manage all pharmacy stores and healthcare centers.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>

                    <button onClick={() => {
                        setEditing(null);
                        setFormData({ buyer_id: '', user_id: '', organization_name: '', email: '', phone: '', license_no: '', address: '', city: '', country: 'India', verification_status: 'PENDING', wallet_balance: 0 });
                        fetchNextId();
                        setShowModal(true);
                    }} className="btn btn-brick" style={{ height: 'fit-content', display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 30px', borderRadius: '15px' }}>
                        <Plus size={26} /> REGISTER PARTNER
                    </button>
                </div>
            </div>

            <div className="filter-hub" style={{ marginBottom: '40px' }}>
                 <div className="search-field">
                    <Search size={22} className="icon" />
                    <input
                        type="text"
                        placeholder="Filter by Store Name, City, or Node ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ fontSize: '16px', fontWeight: '700' }}
                    />
                </div>
            </div>

            <div className="data-grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>NODE REF</th>
                            <th>PARTNER ENTITY</th>
                            <th>LICENCE HUB</th>
                            <th>CREDIT LIMIT</th>
                            <th>LOCATION</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>COMMANDS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBuyers.map(b => (
                            <tr key={b.buyer_id} onClick={() => navigate(`/app/admin/profile/buyer/${b.buyer_id}`)} className="row-hover" style={{ cursor: 'pointer' }}>
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>{b.buyer_id}</code>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--vibrant-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                                            {(b.organization_name && b.organization_name[0]) ? b.organization_name[0].toUpperCase() : 'B'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '18px', color: 'var(--velvet-dark)' }}>{b.organization_name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>{b.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>
                                        <ShieldCheck size={14} style={{ marginRight: '5px', color: '#10b981' }} />
                                        {b.license_no}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '900', color: '#27ae60', fontSize: '16px' }}>
                                        ₹{Number(b.wallet_balance).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>INSTITUTIONAL BALANCE</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px' }}>{b.city}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>{b.country}</div>
                                </td>
                                <td>
                                    <span className={`role-badge ${b.verification_status === 'VERIFIED' ? 'active' : 'pending'}`} style={{ 
                                        fontSize: '10px', fontWeight: '900', padding: '6px 12px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content',
                                        background: b.verification_status === 'VERIFIED' ? '#ecfdf5' : '#fff7ed',
                                        color: b.verification_status === 'VERIFIED' ? '#059669' : '#d97706',
                                        border: b.verification_status === 'VERIFIED' ? '1px solid #10b981' : '1px solid #fbbf24'
                                    }}>
                                        {b.verification_status || 'PENDING'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        {b.verification_status === 'PENDING' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleQuickApprove(b); }}
                                                className="hover-up"
                                                style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', cursor: 'pointer' }}
                                            >
                                                APPROVE
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); setEditing(b); setFormData(b); setShowModal(true); }} className="btn-icon" style={{ background: '#f8fafc', color: '#64748b' }}><Edit2 size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(b.buyer_id); }} className="btn-icon" style={{ background: '#fff1f2', color: '#be123c' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '650px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>Partner Registration</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Network ID</label>
                                    <input className="form-input" value={formData.buyer_id || ''} disabled placeholder="Auto-generated" />
                                </div>
                                <div>
                                    <label className="form-label">Entity Name</label>
                                    <input className="form-input" value={formData.organization_name || ''} onChange={e => setFormData({ ...formData, organization_name: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Contact Email</label>
                                    <input className="form-input" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Phone Number</label>
                                    <input className="form-input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Pharmacy Licence</label>
                                    <input className="form-input" value={formData.license_no || ''} onChange={e => setFormData({ ...formData, license_no: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Verification Status</label>
                                    <select className="form-input" value={formData.verification_status || 'PENDING'} onChange={e => setFormData({ ...formData, verification_status: e.target.value })}>
                                        <option value="PENDING">PENDING</option>
                                        <option value="VERIFIED">VERIFIED</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">City</label>
                                    <input className="form-input" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Country</label>
                                    <input className="form-input" value={formData.country || 'India'} onChange={e => setFormData({ ...formData, country: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, border: '1px solid #eee' }}>CLOSE</button>
                                <button type="submit" className="btn btn-brick" style={{ flex: 2 }}>{editing ? 'SAVE CHANGES' : 'ADD SHOP'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBuyers;
