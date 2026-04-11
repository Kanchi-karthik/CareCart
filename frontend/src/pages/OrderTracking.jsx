import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Truck, Package, ShieldCheck, MapPin,
    Clock, CreditCard, ChevronRight, Activity, Building2
} from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const OrderTracking = () => {
    const { type, id } = useParams(); // type: b2b or b2c
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const [showPayModal, setShowPayModal] = useState(false);
    const [payLoading, setPayLoading] = useState(false);
    const [payMethod, setPayMethod] = useState('BANK_TRANSFER');

    const handlePayment = async (e) => {
        e.preventDefault();
        setPayLoading(true);
        try {
            await apiClient.post('/payments', {
                order_id: order.order_id,
                amount: order.total_amount,
                mode: payMethod,
                status: 'SUCCESS',
                description: `Bulk Settlement for Wholesale Order ${order.order_id}`
            });
            alert("Wholesale Settlement Confirmed. Tracking updated.");
            setShowPayModal(false);
            fetchOrderDetails();
        } catch (err) {
            alert("Settlement Error: " + (err.response?.data?.message || "Sync Fault"));
        } finally {
            setPayLoading(false);
        }
    };

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const params = user.role === 'SELLER' 
                ? { role: 'seller', seller_id: user.profile_id }
                : { role: 'buyer', id: user.profile_id };
            
            const res = await apiClient.get(`/orders/`, { params });
            const found = res.data.find(o => o.order_id === id);
            setOrder(found);

            // Fetch Real Logs
            const logRes = await apiClient.get(`/orders/`, { params: { action: 'logs', order_id: id } });
            setLogs(logRes.data || []);
        } catch (err) {
            console.error("Tracking fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.profile_id) fetchOrderDetails();
    }, [id, user.profile_id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await apiClient.put(`/orders/`, { 
                order_id: id, 
                status: newStatus,
                changed_by: user.role 
            });
            alert(`Logistics Pipeline Updated: ${newStatus}`);
            fetchOrderDetails();
        } catch (err) {
            alert("Protocol Violation: Status update failed.");
        }
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="spin-loader" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '20px', fontWeight: '900', color: 'var(--velvet-brick)' }}>RETRIEVING ENCRYPTED LOGISTICS DATA...</p>
        </div>
    );

    if (!order) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <h2 style={{ fontWeight: '900', color: 'var(--velvet-brick)' }}>ORDER NOT FOUND</h2>
            <button onClick={() => navigate(-1)} className="btn btn-brick" style={{ marginTop: '20px' }}>BACK TO RECORDS</button>
        </div>
    );

    const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    const currentIdx = statuses.indexOf(order.status) === -1 ? 0 : statuses.indexOf(order.status);

    return (
        <div className="page-transition" style={{ padding: '40px' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '900', cursor: 'pointer', marginBottom: '40px' }}>
                <ArrowLeft size={20} /> BACK TO LIST
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                {/* Main Tracking View */}
                <div>
                    <header style={{ marginBottom: '50px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--velvet-brick)', letterSpacing: '2px' }}>SHIPPING ARCHIVE</span>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-2px' }}>Track Order <span style={{ color: 'var(--vibrant-gold)' }}>#{order.order_id}</span></h1>
                    </header>

                    {/* Dot Tracker Large */}
                    <div className="card" style={{ padding: '60px', borderRadius: '40px', background: 'var(--velvet-dark)', border: '4px solid var(--vibrant-gold)', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zindex: 2 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                                {statuses.map((s, idx) => {
                                    const isActive = idx <= currentIdx;
                                    return (
                                        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, flex: 1 }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: isActive ? 'var(--vibrant-gold)' : 'rgba(255,255,255,0.1)',
                                                border: '4px solid ' + (isActive ? 'white' : 'rgba(255,255,255,0.2)'),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: isActive ? '0 0 20px var(--vibrant-gold)' : 'none',
                                                transition: 'all 0.5s ease'
                                            }}>
                                                {idx === 0 && <Package size={18} color={isActive ? 'var(--velvet-brick)' : 'white'} />}
                                                {idx === 1 && <CreditCard size={18} color={isActive ? 'var(--velvet-brick)' : 'white'} />}
                                                {idx === 2 && <Truck size={18} color={isActive ? 'var(--velvet-brick)' : 'white'} />}
                                                {idx === 3 && <ShieldCheck size={18} color={isActive ? 'var(--velvet-brick)' : 'white'} />}
                                            </div>
                                            <span style={{ marginTop: '15px', fontWeight: '900', color: isActive ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{s}</span>
                                        </div>
                                    );
                                })}
                                {/* Connector Lines */}
                                <div style={{ position: 'absolute', top: '20px', left: '12.5%', right: '12.5%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
                                <div style={{
                                    position: 'absolute', top: '20px', left: '12.5%',
                                    width: `${(currentIdx / (statuses.length - 1)) * 75}%`,
                                    height: '4px', background: 'var(--vibrant-gold)', zIndex: 2,
                                    transition: 'width 1s ease'
                                }}></div>
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <Activity style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '200px', height: '200px', opacity: 0.05, color: 'white' }} />
                    </div>

                    {/* Operational Logs */}
                    <div className="card" style={{ padding: '40px' }}>
                        <h3 style={{ fontWeight: '900', fontSize: '24px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={24} color="var(--velvet-brick)" /> Logistics Telemetry Logs
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {logs.length > 0 ? logs.map((log, i) => (
                                <div key={i} style={{ display: 'flex', gap: '20px', paddingLeft: '20px', borderLeft: '3px solid ' + (i === 0 ? 'var(--vibrant-gold)' : '#eee') }}>
                                    <div style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '12px' }}>{log.log_time}</div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '16px' }}>{log.description}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>HUB_EVENT: {log.event_type} | LOC: {log.location}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ display: 'flex', gap: '20px', paddingLeft: '20px', borderLeft: '3px solid #eee' }}>
                                    <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-muted)' }}>Synchronizing with Logistics Hub... Initial Node Established.</div>
                                </div>
                            )}
                            
                            {/* Fallback mock logs if no real logs yet to keep UI alive */}
                            {logs.length === 0 && (
                                <div style={{ opacity: 0.5 }}>
                                    {[
                                        { time: 'T-00:45', msg: 'Order received at K-Cart Distribution Center.', status: 'PENDING' },
                                        { time: 'T-01:10', msg: 'Safe Settlement confirmed via Hub.', status: 'PAID' }
                                    ].filter(log => statuses.indexOf(log.status) <= currentIdx).reverse().map((log, i) => (
                                        <div key={'mock-'+i} style={{ display: 'flex', gap: '20px', paddingLeft: '20px', borderLeft: '3px solid #eee', marginTop: '15px' }}>
                                            <div style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '14px' }}>{log.time}</div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '16px' }}>{log.msg}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div style={{ marginTop: '130px' }}>
                    <div className="card" style={{ padding: '35px', background: '#f8fafc', border: '3px solid #eee', marginBottom: '30px' }}>
                        <h4 style={{ fontWeight: '900', color: '#94a3b8', fontSize: '12px', letterSpacing: '1px', marginBottom: '20px' }}>NODE DETAILS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--velvet-brick)' }}>PRODUCT RESOURCE</div>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{order.product_name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--velvet-brick)' }}>PROCUREMENT QTY</div>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{order.quantity} Units</div>
                            </div>
                            <div style={{ padding: '15px', background: 'white', borderRadius: '15px', border: '1px solid #eee' }}>
                                <div style={{ fontSize: '12px', fontWeight: '900', color: '#64748b' }}>SETTLEMENT VALUE</div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--velvet-brick)' }}>₹{Number(order.total_amount).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {(user.role === 'CLIENT' && order.status === 'PENDING') && (
                        <div className="card" style={{ padding: '35px', background: 'var(--vibrant-gold)', border: '2px solid var(--velvet-brick)' }}>
                            <h4 style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '12px', letterSpacing: '1px', marginBottom: '20px' }}>WHOLESALE SETTLEMENT</h4>
                            <p style={{ fontSize: '14px', color: 'var(--velvet-dark)', fontWeight: '700', marginBottom: '25px' }}>This bulk procurement requires authorization before freight dispatch.</p>
                            <button
                                onClick={() => setShowPayModal(true)}
                                className="btn btn-brick"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}
                            >
                                <CreditCard size={20} /> AUTHORIZE BULK PAY
                            </button>
                        </div>
                    )}

                    {(user.role === 'RETAILER' || user.role === 'ADMIN') && (
                        <div className="card" style={{ padding: '35px' }}>
                            <h4 style={{ fontWeight: '900', color: '#94a3b8', fontSize: '12px', letterSpacing: '1px', marginBottom: '20px' }}>OPERATIONS HUB</h4>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '20px' }}>Update shipment status for this medical procurement.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {statuses.map((s, idx) => {
                                    const isPast = idx < currentIdx;
                                    const isCurrent = idx === currentIdx;

                                    return (
                                        <button
                                            key={s}
                                            disabled={isPast || isCurrent}
                                            onClick={() => handleStatusUpdate(s)}
                                            className="btn"
                                            style={{
                                                width: '100%', padding: '15px',
                                                background: isCurrent ? 'var(--velvet-brick)' : 'white',
                                                color: isCurrent ? 'white' : 'var(--velvet-brick)',
                                                border: '2px solid var(--velvet-brick)',
                                                fontWeight: '900', fontSize: '14px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                opacity: isPast ? 0.4 : 1,
                                                cursor: (isPast || isCurrent) ? 'not-allowed' : 'pointer',
                                                filter: isPast ? 'grayscale(1)' : 'none'
                                            }}
                                        >
                                            {s} {isCurrent && <ShieldCheck size={18} />}
                                            {isPast && <Activity size={16} opacity={0.5} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Building2 size={40} color="#e2e8f0" style={{ margin: '0 auto 20px' }} />
                        <p style={{ fontSize: '12px', fontWeight: '800', color: '#cbd5e1' }}>CARECART TRUSTED LOGISTICS NETWORK v4.0</p>
                    </div>
                </div>
            </div>

            {showPayModal && (
                <div className="modal-overlay">
                    <div className="modal-content page-transition" style={{ maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>Bulk Settlement</h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginBottom: '30px' }}>Authorizing payment for Wholesale Order #{order.order_id}</p>

                        <div style={{ padding: '20px', background: 'var(--velvet-dark)', borderRadius: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', border: '3px solid var(--vibrant-gold)' }}>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '900', opacity: 0.7 }}>WHOLESALE TOTAL</div>
                                <div style={{ fontSize: '28px', fontWeight: '900' }}>₹{Number(order.total_amount).toLocaleString()}</div>
                            </div>
                            <ShieldCheck size={32} color="var(--vibrant-gold)" />
                        </div>

                        <form onSubmit={handlePayment}>
                            <label className="form-label">Settlement Architecture</label>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                                <button type="button" onClick={() => setPayMethod('BANK_TRANSFER')} className="btn" style={{ flex: 1, padding: '15px', background: payMethod === 'BANK_TRANSFER' ? 'var(--vibrant-gold)' : '#f8fafc', border: payMethod === 'BANK_TRANSFER' ? '2px solid var(--velvet-brick)' : '2px solid #eee', color: payMethod === 'BANK_TRANSFER' ? 'var(--velvet-dark)' : '#64748b', fontSize: '11px' }}>BANK TRANSFER</button>
                                <button type="button" onClick={() => setPayMethod('BULK_CARD')} className="btn" style={{ flex: 1, padding: '15px', background: payMethod === 'BULK_CARD' ? 'var(--vibrant-gold)' : '#f8fafc', border: payMethod === 'BULK_CARD' ? '2px solid var(--velvet-brick)' : '2px solid #eee', color: payMethod === 'BULK_CARD' ? 'var(--velvet-dark)' : '#64748b', fontSize: '11px' }}>BULK CARD</button>
                            </div>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button type="button" onClick={() => setShowPayModal(false)} className="btn" style={{ flex: 1, border: '1px solid #eee' }}>ABORT</button>
                                <button type="submit" disabled={payLoading} className="btn btn-brick" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    {payLoading ? 'SETTLING...' : <><CreditCard size={20} /> AUTHORIZE PAY</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
        .spin-loader {
          width: 50px; height: 50px; border: 5px solid var(--vibrant-gold); border-top-color: var(--velvet-brick);
          border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default OrderTracking;
