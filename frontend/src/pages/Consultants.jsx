import React, { useState } from 'react';
import { Stethoscope, Star, BadgeCheck, MessageSquare, ArrowRight, Heart } from 'lucide-react';

const Consultants = () => {
  const [consultants] = useState([
    { id: 'DOC-001', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', rating: 4.9, status: 'AVAILABLE' },
    { id: 'DOC-002', name: 'Dr. Michael Chen', specialty: 'Neurology', rating: 4.8, status: 'ENGAGED' }
  ]);

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Expert Desk</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '24px', fontWeight: '700' }}>Direct access to the <span style={{ color: 'var(--velvet-brick)', fontWeight: '900' }}>CareCart Clinical Network</span>.</p>
        </div>
        <button className="btn btn-gold" style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Stethoscope size={24} /> CONNECT SPECIALIST
        </button>
      </div>

      <div className="grid-responsive" style={{ gap: '40px' }}>
        {consultants.map(c => (
          <div key={c.id} className="card" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', border: '3px solid #f1f5f9' }}>
            <div style={{ width: '100px', height: '100px', background: 'var(--velvet-brick)', borderRadius: '25px', border: '5px solid var(--vibrant-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={50} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{c.name}</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>
                  <Star size={20} fill="var(--vibrant-gold)" /> {c.rating}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>{c.specialty}</p>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '30px' }}>
                <span className={`badge-vibrant ${c.status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'}`}>
                  {c.status}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                  <BadgeCheck size={18} color="#27ae60" /> VERIFIED CARE EXPERT
                </span>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn btn-brick" style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  BOOK NOW <ArrowRight size={20} />
                </button>
                <button className="btn" style={{ padding: '15px', background: 'white', border: '3px solid var(--vibrant-gold)', color: 'var(--velvet-dark)' }}>
                  <MessageSquare size={24} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '100px', background: 'var(--velvet-dark)', color: 'white', border: '5px solid var(--vibrant-gold)', textAlign: 'center', padding: '80px' }}>
        <Heart size={60} color="var(--vibrant-gold)" fill="var(--vibrant-gold)" style={{ marginBottom: '30px' }} />
        <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '20px' }}>The Kanchi Human Health Initiative</h2>
        <p style={{ fontSize: '22px', maxWidth: '800px', margin: '0 auto', fontWeight: '500', opacity: 0.8, lineHeight: '1.6' }}>
          Part of the CareCart mission. We bridge the gap between medical expertise and patients through our precision logistics network.
        </p>
      </div>
    </div>
  );
};

export default Consultants;
