import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingBag, Activity, Database, Share2, TrendingUp, ShieldCheck, ClipboardList, Truck, Eye, EyeOff, ChevronRight, CheckCircle } from 'lucide-react';
import apiClient from '../../utils/axiosConfig';
import SecuredValue from '../../components/SecuredValue';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [realStats, setRealStats] = useState({ total_users: 0, total_products: 0, b2b_orders: 0, b2c_orders: 0, total_sellers: 0, total_buyers: 0 });
    const [loading, setLoading] = useState(true);
    const [visibleFields, setVisibleFields] = useState({});

    const toggleVisibility = (field) => {
        setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const [pendingSellers, setPendingSellers] = useState([]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/dashboard?role=ADMIN');
            setRealStats(res.data);
            
            // Fetch pending sellers for the highlighted queue
            const sellersRes = await apiClient.get('/sellers/');
            const pending = (sellersRes.data || []).filter(s => s.verification_status === 'PENDING');
            setPendingSellers(pending);
        } catch (err) {
            console.error("Stats fetch failed");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickApprove = async (seller) => {
        try {
            await apiClient.put('/sellers/', { ...seller, verification_status: 'VERIFIED' });
            fetchStats();
        } catch (err) { alert("Verification Sync Error."); }
    };

    useEffect(() => {
        fetchStats();
        const telemetryInterval = setInterval(fetchStats, 20000);
        return () => clearInterval(telemetryInterval);
    }, []);

    const safeNodes = (Number(realStats.total_users) || 0) + (Number(realStats.total_products) || 0);
    const safeTx   = (Number(realStats.b2b_orders) || 0) + (Number(realStats.b2c_orders) || 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }} className="page-transition">
            
            {/* 🛡️ ULTRA-HIGHLIGHTED: Pending Professional Verification Queue */}
            {pendingSellers.length > 0 && (
                <div className="card hover-up" style={{ 
                    padding: '50px', 
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', 
                    borderRadius: '40px', 
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '35px',
                    boxShadow: '0 30px 60px rgba(182, 45, 45, 0.2)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '18px' }}>
                                <ShieldCheck size={32} color="#fca5a5" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px' }}>Sellers Awaiting Approval</h1>
                                <p style={{ fontSize: '15px', fontWeight: '700', color: '#fca5a5' }}>{pendingSellers.length} pharmaceutical suppliers are currently waiting for your verification.</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/app/admin/sellers')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 25px', borderRadius: '15px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>
                            VIEW GLOBAL LIST <ChevronRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {pendingSellers.slice(0, 3).map(s => (
                            <div key={s.seller_id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '25px', padding: '30px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '18px', marginBottom: '5px' }}>{s.company_name}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>Reg No: {s.business_reg_no}</div>
                                </div>
                                <button onClick={() => handleQuickApprove(s)} style={{ background: '#fca5a5', color: '#450a0a', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={16} /> VERIFY 
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
                <div className="card" style={{ padding: '40px', border: 'none', background: 'var(--velvet-brick)', backgroundImage: 'var(--velvet-texture), linear-gradient(135deg, var(--velvet-dark) 0%, var(--velvet-brick) 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--vibrant-gold)', marginBottom: '5px' }}>System Overview</h2>
                            <p style={{ fontWeight: '700', opacity: 0.8 }}>Manage all members, medicines, and orders across the system.</p>
                        </div>
                        <ShieldCheck size={48} color="var(--vibrant-gold)" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px' }}>SYSTEM HEALTH</div>
                            <div style={{ fontSize: '36px', fontWeight: '900' }}>
                                <SecuredValue id="global_scale" value={safeNodes} size="36px" color="white" />
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
                            <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px' }}>TOTAL COMPLETED ORDERS</div>
                            <div style={{ fontSize: '36px', fontWeight: '900' }}>
                                <SecuredValue id="secure_tx" value={safeTx} size="36px" color="white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ border: '2px solid #f1f5f9', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                         <h3 style={{ fontSize: '20px', fontWeight: '900' }}>Update Stats</h3>
                         <button onClick={fetchStats} disabled={loading} className="btn-icon" style={{ background: 'var(--canvas-bg)', color: 'var(--velvet-brick)' }}>
                            <Activity size={20} className={loading ? 'rotate-slow' : ''} />
                         </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { label: 'Total Sellers', value: realStats.total_sellers, id: 'sellers', color: 'var(--velvet-brick)' },
                            { label: 'Total Buyers', value: realStats.total_buyers, id: 'buyers', color: 'var(--vibrant-blue)' },
                            { label: 'Total Orders', value: realStats.b2b_orders, id: 'orders', icon: TrendingUp },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
                                <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-muted)' }}>{item.label}</span>
                                <div style={{ fontWeight: '900', fontSize: '18px', color: item.color || 'var(--velvet-dark)' }}>
                                    <SecuredValue id={item.id} value={item.value || 0} size="18px" color={item.color || 'var(--velvet-dark)'} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ width: '40px', height: '4px', background: 'var(--vibrant-gold)', borderRadius: '10px' }}></div>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>System Management</h3>
                </div>
                
                <div className="grid-responsive" style={{ gap: '30px' }}>
                    {[
                        { label: 'User Accounts', path: '/app/admin/users', icon: Users, id: 'user_count', count: realStats.total_users || 0, desc: 'Manage all people using the application.', color: 'var(--velvet-brick)' },
                        { label: 'Medicine Suppliers', path: '/app/admin/sellers', icon: Truck, id: 'seller_count', count: realStats.total_sellers || 0, desc: 'Companies that supply medicines for distribution.', color: 'var(--vibrant-gold)' },
                        { label: 'Partner Shops', path: '/app/admin/buyers', icon: ShieldCheck, id: 'buyer_count', count: realStats.total_buyers || 0, desc: 'All registered pharmacy stores and medical centers.', color: 'var(--vibrant-blue)' },
                        { label: 'Inventory & Stock', path: '/app/products', icon: Package, id: 'prod_count', count: realStats.total_products || 0, desc: 'Manage all clinical medicines and vendor stocks.', color: '#b62d2d' }
                    ].map((card, i) => (
                        <div key={i} className="card row-hover" style={{ padding: '30px', border: '2px solid #f1f5f9', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ width: '50px', height: '50px', background: `${card.color}15`, borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                    <card.icon size={26} />
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: '900', background: '#f1f5f9', padding: '8px 15px', borderRadius: '30px', color: '#64748b' }}>
                                    <SecuredValue id={card.id} value={card.count} size="11px" color="#64748b" />
                                </div>
                            </div>
                            <div onClick={() => navigate(card.path)}>
                                <h4 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>{card.label}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', lineHeight: '1.5', marginBottom: '25px' }}>{card.desc}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: card.color, fontWeight: '900', fontSize: '11px', letterSpacing: '1px' }}>
                                    ACCESS SECTION <TrendingUp size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
