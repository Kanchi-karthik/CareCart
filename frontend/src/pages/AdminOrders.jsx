import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Eye, EyeOff, CheckCircle, Clock, XCircle, Truck, MapPin } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/orders/?action=all');
            setOrders(res.data || []);
        } catch (err) {
            console.error("Fetch orders failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = React.useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = String(o.order_id).toLowerCase().includes(search.toLowerCase()) || 
                                 String(o.buyer_name || '').toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const stats = {
        total: orders.length,
        revenue: orders.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0),
        pending: orders.filter(o => o.status === 'PENDING').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>All Medicine Orders</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Overview of all medicine sales and stock distribution.</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
                {[
                    { label: 'ORDER COUNT', value: stats.total, color: 'var(--velvet-brick)', icon: ShoppingBag },
                    { label: 'TOTAL SALES', value: `₹${stats.revenue.toLocaleString()}`, color: '#27ae60', icon: CheckCircle },
                    { label: 'PENDING ORDERS', value: stats.pending, color: 'var(--vibrant-gold)', icon: Clock },
                    { label: 'DELIVERED', value: stats.completed, color: 'var(--vibrant-blue)', icon: Truck },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '2px solid #f1f5f9' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="filter-hub" style={{ marginBottom: '40px' }}>
                 <div className="search-field">
                    <Search size={22} className="icon" />
                    <input
                        type="text"
                        placeholder="Filter by Order ID or Buyer Identity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ fontSize: '16px', fontWeight: '700' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input" style={{ marginBottom: 0, width: '180px', borderRadius: '15px', fontWeight: '800', background: 'white' }}>
                        <option value="ALL">All Status</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>
            </div>

            <div className="data-grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Shop Ref</th>
                            <th>Medicine Source</th>
                            <th>Quantity</th>
                            <th>Order Total</th>
                            <th>Status</th>
                            <th>Order Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(o => (
                            <tr key={o.order_id}>
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>#{o.order_id}</code>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px' }}>{o.buyer_name || 'System Bulk'}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>ID: {o.buyer_id}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px' }}>{o.product_name || 'Distributed Units'}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{o.seller_name || 'Global Warehouse'}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '900', fontSize: '18px' }}>{o.quantity}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>UNITS</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '16px' }}>
                                        ₹{Number(o.total_amount).toLocaleString()}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                        padding: '6px 12px', borderRadius: '30px',
                                        background: o.status === 'COMPLETED' ? '#ecfdf5' : o.status === 'PENDING' ? '#fefce8' : '#fff1f2',
                                        color: o.status === 'COMPLETED' ? '#059669' : o.status === 'PENDING' ? '#ca8a04' : '#e11d48',
                                        fontSize: '11px', fontWeight: '900'
                                    }}>
                                        {o.status === 'COMPLETED' ? <CheckCircle size={12} /> : o.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                                        {o.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>{o.order_date || 'RECENT'}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px', background: 'white' }}>
                         <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                         <p style={{ fontWeight: '800', color: '#94a3b8' }}>No transactions found in this node.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
