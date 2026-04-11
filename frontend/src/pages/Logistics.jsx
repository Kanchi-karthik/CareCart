import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Search, Package, Clock, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

export default function Logistics() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchLogisticsData = async () => {
        try {
            setLoading(true);
            const params = user.role === 'ADMIN' ? { action: 'all' } : (
                user.role === 'SELLER' 
                  ? { role: 'seller', seller_id: user.profile_id }
                  : { role: 'buyer', id: user.profile_id }
            );
            const res = await apiClient.get('/orders/', { params });
            // Only show active or recently changed orders in logistics hub
            setOrders(res.data || []);
        } catch (err) {
            console.error("Logistics sync failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogisticsData();
        const interval = setInterval(fetchLogisticsData, 60000);
        return () => clearInterval(interval);
    }, []);

    const filteredOrders = orders.filter(o => 
        o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (o.product_name && o.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-transition" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                    <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900', display: 'inline-block', marginBottom: '15px', letterSpacing: '1px' }}>REAL-TIME TELEMETRY</div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3px' }}>Global Logistics Hub.</h1>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600', maxWidth: '600px' }}>Monitor the molecular flow of medical inventory across the institutional grid.</p>
                </div>
                <div style={{ display: 'flex', gap: '30px', textAlign: 'right' }}>
                    <div><div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>{orders.length}</div><div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>ACTIVE THREADS</div></div>
                    <div><div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>{orders.filter(o => o.status === 'DELIVERED').length}</div><div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>COMPLETED</div></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                <div style={{ background: 'white', borderRadius: '45px', padding: '50px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Activity size={32} color="#b62d2d" /> Live Procurement Movement
                        </h2>
                        <div style={{ display: 'flex', gap: '15px', background: '#f8fafc', padding: '15px 30px', borderRadius: '25px', border: '1px solid #e2e8f0', width: '400px' }}>
                            <Search size={22} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Filter by Order ID or Medicine Name..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: '700', fontSize: '15px', width: '100%' }} 
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {loading && orders.length === 0 ? (
                            <div style={{ padding: '100px', textAlign: 'center', fontWeight: '900', color: '#94a3b8' }}>POLLING LOGISTICS CLOUD GATEWAY...</div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div 
                                    key={order.order_id} 
                                    onClick={() => navigate(`/app/orders/tracking/b2b/${order.order_id}`)}
                                    style={{ 
                                        border: '1px solid #f1f5f9', background: '#fcfdfe', borderRadius: '30px', 
                                        padding: '35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                        cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
                                    }}
                                    className="logistics-node"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', position: 'relative', zIndex: 2 }}>
                                        <div style={{ 
                                            background: order.status === 'DELIVERED' ? '#ecfdf5' : '#eff6ff', 
                                            width: '80px', height: '80px', borderRadius: '25px', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: order.status === 'DELIVERED' ? '#10b981' : '#3b82f6'
                                        }}>
                                            {order.status === 'DELIVERED' ? <ShieldCheck size={40} /> : <Truck size={40} />}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{order.product_name || 'Distributed Medicine'}</h3>
                                                <span style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8' }}>#TR-{order.order_id}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '25px', marginTop: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', fontWeight: '700' }}>
                                                    <Package size={16} /> {order.quantity} Units Secured
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', fontWeight: '700' }}>
                                                    <MapPin size={16} /> {order.shipping_address?.split('|')[0]?.trim() || 'Institutional Site'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ textAlign: 'right', position: 'relative', zIndex: 2 }}>
                                        <div style={{ 
                                            background: order.status === 'DELIVERED' ? '#ecfdf5' : (order.status === 'CANCELLED' ? '#fef2f2' : '#fff7ed'), 
                                            color: order.status === 'DELIVERED' ? '#10b981' : (order.status === 'CANCELLED' ? '#ef4444' : '#f59e0b'), 
                                            padding: '12px 25px', borderRadius: '20px', fontSize: '12px', fontWeight: '900', display: 'inline-block',
                                            letterSpacing: '1px', border: `1px solid ${order.status === 'DELIVERED' ? '#bbf7d0' : (order.status === 'CANCELLED' ? '#fecaca' : '#fed7aa')}`
                                        }}>
                                            {order.status?.toUpperCase() || 'IN SYNC'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                            <Clock size={16} color="#94a3b8" />
                                            <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>
                                                {order.status === 'DELIVERED' ? 'Arrived at Site' : (order.status === 'CANCELLED' ? 'Reversal Logged' : 'ETA: 48h - Standard Cargo')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Line Background */}
                                    <div style={{ 
                                        position: 'absolute', bottom: 0, left: 0, height: '6px', 
                                        background: order.status === 'DELIVERED' ? '#10b981' : (order.status === 'CANCELLED' ? '#ef4444' : '#3b82f6'), 
                                        width: order.status === 'DELIVERED' ? '100%' : (order.status === 'PENDING' ? '30%' : (order.status === 'SHIPPED' ? '70%' : '0%')),
                                        transition: 'width 2s ease-in-out'
                                    }}></div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '80px', textAlign: 'center', border: '3px dashed #f1f5f9', borderRadius: '35px' }}>
                                <Package size={60} color="#e2e8f0" style={{ margin: '0 auto 25px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#94a3b8' }}>No Molecular Movement Detected.</h3>
                                <p style={{ color: '#cbd5e1', fontWeight: '800', fontSize: '13px', marginTop: '10px' }}>Logistics grid is currently idle for the current clinical scope.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .logistics-node:hover {
                    box-shadow: 0 15px 40px rgba(0,0,0,0.06);
                    background: white !important;
                    transform: translateY(-4px);
                }
            `}</style>
        </div>
    );
}
