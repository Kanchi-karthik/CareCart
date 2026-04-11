import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, Package, Users, TrendingUp, DollarSign, 
    ArrowUpRight, ArrowDownRight, Activity, PlusCircle, 
    LayoutGrid, Eye, EyeOff, ShieldCheck, CheckCircle, AlertTriangle, MessageSquare
} from 'lucide-react';
import apiClient from '../../utils/axiosConfig';
import SecuredValue from '../../components/SecuredValue';

const SellerDashboard = () => {
    const [stats, setStats] = useState({ 
        my_products: 0, 
        active_shipments: 0, 
        stock_alerts: 0, 
        wholesale_sales: 0 
    });
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/dashboard/?role=SELLER&user_id=${user.user_id}`);
            if (res.data) setStats(res.data);
            
            // Also fetch negotiations for this seller
            const inqRes = await apiClient.get(`/inquiries?seller_id=${user.profile_id || user.user_id}`);
            // Ensure inquiries is always an array
            setInquiries(Array.isArray(inqRes.data) ? inqRes.data : []);
        } catch (err) { 
            console.error("Dashboard data load failed", err); 
            setInquiries([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const updateInquiryStatus = async (id, status) => {
        if (!window.confirm(`Confirm negotiation status update to ${status}?`)) return;
        try {
            await apiClient.put(`/inquiries?id=${id}&status=${status}`);
            alert('Quotation updated successfully.');
            // Refresh
            const inqRes = await apiClient.get(`/inquiries?seller_id=${user.profile_id || user.user_id}`);
            setInquiries(Array.isArray(inqRes.data) ? inqRes.data : []);
        } catch (err) {
            alert('Cloud sync failed.');
        }
    };

    useEffect(() => {
        if (user.user_id) fetchStats();
    }, [user.user_id]);

    const trends = [
        { label: 'Sales Growth', trend: stats.wholesale_sales > 0 ? '+12.4%' : '0%', up: stats.wholesale_sales > 0 },
        { label: 'Inventory Health', trend: stats.stock_alerts > 0 ? `-${stats.stock_alerts}%` : 'Optimal', up: stats.stock_alerts === 0 },
        { label: 'Market Demand', trend: stats.active_shipments > 5 ? '+8.2%' : '+2.1%', up: true },
    ];

    const isVerified = user.verification_status === 'VERIFIED';
    const isPending = user.verification_status === 'PENDING';

    return (
        <div className="page-transition">
            {/* Verification Awareness Banner */}
            {!isVerified && (
                <div style={{ 
                    background: isPending ? '#fef3c7' : '#fee2e2', 
                    border: `1px solid ${isPending ? '#f59e0b' : '#ef4444'}`,
                    padding: '28px', borderRadius: '35px', marginBottom: '40px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
                        <div style={{ padding: '16px', background: 'white', borderRadius: '18px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                            {isPending ? <Activity size={32} color="#f59e0b" /> : <ShieldCheck size={32} color="#ef4444" />}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: '900', color: '#0f172a', fontSize: '22px', letterSpacing: '-0.5px' }}>
                                {isPending ? "Compliance Audit in Progress" : "Verification Required (Phase 2)"}
                            </h4>
                            <p style={{ color: '#64748b', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
                                {isPending 
                                    ? "Our clinical audit team is currently reviewing your logistics data. Partial wholesale trading is active." 
                                    : "Complete the mandatory 'Logistics & Identity' verification to unlock your premium wholesale portal."}
                            </p>
                        </div>
                    </div>
                    {!isPending && (
                        <button 
                            onClick={() => navigate('/app/onboarding')}
                            style={{ 
                                padding: '16px 35px', background: '#0f172a', color: 'white', 
                                border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)', transition: '0.2s'
                            }}
                            className="hover-up"
                        >
                            FINALIZE ONBOARDING
                        </button>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                   <h1 style={{ fontSize: '46px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' }}>Store Intelligence</h1>
                   <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>Pharmaceutical Stock Management • {isVerified ? 'Verified Hub' : 'Standard Mode'}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => navigate('/app/products')} className="btn" style={{ background: 'white', border: '2px solid #f1f5f9', color: '#0f172a', padding: '15px 25px' }}>
                        <LayoutGrid size={18} /> INVENTORY REGISTRY
                    </button>
                    <button onClick={() => navigate('/app/add-product')} className="btn btn-brick" style={{ padding: '15px 30px' }}>
                        <PlusCircle size={18} /> LIST NEW MEDICINE
                    </button>
                </div>
            </div>

            {/* Core Stats Architecture */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '45px' }}>
                {[
                    { label: 'TOTAL STOCK', value: stats.my_products || 0, id: 'inv', icon: Package, color: '#3b82f6', sensitive: false },
                    { label: 'ACTIVE B2B ORDERS', value: stats.active_shipments || 0, id: 'sales', icon: ShoppingCart, color: '#f59e0b', sensitive: false },
                    { label: 'CRITICAL ALERTS', value: stats.stock_alerts || 0, id: 'alerts', icon: AlertTriangle, color: '#ef4444', sensitive: false },
                    { label: 'ANNUAL REVENUE', value: `₹${(stats.wholesale_sales || 0).toLocaleString()}`, id: 'wallet', icon: Activity, color: '#10b981', sensitive: true },
                ].map((stat, i) => (
                    <div key={i} className="card hover-up" style={{ padding: '35px', borderRadius: '35px', border: '2px solid #f1f5f9', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: `${stat.color}10`, width: '60px', height: '60px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '25px' }}>
                            <stat.icon size={32} />
                        </div>
                        <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>{stat.label}</h3>
                        <div style={{ fontSize: '38px', fontWeight: '900', color: '#0f172a' }}>
                            <SecuredValue id={stat.id} value={stat.value} size="38px" color="#0f172a" isSensitive={stat.sensitive} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Wholesale Negotiation Registry */}
            <div className="card" style={{ padding: '45px', background: 'white', borderRadius: '45px', border: '2px solid #f1f5f9', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <MessageSquare size={28} color="#b62d2d" /> Wholesale Negotiation Registry
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>
                                <th style={{ padding: '0 20px' }}>REQUEST ID</th>
                                <th>PRODUCT NODE</th>
                                <th>BUYER ENTITY</th>
                                <th>VOLUME</th>
                                <th>OFFERED UNIT PRICE</th>
                                <th>STATUS</th>
                                <th style={{ textAlign: 'right', paddingRight: '20px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontWeight: '700', fontStyle: 'italic', background: '#f8fafc', borderRadius: '25px' }}>
                                        No active procurement negotiations detected.
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((inq) => (
                                    <tr key={inq.id} style={{ background: '#f8fafc' }}>
                                        <td style={{ padding: '22px 20px', fontWeight: '900', fontSize: '13px', color: '#64748b', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>{inq.id?.substring(0, 8)}</td>
                                        <td style={{ fontWeight: '800', color: '#0f172a' }}>{inq.product_id}</td>
                                        <td>
                                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{inq.full_name || 'Verified Provider'}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inq.email}</div>
                                        </td>
                                        <td style={{ fontWeight: '900', fontSize: '16px' }}>{inq.quantity} Units</td>
                                        <td style={{ fontWeight: '900', fontSize: '16px', color: '#b62d2d' }}>₹{inq.expected_price}</td>
                                        <td>
                                            <span style={{ 
                                                padding: '8px 18px', borderRadius: '50px', fontSize: '11px', fontWeight: '900',
                                                background: inq.status === 'OPEN' ? '#fff1f2' : (inq.status === 'ACCEPTED' ? '#ecfdf5' : '#f1f5f9'),
                                                color: inq.status === 'OPEN' ? '#be123c' : (inq.status === 'ACCEPTED' ? '#059669' : '#64748b'),
                                                border: `1px solid ${inq.status === 'OPEN' ? '#fecaca' : (inq.status === 'ACCEPTED' ? '#a7f3d0' : '#e2e8f0')}`
                                            }}>
                                                {inq.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '20px', borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => updateInquiryStatus(inq.id, 'ACCEPTED')} style={{ padding: '10px', background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><CheckCircle size={18} /></button>
                                                <button onClick={() => updateInquiryStatus(inq.id, 'REJECTED')} style={{ padding: '10px', background: '#fff1f2', color: '#be123c', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><AlertTriangle size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* Performance Hub */}
                <div className="card" style={{ padding: '45px', background: 'white', borderRadius: '45px', border: '2px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <TrendingUp color="#b62d2d" size={28} /> Market Strategy Performance
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        {trends.map((trend, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: '#f8fafc', borderRadius: '25px' }}>
                                <span style={{ fontWeight: '800', color: '#64748b', fontSize: '15px' }}>{trend.label}</span>
                                <span style={{ fontWeight: '900', color: trend.up ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                                    {trend.up ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />} {trend.trend}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Verification Hub */}
                <div className="card" style={{ padding: '45px', background: isVerified ? '#0f172a' : 'white', color: isVerified ? 'white' : '#0f172a', borderRadius: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: isVerified ? 'none' : '2px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ width: '90px', height: '90px', background: isVerified ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                         {isVerified ? <CheckCircle size={55} color="#f59e0b" /> : <Activity size={55} color="#94a3b8" />}
                    </div>
                    <h3 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '15px' }}>
                        {isVerified ? 'Clinical Status: Verified' : 'Standard Compliance'}
                    </h3>
                    <p style={{ opacity: isVerified ? 0.7 : 0.6, fontWeight: '600', lineHeight: '1.6', marginBottom: '35px', padding: '0 20px' }}>
                        {isVerified 
                            ? "Your store is officially verified. You can now engage in high-volume wholesale trading and bulk medicine distribution."
                            : "Unlock premium wholesale features by completing your Phase 2 verification journey today."}
                    </p>
                    {isVerified ? (
                        <button className="btn btn-brick" style={{ padding: '18px 40px', borderRadius: '18px' }}>DOWNLOAD CERTIFICATE</button>
                    ) : (
                        <button 
                            onClick={() => navigate('/app/onboarding')}
                            className="btn" 
                            style={{ padding: '18px 40px', background: '#0f172a', color: 'white', borderRadius: '18px', border: 'none', fontWeight: '900' }}
                        >
                            VERIFY PROFILE
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                .hover-up { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease; }
                .hover-up:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
            `}</style>
        </div>
    );
};

export default SellerDashboard;
