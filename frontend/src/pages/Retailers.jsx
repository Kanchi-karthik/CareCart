import React, { useState, useEffect } from 'react';
import { Users, Plus, Building2, Mail, Globe, Phone, Trash2, Edit3, ShieldCheck, Star } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const Retailers = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState(null);

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/retailers/');
      setRetailers(res.data);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const RetailerCard = ({ data }) => (
    <div className="card" style={{ padding: '45px', border: '3px solid #f1f5f9', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-15px', right: '30px' }}>
        <Star size={40} color="var(--vibrant-gold)" fill="var(--vibrant-gold)" />
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ width: '85px', height: '85px', background: 'var(--velvet-brick)', border: '5px solid var(--vibrant-gold)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 35px rgba(192, 57, 43, 0.3)' }}>
          <Building2 size={42} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '30px', fontWeight: '900', color: 'var(--velvet-dark)', marginBottom: '5px' }}>{data.name}</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="badge-vibrant badge-success">Verified Partner</span>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '800' }}>ID: {data.retailer_id}</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--canvas-bg)', padding: '30px', borderRadius: '20px', marginBottom: '40px', border: '2px solid var(--vibrant-gold)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '16px', fontWeight: '800' }}>
          <Mail size={22} color="var(--velvet-brick)" /> {data.email || 'partner@k-cart.com'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '16px', fontWeight: '800' }}>
          <Globe size={22} color="var(--vibrant-blue)" /> K-Network Global
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '16px', fontWeight: '800' }}>
          <Phone size={22} color="var(--velvet-brick)" /> +1 (K-CART) HELP
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', paddingTop: '30px', borderTop: '3px solid #f1f5f9' }}>
        <button onClick={() => { setEditingRetailer(data); setShowModal(true); }} className="btn btn-gold" style={{ flex: 1, padding: '15px' }}><Edit3 size={20} /> Edit Partner</button>
        <button onClick={() => handleDelete(data.retailer_id)} className="btn" style={{ flex: 1, padding: '15px', background: '#fff1f2', color: '#be123c', border: '2px solid #fadbd8' }}><Trash2 size={20} /> Remove</button>
      </div>
    </div>
  );

  const handleDelete = async (retailerId) => {
    if (!window.confirm('Are you sure you want to remove this partner?')) return;
    try {
      await apiClient.delete(`/retailers/?id=${encodeURIComponent(retailerId)}`);
      fetchRetailers();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Suppliers</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '24px', fontWeight: '700' }}>Our global network of <span style={{ color: 'var(--vibrant-gold)', background: 'var(--velvet-dark)', padding: '2px 10px', borderRadius: '5px' }}>K-Cart</span> verified partners.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-brick" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Plus size={26} /> REGISTER PARTNER
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '150px' }}>
          <div style={{ width: '70px', height: '70px', border: '6px solid var(--vibrant-gold)', borderTopColor: 'var(--velvet-brick)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      ) : (
        <div className="grid-responsive" style={{ gap: '50px' }}>
          {retailers.map(r => <RetailerCard key={r.retailer_id} data={r} />)}
        </div>
      )}

      {showModal && <AddRetailerModal editingRetailer={editingRetailer} onClose={() => { setShowModal(false); setEditingRetailer(null); }} onRefresh={fetchRetailers} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const AddRetailerModal = ({ editingRetailer, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({ retailer_id: '', name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRetailer) setFormData({ retailer_id: editingRetailer.retailer_id || '', name: editingRetailer.name || '', email: editingRetailer.email || '' });
    else setFormData({ retailer_id: '', name: '', email: '' });
  }, [editingRetailer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRetailer) {
        await apiClient.put('/retailers/', formData);
      } else {
        await apiClient.post('/retailers/', formData);
      }
      onRefresh();
      onClose();
    } catch (err) {
      alert("Error: Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content page-transition">
        <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '15px' }}>New Partner</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '50px', fontWeight: '700', fontSize: '18px' }}>Authorize a new supplier to join the <span style={{ color: 'var(--velvet-brick)' }}>K-Network</span>.</p>

        <form onSubmit={handleSubmit}>
          <label className="form-label">Partner Code</label>
          <input className="form-input" placeholder="e.g. KC-SUP-01" onChange={e => setFormData({ ...formData, retailer_id: e.target.value })} required />

          <label className="form-label">Full Business Name</label>
          <input className="form-input" placeholder="Official Entity Name" onChange={e => setFormData({ ...formData, name: e.target.value })} required />

          <label className="form-label">Business Email</label>
          <input type="email" className="form-input" placeholder="contact@partner.com" onChange={e => setFormData({ ...formData, email: e.target.value })} required />

          <div style={{ display: 'flex', gap: '25px', marginTop: '30px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: '2px solid #eee' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-brick" style={{ flex: 2 }}>
              {loading ? 'AUTHORIZING...' : 'AUTHORIZE PARTNER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Retailers;
