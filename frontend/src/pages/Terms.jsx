import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Scale, AlertCircle, CheckCircle } from 'lucide-react';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div style={{ background: '#fcfcfd', minHeight: '100vh', padding: '100px 10%', fontFamily: "'Outfit', sans-serif" }}>
            <button
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900', color: '#b62d2d', cursor: 'pointer', marginBottom: '50px' }}
            >
                <ArrowLeft size={20} /> BACK TO HOME
            </button>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#fffbeb', color: '#f59e0b', padding: '8px 20px', borderRadius: '30px', marginBottom: '25px', fontSize: '12px', fontWeight: '900' }}>
                    <Scale size={16} /> SERVICE AGREEMENT
                </div>
                <h1 style={{ fontSize: '64px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3px', marginBottom: '40px' }}>Terms of Service</h1>

                <div style={{ display: 'grid', gap: '40px', color: '#64748b', fontSize: '18px', lineHeight: '1.8' }}>
                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
                        <p>By accessing the MediCart Platform, including our Wholesale, Retail, and Clinical Hubs, you agree to be bound by these legal terms and our professional code of conduct.</p>
                    </section>

                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>2. Professional Credentials</h2>
                        <p>Users registering as Doctors or Wholesale Suppliers must provide valid medical and business licenses. MediCart reserves the right to suspend any account found to be using fraudulent credentials.</p>
                    </section>

                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>3. Pharmaceutical Accuracy</h2>
                        <p>Wholesale and Retail vendors are responsible for the accuracy of their inventory descriptions and expiry dates. MediCart provides the infrastructure but is not liable for incorrect stock entries by vendors.</p>
                    </section>

                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>4. Payment Terms</h2>
                        <p>All B2B transactions between Wholesalers and Pharmacies are subject to the specific credit terms agreed upon within the platform's invoicing system.</p>
                    </section>
                </div>
            </div>

            <footer style={{ marginTop: '100px', borderTop: '1px solid #e2e8f0', paddingTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>
                © 2026 MEDICART SYSTEMS - LEGAL DEPARTMENT
            </footer>
        </div>
    );
};

export default Terms;
