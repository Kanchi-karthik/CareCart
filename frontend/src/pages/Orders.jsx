import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, FileText, CheckCircle2, MoreHorizontal, Clock, Truck, ShieldCheck, XCircle } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const userRole = JSON.parse(sessionStorage.getItem('user') || '{}').role || 'BUYER';
    const profileId = JSON.parse(sessionStorage.getItem('user') || '{}').profile_id;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = userRole === 'ADMIN' ? { action: 'all' } : (
                userRole === 'SELLER' 
                  ? { role: 'seller', seller_id: profileId }
                  : { role: 'buyer', id: profileId }
            );
            const res = await apiClient.get('/orders/', { params });
            setOrders(res.data || []);
        } catch (err) {
            console.error("Ledger fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("CRITICAL: Terminate this procurement thread and initiate fund reversal?")) return;
        try {
            const res = await apiClient.put('/orders/', {
                order_id: orderId,
                status: 'CANCELLED'
            });
            if (res.data.status === 'success') {
                alert("Procurement Node Terminated. Economic reversal initiated.");
                fetchOrders();
            } else {
                alert(res.data.message || "Termination request denied by Registry.");
            }
        } catch (err) { alert("Termination protocol failed."); }
    };

    const formatPrice = (val) => {
        const n = Number(val);
        return isNaN(n) ? "0.00" : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="page-transition" style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>
                 {userRole === 'SELLER' ? 'Sales Orders' : 'My Orders'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '600', marginBottom: '40px' }}>
                Track and manage your institutional medicine orders.
            </p>

            <div style={{ background: 'white', borderRadius: '30px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            <th style={{ padding: '25px', textAlign: 'left' }}>Order ID & Date</th>
                            <th style={{ padding: '25px', textAlign: 'left' }}>Product Details</th>
                            <th style={{ padding: '25px', textAlign: 'left' }}>Price</th>
                            <th style={{ padding: '25px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '25px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center', fontWeight: '900', color: '#b62d2d' }}>LOADING YOUR ORDERS...</td></tr>
                        ) : orders.length > 0 ? orders.map(order => (
                             <tr key={order.order_id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/app/orders/tracking/b2b/${order.order_id}`)}>
                                <td style={{ padding: '25px' }}>
                                   <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '15px' }}>#{order.order_id}</div>
                                   <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', marginTop: '4px' }}>{order.order_date || 'Today'}</div>
                                </td>
                                <td style={{ padding: '25px' }}>
                                    <div style={{ color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>{order.product_name || 'Medical Supplies'}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>{order.quantity} Units | Verified Seller</div>
                                </td>
                                <td style={{ padding: '25px', fontWeight: '900', color: '#b62d2d', fontSize: '18px' }}>
                                    ₹{formatPrice(order.total_amount || order.grand_total)}
                                </td>
                                <td style={{ padding: '25px' }}>
                                    <span style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '8px 18px', borderRadius: '20px', fontSize: '11px', fontWeight: '900',
                                        background: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#ecfdf5' : order.status === 'CANCELLED' ? '#fef2f2' : '#fff7ed',
                                        color: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#10b981' : order.status === 'CANCELLED' ? '#ef4444' : '#f59e0b',
                                        border: `1px solid ${order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#bbf7d0' : order.status === 'CANCELLED' ? '#fecaca' : '#fed7aa'}`
                                    }}>
                                        {order.status === 'DELIVERED' || order.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : order.status === 'CANCELLED' ? <XCircle size={14} /> : <Truck size={14} />}
                                        {order.status || 'PREPARING'}
                                    </span>
                                </td>
                                <td style={{ padding: '25px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        {order.status === 'PENDING' && (
                                            <button 
                                                onClick={() => handleCancelOrder(order.order_id)}
                                                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 15px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                                            >
                                                CANCEL
                                            </button>
                                        )}
                                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreHorizontal size={24} /></button>
                                    </div>
                                </td>
                             </tr>
                        )) : (
                            <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center' }}>
                                <ShoppingCart size={48} color="#e2e8f0" style={{ marginBottom: '20px' }} />
                                <p style={{ fontWeight: '800', color: '#94a3b8' }}>No active orders found.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <style>{`
                tr:hover { background: #fdfaf7; transform: scale(1.002); box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
            `}</style>
        </div>
    );
}
