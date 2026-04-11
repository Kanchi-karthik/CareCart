import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Plus, Search, Filter, Star, Truck } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const B2BOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = user.role === 'ADMIN' ? {} : (
        user.role === 'SELLER' 
          ? { role: 'seller', seller_id: user.profile_id }
          : { role: 'buyer', id: user.profile_id }
      );
      
      const res = await apiClient.get('/orders/', { params });
      setOrders(res.data);
    } catch (err) {
      console.error("Order sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = React.useMemo(() => {
    return (orders || []).filter(o => {
      const matchesSearch =
        String(o.order_id).toLowerCase().includes(search.toLowerCase()) ||
        String(o.client_name).toLowerCase().includes(search.toLowerCase()) ||
        String(o.product_name).toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiClient.put('/orders/b2b', { order_id: orderId, status: newStatus });
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Logistics Fault: ${msg}`);
    }
  };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>{user.role === 'ADMIN' ? 'B2B Analytics' : 'Order Hub'}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Supply chain tracking for <span style={{ color: 'var(--velvet-brick)' }}>wholesale medical procurement</span> threads.</p>
                </div>
                <button onClick={() => navigate('/app/products')} className="btn btn-brick" style={{ height: 'fit-content', display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 40px', borderRadius: '20px' }}>
                    <Plus size={26} /> NEW BULK ORDER
                </button>
            </div>

            <div className="filter-hub">
                <div className="search-field">
                    <Search size={20} className="icon" />
                    <input
                        type="text"
                        placeholder="Search Order ID, Client, or Resource..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '8px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            style={{
                                padding: '8px 20px', borderRadius: '15px', border: 'none',
                                background: statusFilter === s ? 'var(--velvet-brick)' : 'transparent',
                                color: statusFilter === s ? 'white' : '#64748b',
                                fontWeight: '900', fontSize: '11px', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="data-grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Clinical Node</th>
                            <th>Provision Details</th>
                            <th>Quantity</th>
                            <th>Valuation</th>
                            <th style={{ textAlign: 'right' }}>Logistics Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '150px', textAlign: 'center' }}>
                                <div style={{ width: '50px', height: '50px', border: '5px solid var(--vibrant-gold)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                            </td></tr>
                        ) : filteredOrders.length > 0 ? filteredOrders.map((o, i) => (
                            <tr
                                key={o.order_id || i}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/app/orders/tracking/b2b/${o.order_id}`)}
                            >
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>#TR-{o.order_id}</code>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '10px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '12px', color: 'var(--vibrant-blue)' }}>
                                            <ShoppingCart size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '16px', color: 'var(--velvet-dark)' }}>{o.client_name || 'Direct Procurement'}</div>
                                            <span className="role-badge client" style={{ fontSize: '9px', padding: '4px 8px' }}>Active Node</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#334155' }}>{o.product_name}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>BATCH-0{o.order_id}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#1e293b' }}>{o.quantity} <span style={{ fontSize: '11px', color: '#94a3b8' }}>UNITS</span></div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '20px' }}>₹{Number(o.total_amount).toLocaleString()}</div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {[
                                                { s: 'PENDING', label: 'Placed' },
                                                { s: 'PAID', label: 'Paid' },
                                                { s: 'SHIPPED', label: 'Freight' },
                                                { s: 'DELIVERED', label: 'Arrival' }
                                            ].map((step, idx, arr) => {
                                                const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
                                                const currentIdx = statuses.indexOf(o.status) === -1 ? 0 : statuses.indexOf(o.status);
                                                const isActive = statuses.indexOf(step.s) <= currentIdx;
                                                return (
                                                    <React.Fragment key={step.s}>
                                                        <div style={{
                                                            width: '6px', height: '6px', borderRadius: '50%',
                                                            background: isActive ? 'var(--vibrant-gold)' : '#e2e8f0',
                                                            boxShadow: isActive ? '0 0 8px var(--vibrant-gold)' : 'none'
                                                        }} />
                                                        {idx < arr.length - 1 && (
                                                            <div style={{ width: '15px', height: '1px', background: statuses.indexOf(arr[idx + 1].s) <= currentIdx ? 'var(--vibrant-gold)' : '#e2e8f0' }} />
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                        <span className={`status ${o.status.toLowerCase()}`} style={{ fontWeight: '900', fontSize: '10px' }}>
                                            {o.status || 'PROCESSING'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', fontWeight: '800', color: '#94a3b8', fontSize: '18px' }}>
                                No active logs in the supply thread.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default B2BOrders;
