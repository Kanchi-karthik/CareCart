import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, Mail, Phone, MapPin, ShieldCheck, Star } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/clients/');
      setClients(res.data);
    } catch (err) {
      console.error("System sync failed");
    } finally {
      setLoading(false);
    }
  };

  const ClientCard = ({ client }) => (
    <div className="card" style={{ padding: '40px', border: '3px solid #f1f5f9', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-15px', right: '30px' }}>
        <ShieldCheck size={40} color="var(--vibrant-gold)" fill="var(--vibrant-gold)" />
      </div>
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center', marginBottom: '35px' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--velvet-brick)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '5px solid var(--vibrant-gold)' }}>
          <Building2 size={40} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{client.name}</h3>
          <span className="badge-vibrant badge-success">CareCart Enterprise</span>
        </div>
      </div>

      <div style={{ background: 'var(--canvas-bg)', padding: '25px', borderRadius: '20px', border: '2px solid #eee', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
          <Mail size={18} color="var(--velvet-brick)" /> {client.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
          <MapPin size={18} color="var(--vibrant-blue)" /> {client.city}, {client.country}
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600', lineHeight: '1.6', marginBottom: '30px' }}>
        {client.description || "Authorized institutional partner of the CareCart network."}
      </p>

      <button className="btn btn-gold" style={{ width: '100%', padding: '15px' }}>DETAILS & ANALYTICS</button>
    </div>
  );

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Hospitals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '24px', fontWeight: '700' }}>Our network of hospital and clinic <span style={{ color: 'var(--velvet-brick)', fontWeight: '900' }}>authorized partners</span>.</p>
        </div>
        <button className="btn btn-brick" style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={24} /> REGISTER HOSPITAL
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '150px' }}>
          <div style={{ width: '60px', height: '60px', border: '6px solid var(--vibrant-gold)', borderTopColor: 'var(--velvet-brick)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      ) : (
        <div className="grid-responsive" style={{ gap: '40px' }}>
          {clients.length > 0 ? clients.map((c, i) => <ClientCard key={i} client={c} />) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'white', borderRadius: '30px', border: '5px dashed var(--vibrant-gold)' }}>
              <Star size={60} color="var(--vibrant-gold)" style={{ marginBottom: '30px' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Waiting for Partners</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>No hospital partners are registered in the CareCart system yet.</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Clients;
