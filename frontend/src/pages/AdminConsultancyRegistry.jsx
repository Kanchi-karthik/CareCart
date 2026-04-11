import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Shield, DollarSign, Activity, ChevronRight, Eye } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const AdminConsultancyRegistry = () => {
    const [engagements, setEngagements] = useState([]);
    const [clients, setClients] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userTypeFilter, setUserTypeFilter] = useState('ALL'); // ALL, CLIENT, CUSTOMER, RETAILER
    const [selectedEngagement, setSelectedEngagement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [engRes, cliRes, cusRes, retRes, conRes] = await Promise.all([
                apiClient.get('/engagements'),
                apiClient.get('/clients'),
                apiClient.get('/customers'),
                apiClient.get('/retailers'),
                apiClient.get('/consultants')
            ]);
            setEngagements(engRes.data || []);
            setClients(cliRes.data || []);
            setCustomers(cusRes.data || []);
            setRetailers(retRes.data || []);
            setConsultants(conRes.data || []);
        } catch (error) {
            console.error("Audit sync failed", error);
        } finally {
            setLoading(false);
        }
    };

    const getEntityName = (eng) => {
        if (eng.client_id) return clients.find(c => String(c.client_id) === String(eng.client_id))?.name || `Hospital #${eng.client_id}`;
        if (eng.customer_id) return customers.find(c => String(c.customer_id) === String(eng.customer_id))?.full_name || `Patient #${eng.customer_id}`;
        if (eng.retailer_id) return retailers.find(r => String(r.retailer_id) === String(eng.retailer_id))?.name || `Retailer #${eng.retailer_id}`;
        return "Unknown Party";
    };

    const getTypeLabel = (eng) => {
        if (eng.client_id) return { label: 'HOSPITAL', class: 'badge-vibrant' };
        if (eng.customer_id) return { label: 'PATIENT', class: 'badge-success' };
        if (eng.retailer_id) return { label: 'RETAILER', class: 'badge-warning' };
        return { label: 'UNKNOWN', class: 'badge-danger' };
    };

    const filtered = engagements.filter(eng => {
        const matchesType =
            userTypeFilter === 'ALL' ||
            (userTypeFilter === 'CLIENT' && eng.client_id) ||
            (userTypeFilter === 'CUSTOMER' && eng.customer_id) ||
            (userTypeFilter === 'RETAILER' && eng.retailer_id);

        const matchesSearch =
            eng.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getEntityName(eng).toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesSearch;
    });

    if (loading) return <div style={{ padding: '150px', textAlign: 'center' }}><div className="spin-loader" style={{ margin: '0 auto' }}></div></div>;

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>Consultancy Audit</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Platform-wide medical engagement monitoring and financial oversight.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '5px', borderRadius: '15px' }}>
                    {['ALL', 'CLIENT', 'RETAILER', 'CUSTOMER'].map(type => (
                        <button
                            key={type}
                            onClick={() => setUserTypeFilter(type)}
                            style={{
                                padding: '10px 20px', borderRadius: '12px', border: 'none',
                                background: userTypeFilter === type ? 'var(--velvet-brick)' : 'transparent',
                                color: userTypeFilter === type ? 'white' : '#64748b',
                                fontWeight: '900', fontSize: '11px', cursor: 'pointer'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-hub" style={{ marginBottom: '40px' }}>
                <div className="search-field">
                    <Search size={20} className="icon" />
                    <input
                        type="text"
                        placeholder="Search sessions or parties..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '8px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    {['ALL', 'CLIENT', 'RETAILER', 'CUSTOMER'].map(type => (
                        <button
                            key={type}
                            onClick={() => setUserTypeFilter(type)}
                            style={{
                                padding: '8px 20px', borderRadius: '15px', border: 'none',
                                background: userTypeFilter === type ? 'var(--velvet-brick)' : 'transparent',
                                color: userTypeFilter === type ? 'white' : '#64748b',
                                fontWeight: '900', fontSize: '11px', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedEngagement ? '1.5fr 1fr' : '1fr', gap: '40px', transition: '0.4s' }}>
                <div className="data-grid-container">
                    <table className="data-grid">
                        <thead>
                            <tr>
                                <th>Party Identity</th>
                                <th>Architecture Node</th>
                                <th>Specialist Node</th>
                                <th>Project Title</th>
                                <th>Valuation</th>
                                <th style={{ textAlign: 'right' }}>Logistics</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((eng) => {
                                const type = getTypeLabel(eng);
                                const specialist = consultants.find(c => String(c.consultant_id) === String(eng.consultant_id))?.full_name || "Expert";
                                return (
                                    <tr
                                        key={eng.engagement_id}
                                        onClick={() => setSelectedEngagement(eng)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selectedEngagement?.engagement_id === eng.engagement_id ? 'rgba(192, 57, 43, 0.03)' : 'transparent'
                                        }}
                                    >
                                        <td>
                                            <div style={{ fontWeight: '900', color: 'var(--velvet-dark)' }}>{getEntityName(eng)}</div>
                                            <code style={{ fontSize: '10px', color: '#94a3b8' }}>ID: {eng.client_id || eng.customer_id || eng.retailer_id}</code>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${type.label.toLowerCase()}`} style={{ fontSize: '9px', padding: '4px 8px' }}>
                                                {type.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '30px', height: '30px', background: 'rgba(155, 89, 182, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vibrant-purple)' }}>
                                                    <User size={14} />
                                                </div>
                                                <span style={{ fontWeight: '800', fontSize: '13px' }}>Dr. {specialist}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '700', fontSize: '13px', color: '#475569' }}>{eng.title}</td>
                                        <td style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '16px' }}>${eng.fee}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={`status ${eng.status.toLowerCase()}`} style={{ fontWeight: '900', fontSize: '10px' }}>
                                                {eng.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {selectedEngagement && (
                    <div className="card page-transition" style={{ border: '4px solid var(--vibrant-gold)', alignSelf: 'start' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Engagement Insight</h2>
                            <button onClick={() => setSelectedEngagement(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', color: '#94a3b8' }}>CLOSE</button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '20px', marginBottom: '30px', border: '2px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--velvet-brick)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '20px', fontWeight: '900' }}>{selectedEngagement.title}</h4>
                                    <p style={{ fontWeight: '700', color: 'var(--vibrant-blue)' }}>Expert Node: {selectedEngagement.consultant_id}</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', lineHeight: '1.6' }}>{selectedEngagement.description || "No session briefing provided in the engagement registry."}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="card" style={{ padding: '20px', background: 'white', border: '2px solid #f1f5f9' }}>
                                <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>PARTY PROFILE</label>
                                <p style={{ fontWeight: '900', marginTop: '5px' }}>{getEntityName(selectedEngagement)}</p>
                                <p style={{ fontSize: '12px', color: 'var(--velvet-brick)', fontWeight: '700' }}>{getTypeLabel(selectedEngagement).label}</p>
                            </div>
                            <div className="card" style={{ padding: '20px', background: 'white', border: '2px solid #f1f5f9' }}>
                                <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>FINANCIALS</label>
                                <p style={{ fontWeight: '900', marginTop: '5px', fontSize: '20px', color: 'var(--velvet-brick)' }}>${selectedEngagement.fee}</p>
                                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>FIX_PRICE_LOCKED</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <button className="btn btn-brick" style={{ flex: 1, fontSize: '12px' }}>AUDIT INVOICE</button>
                            <button className="btn" style={{ flex: 1, border: '2px solid #eee', fontSize: '12px' }}>EXPORT LOGS</button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`.spin-loader { width: 40px; height: 40px; border: 4px solid var(--vibrant-gold); border-top-color: var(--velvet-brick); border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AdminConsultancyRegistry;
