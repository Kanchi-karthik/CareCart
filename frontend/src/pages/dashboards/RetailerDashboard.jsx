import React, { useState, useEffect } from 'react';
import { Package, Truck, Activity, TrendingUp, ShoppingBag, Database } from 'lucide-react';
import apiClient from '../../utils/axiosConfig';

const RetailerDashboard = () => {
    const [realStats, setRealStats] = useState({ my_products: 0 });
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/dashboard?role=RETAILER&userId=${user.user_id}`);
            setRealStats(res.data);
        } catch (err) {
            console.error("Stats fetch failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const refreshInterval = setInterval(fetchStats, 30000);
        return () => clearInterval(refreshInterval);
    }, [user.user_id]);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="btn"
                    style={{ padding: '10px 20px', fontSize: '12px', background: 'white', border: '2px solid var(--velvet-brick)', color: 'var(--velvet-brick)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
                >
                    <Activity size={16} /> {loading ? 'SYNCING...' : 'REFRESH INVENTORY'}
                </button>
            </div>
            <div className="grid-responsive" style={{ marginBottom: '50px' }}>
                {[
                    { label: 'Total Medicine Stock', value: realStats.my_products || 0, icon: Package, color: 'var(--velvet-brick)' },
                    { label: 'Outgoing Wholesale', value: realStats.active_shipments || 0, icon: Truck, color: 'var(--vibrant-gold)' },
                    { label: 'Low Stock Warnings', value: realStats.stock_alerts || 0, icon: Activity, color: '#e74c3c' },
                    { label: 'Wholesale Revenue', value: `?${realStats.b2b_sales || 0}`, icon: TrendingUp, color: '#27ae60' }
                ].map((s, idx) => (
                    <div key={idx} className="card" style={{ padding: '35px', borderRadius: '30px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <div style={{ padding: '15px', background: `${s.color}10`, borderRadius: '15px', color: s.color }}><s.icon size={32} /></div>
                            <TrendingUp size={24} color="#27ae60" />
                        </div>
                        <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{s.value}</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-muted)', marginTop: '5px' }}>{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RetailerDashboard;
