import React, { useState, useEffect } from 'react';
import { Pill, ShoppingCart, Users, TrendingUp, AlertTriangle, Plus, Edit2, Trash2, Shield, Activity, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [inquiries, setInquiries] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const res = await apiClient.get('/inquiries');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Inquiry Load Trace Failed:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch live statistics from the dedicated dashboard API
      const statsRes = await apiClient.get('/dashboard/admin');
      const d = statsRes.data || {};

      setStats({
        totalProducts: d.total_products || 0,
        totalOrders: (d.b2b_orders || 0) + (d.b2c_orders || 0),
        totalUsers: d.total_users || 0,
        totalRevenue: d.total_revenue || 0
      });

      // Fetch pending lists for approvals
      const retailersRes = await apiClient.get('/retailers');
      setRetailers(retailersRes.data || []);

      const consultantsRes = await apiClient.get('/consultants');
      setConsultants(consultantsRes.data || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id, status) => {
    if (!window.confirm(`Escalate inquiry status to ${status}?`)) return;
    try {
      await apiClient.put(`/inquiries?id=${id}&status=${status}`);
      alert('Internal state updated.');
      loadInquiries();
    } catch (err) {
      alert('Update failed in neural tier.');
    }
  };

  const approveRetailer = async (retailerId) => {
    try {
      await apiClient.put(`/retailers/${retailerId}`, {
        status: 'ACTIVE'
      });
      alert('Retailer approved successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error approving retailer:', error);
      alert('Failed to approve retailer');
    }
  };

  const approveConsultant = async (consultantId) => {
    try {
      await apiClient.put(`/consultants/${consultantId}`, {
        status: 'ACTIVE'
      });
      alert('Consultant approved successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error approving consultant:', error);
      alert('Failed to approve consultant');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>System Architecture</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Real-time telemetry and management of the <span style={{ color: 'var(--velvet-brick)' }}>CareCart Neural Hub</span>.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', background: 'var(--velvet-dark)', color: 'white', padding: '15px 30px', borderRadius: '20px', border: '2px solid var(--vibrant-gold)' }}>
                    <Shield size={24} color="var(--vibrant-gold)" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', opacity: 0.7 }}>CONTROL PLANE</span>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>ROOT AUTHORIZED</span>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                {[
                    { label: 'PRODUCT NODES', value: stats.totalProducts, icon: Pill, color: 'var(--velvet-brick)' },
                    { label: 'TRANSACTION THREADS', value: stats.totalOrders, icon: ShoppingCart, color: 'var(--vibrant-blue)' },
                    { label: 'PLATFORM ENTITIES', value: stats.totalUsers, icon: Users, color: 'var(--vibrant-purple)' },
                    { label: 'GROSS VALUATION', value: `?${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'var(--vibrant-gold)' }
                ].map((stat, i) => (
                    <div key={i} className="stat-card" style={{ borderLeft: `6px solid ${stat.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', letterSpacing: '1px' }}>{stat.label}</span>
                            <stat.icon size={20} style={{ color: stat.color }} />
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#27ae60', marginTop: '10px' }}>+12.5% from baseline</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px' }}>
                <div className="card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '900' }}>Wholesale Negotiation Hub</h3>
                        <Activity size={20} color="var(--velvet-brick)" />
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>
                                    <th style={{ padding: '15px' }}>INQUIRY ID</th>
                                    <th>PRODUCT NODE</th>
                                    <th>BUYER ENTITY</th>
                                    <th>VOLUME</th>
                                    <th>PROPOSED PRICE</th>
                                    <th>NEGOTIATION STATUS</th>
                                    <th style={{ textAlign: 'right', paddingRight: '15px' }}>OPERATIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic', background: '#f8fafc', borderRadius: '20px' }}>
                                            No procurement threads detected in the neural hub.
                                        </td>
                                    </tr>
                                ) : (
                                    inquiries.map((inq) => (
                                        <tr key={inq.id} style={{ background: '#f8fafc', borderRadius: '20px' }}>
                                            <td style={{ padding: '20px', fontWeight: '900', fontSize: '12px', color: '#64748b', borderTopLeftRadius: '15px', borderBottomLeftRadius: '15px' }}>{inq.id?.substring(0, 8)}</td>
                                            <td style={{ fontWeight: '700' }}>{inq.product_id}</td>
                                            <td style={{ fontSize: '13px', fontWeight: '600' }}>
                                                <div>{inq.full_name || 'Anonymous Provider'}</div>
                                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{inq.email}</div>
                                            </td>
                                            <td style={{ fontWeight: '900', color: 'var(--velvet-dark)' }}>{inq.quantity || 'Sample'}</td>
                                            <td style={{ fontWeight: '900', color: 'var(--velvet-brick)' }}>₹{inq.expected_price || '0.00'}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '6px 15px', borderRadius: '50px', fontSize: '10px', fontWeight: '900',
                                                    background: inq.status === 'OPEN' ? '#fff1f2' : (inq.status === 'ACCEPTED' ? '#ecfdf5' : '#f1f5f9'),
                                                    color: inq.status === 'OPEN' ? '#be123c' : (inq.status === 'ACCEPTED' ? '#059669' : '#64748b'),
                                                    border: `1px solid ${inq.status === 'OPEN' ? '#fecaca' : (inq.status === 'ACCEPTED' ? '#a7f3d0' : '#e2e8f0')}`
                                                }}>
                                                    {inq.status || 'NEW'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '15px', borderTopRightRadius: '15px', borderBottomRightRadius: '15px' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => updateInquiryStatus(inq.id, 'ACCEPTED')} style={{ padding: '8px', borderRadius: '10px', background: '#ecfdf5', border: 'none', cursor: 'pointer', color: '#059669' }}><CheckCircle size={16} /></button>
                                                    <button onClick={() => updateInquiryStatus(inq.id, 'REJECTED')} style={{ padding: '8px', borderRadius: '10px', background: '#fff1f2', border: 'none', cursor: 'pointer', color: '#be123c' }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '40px' }}>
                <div className="card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '900' }}>Procurement Alerts</h3>
                        <Activity size={20} color="var(--velvet-brick)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button onClick={() => navigate('/app/admin/products')} className="btn" style={{ justifyContent: 'flex-start', gap: '15px', padding: '20px', background: '#f8fafc', border: '2px solid #f1f5f9' }}>
                            <Pill size={20} color="var(--velvet-brick)" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '900', fontSize: '14px' }}>Inventory Synchronization</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Update medical resource stock levels</div>
                            </div>
                        </button>
                        <button onClick={() => navigate('/app/admin/retailers')} className="btn" style={{ justifyContent: 'flex-start', gap: '15px', padding: '20px', background: '#f8fafc', border: '2px solid #f1f5f9' }}>
                            <Users size={20} color="var(--vibrant-blue)" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '900', fontSize: '14px' }}>Retailer Governance</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Manage wholesale distribution nodes</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="card" style={{ padding: '40px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px' }}>Authorization Queue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {retailers.filter(r => r.status === 'PENDING').length === 0 && consultants.filter(c => c.status === 'PENDING').length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '700', fontStyle: 'italic' }}>No pending authorizations detected.</p>
                        ) : (
                            <>
                                {retailers.filter(r => r.status === 'PENDING').map(retailer => (
                                    <div key={retailer.retailer_id} style={{ padding: '20px', borderRadius: '15px', border: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '900', color: 'var(--velvet-dark)' }}>{retailer.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Retailer Node Authorization</div>
                                        </div>
                                        <button onClick={() => approveRetailer(retailer.retailer_id)} className="btn btn-gold" style={{ padding: '8px 15px', fontSize: '11px' }}>APPROVE</button>
                                    </div>
                                ))}
                                {consultants.filter(c => c.status === 'PENDING').map(consultant => (
                                    <div key={consultant.consultant_id} style={{ padding: '20px', borderRadius: '15px', border: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '900', color: 'var(--velvet-dark)' }}>Dr. {consultant.full_name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Specialist Node Authorization</div>
                                        </div>
                                        <button onClick={() => approveConsultant(consultant.consultant_id)} className="btn btn-gold" style={{ padding: '8px 15px', fontSize: '11px' }}>APPROVE</button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
