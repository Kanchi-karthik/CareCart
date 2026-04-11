import React, { useState, useEffect } from 'react';
import { ShoppingBag, CreditCard, Clock, Activity, Eye, EyeOff, Database, FileText, ChevronRight, PlusCircle, ShieldCheck, Truck, ShoppingCart, HelpCircle } from 'lucide-react';
import apiClient from '../../utils/axiosConfig';
import SecuredValue from '../../components/SecuredValue';

const BuyerDashboard = () => {
    const [stats, setStats] = useState({ bulk_orders: 0, total_spent: 0, wallet_balance: 0 });
    const [inquiries, setInquiries] = useState([]);
    const [visibleFields, setVisibleFields] = useState({});
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const toggleVisibility = (field) => {
        setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const fetchStats = async () => {
        try {
            const res = await apiClient.get(`/dashboard/stats?role=BUYER&user_id=${user.user_id}`);
            setStats(res.data);
            
            // Also fetch negotiations for this buyer
            const inqRes = await apiClient.get(`/inquiries?buyer_id=${user.profile_id || user.user_id}`);
            setInquiries(inqRes.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="page-transition" style={{ perspective: '1000px' }}>
            {/* 🏥 Main Hub Header Area */}
            <div className="card hover-up" style={{ 
                padding: '70px', 
                background: 'linear-gradient(145deg, #b62d2d 0%, #8e2222 100%)', 
                borderRadius: '50px', 
                marginBottom: '60px',
                color: 'white',
                display: 'grid',
                gridTemplateColumns: 'minmax(450px, 1.8fr) 1fr',
                gap: '60px',
                alignItems: 'center',
                boxShadow: '0 50px 100px rgba(182, 45, 45, 0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                        <div style={{ background: 'white', padding: '18px', borderRadius: '22px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}>
                            <ShoppingBag size={36} color="#b62d2d" />
                        </div>
                        <div>
                           <span style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '4px', color: '#fca5a5', textTransform: 'uppercase' }}>BUSINESS MEMBER</span>
                           <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', marginTop: '4px', letterSpacing: '1px' }}>LINKED TO MY CLINIC / SHOP</div>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.0', marginBottom: '35px', letterSpacing: '-3.5px' }}>
                        My Medicine <br/>Hub Center.
                    </h1>
                    <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '50px', lineHeight: '1.7', maxWidth: '620px' }}>
                        Welcome back! Manage your medicine orders, check your account balance, and find the best medicines for your stock.
                    </p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => window.location.href='/app/products'} style={{ background: 'white', color: '#b62d2d', padding: '24px 55px', borderRadius: '25px', fontWeight: '900', fontSize: '18px', border: 'none', cursor: 'pointer', transition: '0.4s', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            BUY MEDICINES
                        </button>
                        <button onClick={() => window.location.href='/app/buyer-orders'} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '24px 50px', borderRadius: '25px', fontWeight: '900', fontSize: '18px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backdropFilter: 'blur(10px)' }}>
                            TRACK MY ORDERS <ChevronRight size={22} />
                        </button>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '45px', padding: '50px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', zIndex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                        {[
                            { label: 'Member Savings', val: 'Low Price Medicines', sub: 'No extra hidden charges', icon: ShieldCheck, iconColor: '#10b981' },
                            { label: 'Delivery Updates', val: 'Live Stock Tracking', sub: 'Fast delivery from stock centers', icon: Truck, iconColor: '#3b82f6' },
                            { label: 'Easy Payments', val: 'Safe Billing', sub: 'Automatic payment to suppliers', icon: CreditCard, iconColor: '#f59e0b' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '18px' }}>
                                    <item.icon size={26} color={item.iconColor} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '900', marginBottom: '4px', letterSpacing: '2px', textTransform: 'uppercase' }}>{item.label}</div>
                                    <div style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{item.val}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>{item.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '35px', marginBottom: '60px' }}>
                {[
                    { label: 'MY ACTIVE ORDERS', value: stats.bulk_orders, id: 'orders', icon: ShoppingCart, color: '#3b82f6', sensitive: false },
                    { label: 'TOTAL LIFETIME SPENT', value: `₹${(stats.total_spent || 0).toLocaleString()}`, id: 'spent', icon: CreditCard, color: '#b62d2d', sensitive: true },
                    { label: 'MY ACCOUNT BALANCE', value: `₹${(stats.wallet_balance || 0).toLocaleString()}`, id: 'wallet', icon: Activity, color: '#10b981', sensitive: true },
                ].map((stat, i) => (
                    <div key={i} className="card hover-up" style={{ padding: '40px', borderRadius: '40px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ background: `${stat.color}10`, padding: '18px', borderRadius: '25px', color: stat.color }}>
                                <stat.icon size={32} />
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', background: '#f8fafc', padding: '6px 15px', borderRadius: '30px', letterSpacing: '1px' }}>UPDATED</div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{stat.label}</h3>
                        </div>
                        <div style={{ fontSize: '42px', color: '#0f172a', fontWeight: '900', letterSpacing: '-1.5px' }}>
                            <SecuredValue id={stat.id} value={stat.value} size="42px" color="#0f172a" isSensitive={stat.sensitive} />
                        </div>
                    </div>
                ))}
            </div>

            {/* My Wholesale Negotiations */}
            <div className="card" style={{ padding: '50px', background: 'white', borderRadius: '45px', border: '1px solid #f1f5f9', marginBottom: '60px' }}>
                <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Clock size={28} color="#b62d2d" /> My Quotation Portfolio
                </h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {inquiries.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', background: '#f8fafc', borderRadius: '30px', color: '#94a3b8', fontWeight: '700', fontStyle: 'italic' }}>
                            No active procurement quotations found. Start by requesting a best-price quote.
                        </div>
                    ) : (
                        inquiries.map((inq) => (
                            <div key={inq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', background: '#f8fafc', borderRadius: '25px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                                    <div style={{ padding: '15px', background: 'white', borderRadius: '18px', color: '#b62d2d' }}><ShoppingBag size={24} /></div>
                                    <div>
                                        <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '18px' }}>{inq.product_id}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{inq.quantity} Units @ ₹{inq.expected_price}/unit</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ 
                                        padding: '10px 25px', borderRadius: '50px', fontSize: '12px', fontWeight: '900',
                                        background: inq.status === 'OPEN' ? '#fff1f2' : (inq.status === 'ACCEPTED' ? '#ecfdf5' : '#f1f5f9'),
                                        color: inq.status === 'OPEN' ? '#be123c' : (inq.status === 'ACCEPTED' ? '#059669' : '#64748b'),
                                        border: `1px solid ${inq.status === 'OPEN' ? '#fecaca' : (inq.status === 'ACCEPTED' ? '#a7f3d0' : '#e2e8f0')}`
                                    }}>
                                        {inq.status}
                                    </span>
                                    <ChevronRight size={20} color="#94a3b8" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                .hover-up { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .hover-up:hover { transform: translateY(-8px); border-color: #b62d2d; box-shadow: 0 30px 60px rgba(0,0,0,0.05); }
                .page-transition { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div className="card" style={{ 
                padding: '80px', 
                textAlign: 'center', 
                background: 'white', 
                borderRadius: '50px', 
                border: '1px solid #f1f5f9',
                boxShadow: '0 40px 80px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '100px', height: '100px', background: '#fef2f2', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 35px', color: '#b62d2d' }}>
                        <ShoppingBag size={54} />
                    </div>
                    <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', letterSpacing: '-2px' }}>Find Best Medicines.</h2>
                    <p style={{ color: '#64748b', fontWeight: '600', maxWidth: '600px', margin: '0 auto 45px', fontSize: '19px', lineHeight: '1.7' }}>
                        Browse our trusted list of medicines. Place orders for your medical shop or clinic directly.
                    </p>
                    <button onClick={() => window.location.href='/app/products'} style={{ background: '#b62d2d', color: 'white', padding: '22px 60px', borderRadius: '22px', fontSize: '18px', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(182, 45, 45, 0.2)' }}>
                        OPEN MEDICINES STORE
                    </button>
                    <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>
                        <HelpCircle size={18} /> Need help? Call Support: +91-8885 XXX XXX
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
