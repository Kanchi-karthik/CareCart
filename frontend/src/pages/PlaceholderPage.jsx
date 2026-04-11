import React from 'react';
import { Construction, Sparkles, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="page-transition" style={{ textAlign: 'center', padding: '150px 20px' }}>
            <div style={{
                display: 'inline-flex', width: '120px', height: '120px', background: 'var(--velvet-brick)',
                border: '6px solid var(--vibrant-gold)', borderRadius: '35px', alignItems: 'center',
                justifyContent: 'center', marginBottom: '50px', boxShadow: '0 25px 50px rgba(192, 57, 43, 0.4)',
                animation: 'bounce 2s infinite'
            }}>
                <Construction size={60} color="white" />
            </div>

            <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px', marginBottom: '20px' }}>
                {title}
            </h1>
            <p style={{ fontSize: '24px', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 60px', fontWeight: '600', lineHeight: '1.6' }}>
                This module is currently being optimized for the <span style={{ color: 'var(--velvet-brick)', fontWeight: '900' }}>K-Network</span>.
                Expect authentic vibrant updates soon!
            </p>

            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                <button onClick={() => navigate(-1)} className="btn btn-brick" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ArrowLeft size={24} /> GO BACK
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px', background: 'white', border: '3px solid var(--vibrant-gold)', borderRadius: '15px', fontWeight: '900', color: 'var(--velvet-dark)' }}>
                    <Star size={20} fill="var(--vibrant-gold)" color="var(--vibrant-gold)" /> UNDER CONSTRUCTION
                </div>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
        </div>
    );
};

export default PlaceholderPage;
