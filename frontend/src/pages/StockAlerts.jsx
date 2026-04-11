import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldCheck, ArrowRight, Star, Zap, Trash2, CheckCircle } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/stock-alerts');
      // Filter for only active alerts
      setAlerts(res.data.filter(a => a.is_active));
    } catch (err) {
      console.error("Alert registry sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await apiClient.put('/stock-alerts', { alert_id: id });
      fetchAlerts();
    } catch (err) {
      alert("Resolution Error: Database pulse lost.");
    }
  };

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Stock Watch</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '22px', fontWeight: '700' }}>Automated monitoring of all <span style={{ color: 'var(--velvet-brick)', fontWeight: '900' }}>K-Cart</span> medical reserves.</p>
        </div>
        <button
          onClick={() => alert("Alert configuration panel is being initialized in the core node.")}
          className="btn btn-gold"
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <Zap size={24} /> CONFIGURE ALERTS
        </button>
      </div>

      <div className="grid-responsive" style={{ marginBottom: '60px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'Active Tasks', value: alerts.length, icon: AlertTriangle, color: '#e74c3c' },
          { label: 'System Uptime', value: '99.9%', icon: Bell, color: '#f1c40f' },
          { label: 'Network Guard', value: 'Active', icon: ShieldCheck, color: '#27ae60' }
        ].map((s, i) => (
          <div key={i} className="card" style={{ borderLeft: `10px solid ${s.color}`, padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: s.color }}>
              <s.icon size={36} />
            </div>
            <div style={{ fontSize: '48px', fontWeight: '900' }}>{s.value}</div>
            <div style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: '800' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '4px solid #f1f5f9' }}>
        <div style={{ padding: '30px', background: 'var(--velvet-brick)', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Star size={24} color="var(--vibrant-gold)" fill="var(--vibrant-gold)" />
          <h3 style={{ fontSize: '26px', fontWeight: '900' }}>Active Monitoring Log</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '3px solid #eee' }}>
              <th style={{ padding: '25px' }}>Alert ID</th>
              <th>Product Ref</th>
              <th>Alert Type</th>
              <th>Logged Date</th>
              <th>Action Needed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid var(--vibrant-gold)', borderTopColor: 'var(--velvet-brick)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              </td></tr>
            ) : alerts.length > 0 ? alerts.map(a => (
              <tr key={a.alert_id} style={{ borderBottom: '2px solid #f8fafc' }}>
                <td style={{ padding: '25px', fontWeight: '800', color: '#94a3b8' }}>#ALT-{a.alert_id}</td>
                <td style={{ fontWeight: '900', fontSize: '18px' }}>{a.product_id}</td>
                <td>
                  <span className={`badge-vibrant ${a.alert_type === 'LOW STOCK' ? 'badge-danger' : 'badge-warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} /> {a.alert_type}
                  </span>
                </td>
                <td style={{ fontWeight: '800', color: 'var(--text-muted)' }}>{a.created_date}</td>
                <td>
                  <button
                    onClick={() => handleResolve(a.alert_id)}
                    className="btn btn-gold"
                    style={{ padding: '10px 20px', fontSize: '12px', borderRadius: '10px' }}
                  >
                    RESOLVE <CheckCircle size={14} style={{ marginLeft: '8px' }} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ padding: '100px', textAlign: 'center', fontWeight: '800', color: '#94a3b8' }}>
                Shield is secure. No active stock alerts in the registry.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StockAlerts;
