import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, MapPin, Globe, Search, Eye, EyeOff, ShieldCheck, ExternalLink, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

const AdminSellers = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');

    
    const [formData, setFormData] = useState({ 
        seller_id: '', 
        user_id: '',
        company_name: '', 
        email: '', 
        phone: '', 
        business_reg_no: '',
        address: '',
        city: '', 
        country: 'India',
        verification_status: 'PENDING' 
    });



    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/sellers/');
            const sorted = (res.data || []).sort((a, b) => b.seller_id.localeCompare(a.seller_id, undefined, { numeric: true, sensitivity: 'base' }));
            setSellers(sorted);
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSellers = React.useMemo(() => {
        return (sellers || []).filter(r =>
            String(r.seller_id).toLowerCase().includes(search.toLowerCase()) ||
            String(r.city).toLowerCase().includes(search.toLowerCase())
        );
    }, [sellers, search]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await apiClient.put('/sellers/', formData);
            } else {
                await apiClient.post('/sellers/', formData);
            }
            setShowModal(false);
            setEditing(null);
            fetchData();
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleQuickApprove = async (seller) => {
        try {
            const updated = { ...seller, verification_status: 'VERIFIED' };
            await apiClient.put('/sellers/', updated);
            fetchData();
        } catch (err) {
            alert("Approval sync failed. Database node busy.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this seller profile?")) {
            try {
                await apiClient.delete(`/sellers/?id=${id}`);
                fetchData();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const fetchNextId = async () => {
        try {
            const res = await apiClient.get('/sellers/?action=next_val');
            setFormData(prev => ({ ...prev, seller_id: res.data.next_id }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', position: 'relative' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>Global Companies</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Manage all medicine suppliers and manufacturers.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>

                    <button onClick={() => {
                        setEditing(null);
                        setFormData({ seller_id: '', user_id: '', company_name: '', email: '', phone: '', business_reg_no: '', address: '', city: '', country: 'India', verification_status: 'PENDING' });
                        fetchNextId();
                        setShowModal(true);
                    }} className="btn btn-brick" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 30px', borderRadius: '15px' }}>
                        <Plus size={24} /> NEW COMPANY
                    </button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="filter-hub" style={{ marginBottom: '40px' }}>
                 <div className="search-field">
                    <Search size={22} className="icon" />
                    <input
                        type="text"
                        placeholder="Filter by Company Name, ID, or City..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ fontSize: '16px', fontWeight: '700' }}
                    />
                </div>
            </div>

            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '30px' }}>
                {filteredSellers.map(s => (
                    <div key={s.seller_id} onClick={() => navigate(`/app/admin/profile/seller/${s.seller_id}`)} className="card row-hover" style={{ padding: '35px', border: '2px solid #f1f5f9', background: 'white', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '65px', height: '65px', background: 'var(--velvet-brick)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                    <Truck size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{s.company_name}</h3>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '5px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '900', background: '#f1f5f9', padding: '4px 10px', borderRadius: '30px', color: '#64748b' }}>ID: {s.seller_id}</span>
                                        <span className={`role-badge ${s.verification_status === 'VERIFIED' ? 'active' : 'pending'}`} style={{ 
                                            fontSize: '10px', fontWeight: '900', padding: '6px 12px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '6px',
                                            background: s.verification_status === 'VERIFIED' ? '#ecfdf5' : '#fff7ed',
                                            color: s.verification_status === 'VERIFIED' ? '#059669' : '#d97706',
                                            border: s.verification_status === 'VERIFIED' ? '1px solid #10b981' : '1px solid #fbbf24'
                                        }}>
                                            {s.verification_status === 'VERIFIED' ? 'TRUSTED' : 'NEEDS REVIEW'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="action-hub" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '15px' }}>
                                {s.verification_status === 'PENDING' && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleQuickApprove(s); }} 
                                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        className="hover-up"
                                    >
                                        <ShieldCheck size={14} /> APPROVE
                                    </button>
                                )}
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); setEditing(s); setFormData(s); setShowModal(true); }} className="admin-btn-small edit" style={{ background: '#f8fafc', color: '#64748b', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(s.seller_id); }} className="admin-btn-small delete" style={{ background: '#fff1f2', color: '#be123c', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '5px', letterSpacing: '1px' }}>EMAIL ADDRESS</div>
                                <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Mail size={14} className="text-muted" /> {s.email}
                                </div>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '5px', letterSpacing: '1px' }}>WAREHOUSE LOCATION</div>
                                <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={14} className="text-muted" /> {s.city}, {s.country}
                                </div>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '5px', letterSpacing: '1px' }}>BUSINESS REGISTRATION</div>
                                <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Globe size={14} className="text-muted" /> {s.business_reg_no}
                                </div>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '5px', letterSpacing: '1px' }}>PHONE NUMBER</div>
                                <div style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Phone size={14} className="text-muted" /> {s.phone}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '650px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>Register New Company</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Company Reference</label>
                                    <input className="form-input" value={formData.seller_id || ''} disabled placeholder="Auto-generated" />
                                </div>
                                <div>
                                    <label className="form-label">Company Name</label>
                                    <input className="form-input" value={formData.company_name || ''} onChange={e => setFormData({ ...formData, company_name: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Reg Number</label>
                                    <input className="form-input" value={formData.business_reg_no || ''} onChange={e => setFormData({ ...formData, business_reg_no: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Verification</label>
                                    <select className="form-input" value={formData.verification_status || 'PENDING'} onChange={e => setFormData({ ...formData, verification_status: e.target.value })}>
                                        <option value="PENDING">PENDING</option>
                                        <option value="VERIFIED">VERIFIED</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                <div>
                                    <label className="form-label">Warehouse Address</label>
                                    <input className="form-input" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
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
                                <button type="submit" className="btn btn-brick" style={{ flex: 2 }}>{editing ? 'SAVE PROFILE' : 'ADD COMPANY'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSellers;
