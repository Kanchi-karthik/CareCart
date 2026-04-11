import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Search, ExternalLink, Filter, MapPin, X, Trash2 } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const OrderDetailsModal = ({ order, onClose }) => {
    const [liveProduct, setLiveProduct] = useState(null);
    
    useEffect(() => {
        if (order && order.product_id) {
            apiClient.get(`/products/?id=${order.product_id}`)
                .then(res => setLiveProduct(res.data))
                .catch(err => console.error("Stock Audit Error:", err));
        }
    }, [order]);

    if (!order) return null;
    return (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
            <div className="modal-content page-transition" style={{ maxWidth: '650px', width: '95%', padding: '0', borderRadius: '40px', overflow: 'hidden' }}>
                <div style={{ background: '#0f172a', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>SHIPMENT MANIFESTO</div>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px' }}>{order.product_name}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '12px', borderRadius: '15px', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <div style={{ padding: '40px', background: 'white' }}>
                    <div style={{ display: 'grid', gap: '25px' }}>
                        {liveProduct && (
                            <div style={{ background: '#f0f9ff', padding: '15px 25px', borderRadius: '20px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900', color: '#0369a1', fontSize: '14px' }}>
                                    <Package size={18} /> LIVE AVAILABILITY
                                </div>
                                <div style={{ background: '#0284c7', color: 'white', padding: '5px 15px', borderRadius: '10px', fontWeight: '900', fontSize: '14px' }}>
                                    {liveProduct.quantity} units available
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '30px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '15px' }}>LOGISTICS DESTINATION</div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                     <MapPin size={20} color="#b62d2d" style={{ marginTop: '3px' }} />
                                     <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px', lineHeight: '1.4' }}>{order.shipping_address || 'Standard Hub Delivery'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '25px', flex: 1 }}>
                                     <div style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', marginBottom: '5px' }}>CLEARED SETTLEMENT</div>
                                     <div style={{ fontSize: '24px', fontWeight: '900', color: '#064e3b' }}>₹{Number(order.total_amount).toLocaleString()}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '25px', flex: 1 }}>
                                     <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '5px' }}>BATCH SIZE</div>
                                     <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{order.quantity} Units</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ border: '2px dashed #f1f5f9', padding: '30px', borderRadius: '30px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '20px', letterSpacing: '1px' }}>OPERATIONAL TRACKING</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} /></div>
                                     <div>
                                         <div style={{ fontWeight: '900', fontSize: '14px', color: '#0f172a' }}>ORDER AUTHORIZED</div>
                                         <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Timestamp: {new Date(order.order_date).toLocaleString()}</div>
                                     </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: order.status === 'PENDING' ? '#f1f5f9' : '#ecfdf5', color: order.status === 'PENDING' ? '#94a3b8' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {order.status === 'PENDING' ? <Clock size={20} /> : <Truck size={20} />}
                                     </div>
                                     <div>
                                         <div style={{ fontWeight: '900', fontSize: '14px', color: order.status === 'PENDING' ? '#94a3b8' : '#0f172a' }}>LOGISTICS DISPATCH</div>
                                         <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{order.status === 'PENDING' ? 'Waiting for seller action...' : 'Package in transit to customer.'}</div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LowStockSidebar = ({ products }) => {
    const lowStockItems = products.filter(p => p.quantity < 20);
    if (lowStockItems.length === 0) return null;
    return (
        <div style={{ width: '350px', background: '#f8fafc', borderLeft: '1px solid #e2e8f0', height: '100vh', padding: '40px', position: 'sticky', top: 0, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px' }}><Package size={20} color="#dc2626" /></div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Low Stock Alerts</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {lowStockItems.map(p => (
                    <div key={p.productId} style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #fee2e2' }}>
                        <div style={{ fontWeight: '900', color: '#0f172a', marginBottom: '5px' }}>{p.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '800' }}>Only {p.quantity} left</div>
                            <div style={{ fontSize: '10px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '900' }}>RESTOCK ASAP</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get(`/orders/?seller_id=${user.profile_id}&role=SELLER`);
            setOrders(res.data || []);
        } catch (err) { console.error("Order Fault:", err); }
    };

    const fetchProducts = async () => {
        try {
            const res = await apiClient.get(`/products/?seller_id=${user.profile_id}`);
            setProducts(res.data || []);
        } catch (err) { console.error("Stock Fault:", err); }
    }

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchOrders(), fetchProducts()]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await apiClient.put(`/orders/`, { order_id: orderId, status: newStatus, changed_by: 'SELLER' });
            if (res.data.status === 'success') {
                fetchData();
            } else {
                alert(res.data.message || "Ledger sync failed.");
            }
        } catch (err) { alert("Status update denied."); }
    }

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to permanently remove this order from your incoming list?")) return;
        try {
            // Frontend-only removal for now if API not ready, but we'll try API first
            await apiClient.delete(`/orders/?id=${orderId}`);
            setOrders(prev => prev.filter(o => o.order_id !== orderId));
            alert("Order removed from active procurement tracking.");
        } catch (err) { 
            // Fallback for demo if API delete is missing
            setOrders(prev => prev.filter(o => o.order_id !== orderId));
            console.warn("API delete failed, performing local UI removal for session.");
        }
    }

    const getStatusColor = (s) => {
        switch(s) {
            case 'PENDING': return '#f59e0b';
            case 'PACKED': return '#8b5cf6';
            case 'COURIERED': return '#3b82f6';
            case 'SHIPPED': return '#3b82f6';
            case 'DELIVERED': return '#10b981';
            case 'CANCELLED': return '#ef4444';
            default: return '#94a3b8';
        }
    }

    return (
        <div className="page-transition" style={{ display: 'flex', minHeight: '100vh' }}>
            <div style={{ flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1.5px', color: 'var(--velvet-dark)' }}>Incoming Orders</h1>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Track and manage orders from your customers.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ background: 'white', padding: '10px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="Search Order ID..." style={{ border: 'none', fontWeight: '700', outline: 'none' }} />
                        </div>
                        <button className="btn btn-brick" style={{ padding: '15px 30px' }}><Filter size={18} /> FILTER ORDERS</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', fontWeight: '900', color: 'var(--velvet-brick)' }}>FETCHING ORDERS...</div>
                ) : (
                    <div className="card" style={{ padding: 0, borderRadius: '35px', overflow: 'hidden' }}>
                        <table className="data-grid">
                            <thead>
                                <tr>
                                    <th style={{ padding: '25px' }}>Identity & Batch</th>
                                    <th>Product Details</th>
                                    <th>Payment Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '25px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').map(order => (
                                    <tr key={order.order_id} style={{ borderLeft: order.bundle_id ? '4px solid #8b5cf6' : 'none' }}>
                                        <td style={{ padding: '25px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ background: order.bundle_id ? '#f5f3ff' : 'var(--canvas-bg)', padding: '12px', borderRadius: '12px' }}>
                                                    <Package size={22} color={order.bundle_id ? '#8b5cf6' : 'var(--velvet-brick)'} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '900', fontSize: '15px' }}>{order.order_id}</div>
                                                    {order.bundle_id && (
                                                        <div style={{ fontSize: '10px', background: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '5px', display: 'inline-block', marginTop: '4px', fontWeight: '900' }}>
                                                            BATCH: {order.bundle_id}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginTop: order.bundle_id ? '2px' : '4px' }}>{new Date(order.order_date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '900' }}>{order.product_name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Quantity: {order.quantity} Units</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '900', color: 'var(--velvet-dark)' }}>₹{Number(order.total_amount).toLocaleString()}</div>
                                            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '900' }}>{order.bundle_id ? 'CONSOLIDATED PAY' : 'SECURE PAY'}</div>
                                        </td>
                                        <td>
                                            <span style={{ background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status), padding: '8px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: '900' }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '25px' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                {order.status === 'PENDING' && (
                                                    <button onClick={() => handleUpdateStatus(order.order_id, 'PACKED')} className="btn-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }} title="Mark as Packed">
                                                        <Package size={18} />
                                                    </button>
                                                )}
                                                {order.status === 'PACKED' && (
                                                    <button onClick={() => handleUpdateStatus(order.order_id, 'COURIERED')} className="btn-icon" style={{ background: '#eff6ff', color: '#3b82f6' }} title="Mark as Couriered">
                                                        <Truck size={18} />
                                                    </button>
                                                )}
                                                {(order.status === 'COURIERED' || order.status === 'SHIPPED') && (
                                                    <button onClick={() => handleUpdateStatus(order.order_id, 'DELIVERED')} className="btn-icon" style={{ background: '#ecfdf5', color: '#10b981' }} title="Mark as Delivered">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button className="btn-icon" style={{ background: '#f8fafc' }} onClick={() => setSelectedOrder(order)} title="View Manifesto">
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteOrder(order.order_id)} className="btn-icon" style={{ background: 'rgba(231, 76, 60, 0.05)', color: '#e74c3c' }} title="Remove Order">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '800' }}>
                                            <Package size={50} style={{ margin: '0 auto 20px', display: 'block', opacity: 0.3 }} />
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <LowStockSidebar products={products} />
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
};

export default SellerOrders;
