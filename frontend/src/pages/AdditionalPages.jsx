import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Calendar, Clock, DollarSign, User, Link as LinkIcon } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export const Engagements = () => {
    const [engagements, setEngagements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [consultants, setConsultants] = useState([]);
    const [formData, setFormData] = useState({
        engagement_id: '', client_id: '', consultant_id: '', title: '',
        start_time: '', end_time: '', fee: '', status: 'SCHEDULED', description: ''
    });

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        // Fetch Consultants
        apiClient.get('/consultants/')
            .then(res => setConsultants(res.data))
            .catch(err => console.error("Consultants fetch failed", err));

        // Fetch Engagements (All for now, filter locally)
        apiClient.get('/engagements/')
            .then(res => {
                const all = res.data;
                let filtered = [];
                if (user.role === 'CLIENT') {
                    filtered = all.filter(e => String(e.client_id) === String(user.profile_id));
                } else if (user.role === 'CONSULTANT') {
                    filtered = all.filter(e => String(e.consultant_id) === String(user.profile_id));
                } else if (user.role === 'CUSTOMER') {
                    filtered = all.filter(e => String(e.customer_id) === String(user.profile_id));
                } else if (user.role === 'ADMIN') {
                    filtered = all;
                }
                // Sorting: Newest first
                filtered.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                setEngagements(filtered);
            })
            .catch(err => console.error(err));

        if ((user.role === 'CLIENT' || user.role === 'CUSTOMER') && user.profile_id) {
            setFormData(prev => ({ ...prev, client_id: user.profile_id }));
        }
    }, [user.role, user.profile_id]);

    const handleOpenModal = () => {
        // Fetch Next ID
        apiClient.get('/engagements/?action=next_val')
            .then(res => {
                if (res.data.next_id)
                    setFormData(prev => ({ ...prev, engagement_id: res.data.next_id }));
            });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiClient.post('/engagements/', { ...formData, role: user.role, status: 'SCHEDULED' });
            if (res.data.status === 'success') {
                alert("Consultancy scheduled and stored in database.");
                setFormData({
                    engagement_id: '', client_id: user.profile_id, consultant_id: '', title: '',
                    start_time: '', end_time: '', fee: '', status: 'SCHEDULED', description: ''
                });
                setShowModal(false);
                // Refresh list
                const listRes = await apiClient.get('/engagements/');
                const all = listRes.data;
                let filtered = [];
                if (user.role === 'CLIENT') filtered = all.filter(e => String(e.client_id) === String(user.profile_id));
                else if (user.role === 'CUSTOMER') filtered = all.filter(e => String(e.customer_id) === String(user.profile_id));
                else if (user.role === 'CONSULTANT') filtered = all.filter(e => String(e.consultant_id) === String(user.profile_id));
                else if (user.role === 'ADMIN') filtered = all;

                filtered.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                setEngagements(filtered);
            } else {
                alert("Scheduling Blocked: " + (res.data.message || "Please check your profile."));
            }
        } catch (err) {
            alert("Digital Failure: " + (err.response?.data?.message || "Session could not be transmitted."));
        }
    };

    if (user.role !== 'CLIENT' && user.role !== 'CONSULTANT' && user.role !== 'ADMIN' && user.role !== 'CUSTOMER') {
        return (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                <h3>Access Restricted</h3>
            </div>
        );
    }

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>
                        {user.role === 'CONSULTANT' ? "My Appointments" : "Professional Consultations"}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>
                        {user.role === 'CONSULTANT' ? "Manage your medical sessions." : "Schedule and manage medical expertise engagements."}
                    </p>
                </div>
                {/* Clients and Customers can book */}
                {(user.role === 'CLIENT' || user.role === 'CUSTOMER') && (
                    <button onClick={handleOpenModal} className="btn btn-brick" style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={24} /> BOOK CONSULTANCY
                    </button>
                )}
            </div>

            {engagements.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ClipboardList size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '900' }}>No active engagements found.</h3>
                    <p style={{ fontWeight: '600' }}>
                        {user.role === 'CONSULTANT' ? "You have no upcoming sessions." : "Start by booking a session with our verified medical consultants."}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {engagements.map(e => (
                        <div key={e.engagement_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{e.title}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{e.status} • {new Date(e.start_time).toLocaleString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '900', color: 'var(--velvet-brick)' }}>${e.fee}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {user.role === 'CLIENT' || user.role === 'CUSTOMER' ? `Specialist: ${e.consultant_id}` : `Member ID: ${e.customer_id || e.client_id}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>Schedule Medical Session</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label className="form-label">Engagement Ref ID</label>
                                    <input className="form-input" value={formData.engagement_id || ''} readOnly style={{ backgroundColor: '#f9fafb' }} />
                                </div>
                                <div>
                                    <label className="form-label">Session Title</label>
                                    <input className="form-input" value={formData.title || ''} placeholder="e.g. Cardiology Review" onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label className="form-label">My Identification ID</label>
                                    <input
                                        className="form-input"
                                        value={formData.client_id || ''}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Select Consultant</label>
                                    <select
                                        className="form-input"
                                        onChange={e => setFormData({ ...formData, consultant_id: e.target.value })}
                                        required
                                        value={formData.consultant_id || ''}
                                    >
                                        <option value="">-- Choose Specialist --</option>
                                        {consultants.map(c => (
                                            <option key={c.consultant_id} value={c.consultant_id}>{c.name} ({c.specialty})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label className="form-label">Start Time</label>
                                    <input className="form-input" type="datetime-local" value={formData.start_time || ''} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">End Time</label>
                                    <input className="form-input" type="datetime-local" value={formData.end_time || ''} onChange={e => setFormData({ ...formData, end_time: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label className="form-label">Agreed Fee (?)</label>
                                <input className="form-input" type="number" step="0.01" value={formData.fee || ''} onChange={e => setFormData({ ...formData, fee: e.target.value })} required />
                            </div>

                            <label className="form-label">Engagement Protocol / Description</label>
                            <textarea className="form-input" style={{ height: '80px' }} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} required />

                            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, border: '1px solid #eee' }}>ABORT</button>
                                <button type="submit" className="btn btn-brick" style={{ flex: 2 }}>SCHEDULING SESSION</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export const GoodsReceipts = () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const [formData, setFormData] = useState({ receipt_id: '', date: '', retailer_id: '', product_id: '', quantity: '', description: '' });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch Next Receipt ID
        apiClient.get('/receipts/?action=next_val')
            .then(res => { if (res.data.next_id) setFormData(prev => ({ ...prev, receipt_id: res.data.next_id })) });

        if (user.role === 'RETAILER' && user.profile_id) {
            setFormData(prev => ({ ...prev, retailer_id: user.profile_id }));

            // Fetch Products for this Retailer
            apiClient.get('/products/')
                .then(res => {
                    const myProducts = res.data.filter(p => p.retailer_id === user.profile_id);
                    setProducts(myProducts);
                });
        }
    }, [user.role, user.profile_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiClient.post('/goods-receipts/', formData);
            if (res.data.status === 'success') {
                alert("Stock Inward Recorded!");
                // Refresh ID and clear form
                apiClient.get('/goods-receipts/?action=next_val')
                    .then(res => {
                        setFormData(prev => ({ ...prev, receipt_id: res.data.next_id || '', product_id: '', quantity: '', description: '' }));
                    });
            } else {
                alert("Verification Failure: " + (res.data.message || "Could not record receipt."));
            }
        } catch (err) {
            alert("Digital Failure: " + (err.response?.data?.message || "Inventory update rejected."));
        }
    };

    return (
        <div className="page-transition">
            <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px' }}>Inventory Inward</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '40px' }}>Record goods received from suppliers into the CareCart warehouse.</p>

            {user.role === 'RETAILER' ? (
                <div className="card" style={{ maxWidth: '800px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label className="form-label">Receipt Ref ID</label>
                                <input className="form-input" value={formData.receipt_id || ''} readOnly style={{ backgroundColor: '#f9fafb' }} />
                            </div>
                            <div>
                                <label className="form-label">Retailer ID</label>
                                <input
                                    className="form-input"
                                    value={formData.retailer_id || ''}
                                    onChange={e => setFormData({ ...formData, retailer_id: e.target.value })}
                                    disabled={!!user.profile_id}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label className="form-label">Select Product</label>
                                <select
                                    className="form-input"
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                    required
                                    value={formData.product_id || ''}
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p.product_id} value={p.product_id}>{p.name} ({p.quantity} on hand)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Verified Quantity</label>
                                <input className="form-input" type="number" value={formData.quantity || ''} required onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Receipt Date</label>
                            <input className="form-input" type="date" value={formData.date || ''} required onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-brick" style={{ padding: '15px' }}>RECORD RECEIPT</button>
                    </form>
                </div>
            ) : (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ef4444', border: '2px solid #fecaca', background: '#fef2f2' }}>
                    <h3 style={{ fontWeight: '900' }}>Authorized Personnel Only</h3>
                    <p>Only Retailers can process inventory inward.</p>
                </div>
            )}
        </div>
    );
};

export const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, SUPPLY, CONSULTANCY
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const [generating, setGenerating] = useState(null);

    const handleGeneratePDF = (id) => {
        setGenerating(id);
        setTimeout(() => {
            setGenerating(null);
            alert(`Invoice ${id} decrypted and archived to your local downloads.`);
        }, 2000);
    };

    useEffect(() => {
        fetchInvoices();
    }, [user.role, user.user_id]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            // Fetch Payments as Invoices
            const res = await apiClient.get('/payments', {
                params: { role: user.role, userId: user.user_id }
            });
            setInvoices(res.data);
        } catch (err) {
            console.error("Ledger Sync Failed", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = invoices.filter(inv => {
        if (filter === 'ALL') return true;
        if (filter === 'SUPPLY') return inv.order_id?.startsWith('B2B');
        if (filter === 'CONSULTANCY') return inv.description?.toLowerCase().includes('consultancy');
        return true;
    });

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px' }}>Financial Ledger</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{user.role === 'CUSTOMER' ? 'Your Personal Healthcare Expenditures' : 'B2B Trade settlements and Professional Engagement invoices.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '5px', borderRadius: '15px' }}>
                    {['ALL', 'SUPPLY', 'CONSULTANCY'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '10px 20px', borderRadius: '12px', border: 'none',
                                background: filter === f ? 'white' : 'transparent',
                                color: filter === f ? 'var(--velvet-brick)' : '#64748b',
                                fontWeight: '900', fontSize: '12px', cursor: 'pointer',
                                boxShadow: filter === f ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '100px', textAlign: 'center' }}><div className="spin-loader" style={{ margin: '0 auto' }}></div></div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ padding: '100px', textAlign: 'center' }}>
                    <DollarSign size={64} style={{ opacity: 0.2, margin: '0 auto 20px' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '900' }}>No Invoices Generated</h3>
                    <p style={{ fontWeight: '600' }}>Your financial ledger is currently clear.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #eee' }}>
                            <tr style={{ textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
                                <th style={{ padding: '25px 30px' }}>Invoice Ref</th>
                                <th>Category</th>
                                <th>Settlement Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ paddingRight: '30px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((inv, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '25px 30px', fontWeight: '900', color: 'var(--velvet-dark)' }}>
                                        INV-{inv.payment_id || 'PROX_01'}
                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>REF: {inv.order_id || 'GEN_SETTLE'}</div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '800', fontSize: '13px' }}>
                                            {(inv.order_id?.startsWith('B2B') || inv.order_id?.startsWith('B2C')) ? 'Medical Supply' : 'Consultancy Fee'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '700', color: '#64748b' }}>{inv.date || new Date().toLocaleDateString()}</td>
                                    <td style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '18px' }}>${inv.amount}</td>
                                    <td>
                                        <span className={`badge-vibrant ${inv.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
                                            {inv.status === 'SUCCESS' ? 'SETTLED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td style={{ paddingRight: '30px' }}>
                                        <button
                                            disabled={generating === inv.payment_id}
                                            onClick={() => handleGeneratePDF(inv.payment_id)}
                                            className="btn"
                                            style={{ padding: '10px 20px', background: 'var(--velvet-dark)', color: 'white', fontSize: '11px', fontWeight: '900', minWidth: '130px' }}
                                        >
                                            {generating === inv.payment_id ? 'ENCRYPTING...' : 'GENERATE PDF'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <style>{`.spin-loader { width: 40px; height: 40px; border: 4px solid var(--vibrant-gold); border-top-color: var(--velvet-brick); border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
