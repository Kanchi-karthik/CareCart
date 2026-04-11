import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
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
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ecfdf5', color: '#10b981', padding: '8px 20px', borderRadius: '30px', marginBottom: '25px', fontSize: '12px', fontWeight: '900' }}>
                    <Shield size={16} /> DATA PROTECTION POLICY
                </div>
                <h1 style={{ fontSize: '64px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3px', marginBottom: '40px' }}>Privacy Policy</h1>

                <div style={{ display: 'grid', gap: '40px', color: '#64748b', fontSize: '18px', lineHeight: '1.8' }}>
                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>1. Data Encryption</h2>
                        <p>At MediCart, we use industry-standard AES-256 encryption to protect all medical and logistics data. Your personal and business information is encrypted both at rest and in transit.</p>
                    </section>

                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>2. Information Collection</h2>
                        <p>We collect only the necessary information required for pharmaceutical logistics, including business credentials, medical registration numbers for doctors, and delivery addresses for the public.</p>
                    </section>

                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>3. Third-Party Sharing</h2>
                        <p>MediCart does not sell your data to advertisers. We share information only with verified nodes within the 3-tier supply chain (e.g., sharing a delivery address from a shop to a wholesaler) to fulfill orders.</p>
                    </section>

                    <section>
                        <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', marginBottom: '15px' }}>4. Medical Records</h2>
                        <p>Private clinical consultations and prescriptions are stored in a dedicated secure vault. Only the patient and the consulting doctor have access to these sensitive records.</p>
                    </section>
                </div>
            </div>

            <footer style={{ marginTop: '100px', borderTop: '1px solid #e2e8f0', paddingTop: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>
                © 2026 MEDICART SYSTEMS - PRIVACY COMPLIANCE OFFICE
            </footer>
        </div>
    );
};

export default Privacy;
