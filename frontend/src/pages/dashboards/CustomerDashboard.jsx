import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, CreditCard, Heart, TrendingUp } from 'lucide-react';
import apiClient from '../../utils/axiosConfig';

const CustomerDashboard = () => {
    const [stats, setStats] = useState({ my_orders: 0 });
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/dashboard?role=CUSTOMER&userId=${user.user_id}`);
            setStats(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchStats();
    }, [user.user_id]);

    const [loading, setLoading] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="btn"
                    style={{ padding: '10px 20px', fontSize: '12px', background: 'white', border: '2px solid var(--velvet-brick)', color: 'var(--velvet-brick)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}
                >
                    <TrendingUp size={16} /> {loading ? 'SYNCING...' : 'REFRESH STATS'}
                </button>
            </div>
            <div className="grid-responsive" style={{ marginBottom: '50px' }}>
                {[
                    { label: 'My Orders', value: stats.my_orders || 0, icon: Package, color: 'var(--velvet-brick)' },
                    { label: 'Saved Items', value: '0', icon: Heart, color: '#e91e63' }
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

export default CustomerDashboard;
