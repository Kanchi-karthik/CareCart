import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileText, ClipboardList, CreditCard, TrendingUp } from 'lucide-react';
import apiClient from '../../utils/axiosConfig';

const ClientDashboard = () => {
    const [stats, setStats] = useState({ bulk_orders: 0, engagements: 0, total_spent: 0 });
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get(`/dashboard?role=CLIENT&userId=${user.user_id}`);
                setStats(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Sync every 30s
        return () => clearInterval(interval);
    }, [user.user_id]);

    return (
        <div className="grid-responsive" style={{ marginBottom: '50px' }}>
            {[
                { label: 'Stock Purchases', value: stats.bulk_orders || 0, icon: ShoppingBag, color: '#e63946' },
                { label: 'Wallet Liquidity', value: `₹${Number(stats.wallet_balance || 0).toLocaleString()}`, icon: CreditCard, color: '#10b981' },
                { label: 'Total Invested', value: `₹${Number(stats.total_spent || 0).toLocaleString()}`, icon: TrendingUp, color: '#3b82f6' }
            ].map((s, idx) => (
                <div key={idx} className="card hover-up" style={{ padding: '35px', borderRadius: '30px', border: '1px solid #f1f5f9', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                         <div style={{ padding: '15px', background: `${s.color}10`, borderRadius: '15px', color: s.color }}><s.icon size={32} /></div>
                    </div>
                    <div style={{ fontSize: s.value.toString().length > 10 ? '32px' : '48px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' }}>{s.value}</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                </div>
            ))}
        </div>
    );
};

export default ClientDashboard;
