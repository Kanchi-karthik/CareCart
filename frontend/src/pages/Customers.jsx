import React, { useState, useEffect } from 'react';
import { Users, Mail, ShieldCheck, Search, Filter, MoreHorizontal, Heart, Star } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/customers/');
      setCustomers(res.data);
    } catch (error) {
      console.error('Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Patients & Clients</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '22px', fontWeight: '700' }}>Managed records of all <span style={{ color: 'var(--velvet-brick)', fontWeight: '900' }}>CareCart</span> verified hospital members.</p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={24} style={{ position: 'absolute', left: '20px', top: '18px', color: 'var(--velvet-brick)' }} />
            <input
              placeholder="Find a member..."
              className="form-input"
              style={{ paddingLeft: '60px', marginBottom: 0, borderRadius: '15px', border: '3px solid var(--vibrant-gold)' }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '4px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--velvet-dark)', borderBottom: '4px solid var(--vibrant-gold)' }}>
            <tr style={{ textAlign: 'left', color: 'white', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              <th style={{ padding: '30px' }}>Member Profile</th>
              <th>Member ID</th>
              <th>Verified Email</th>
              <th>System Status</th>
              <th style={{ paddingRight: '30px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '150px', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', border: '6px solid var(--vibrant-gold)', borderTopColor: 'var(--velvet-brick)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              </td></tr>
            ) : (
              customers.map(c => (
                <tr key={c.customer_id} style={{ borderBottom: '2px solid #f8fafc', transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.background = '#fdfaf7'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <td style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '55px', height: '55px', background: 'var(--velvet-brick)', border: '3px solid var(--vibrant-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '15px', fontWeight: '900', fontSize: '22px', boxShadow: '0 8px 15px rgba(192, 57, 43, 0.2)' }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '18px', color: 'var(--velvet-dark)' }}>{c.name}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Authorized Member</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{ padding: '8px 15px', background: '#f1f5f9', borderRadius: '10px', fontWeight: '800', color: 'var(--velvet-brick)', fontSize: '14px' }}>{c.customer_id}</code></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                      <Mail size={18} color="var(--velvet-brick)" /> {c.email}
                    </div>
                  </td>
                  <td>
                    <span className="badge-vibrant badge-success">CLEARED</span>
                  </td>
                  <td style={{ paddingRight: '30px' }}>
                    <button className="btn" style={{ padding: '12px', background: 'none', color: '#64748b' }}><MoreHorizontal size={24} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
