import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Issues() {
    return (
        <div className="page-transition" style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Medicine Help & Returns</h1>
            <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '600', marginBottom: '40px' }}>Get help with damaged items, returns, and refunds easily.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                <div style={{ background: 'white', border: '1px solid #fecaca', borderRadius: '30px', padding: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#fef2f2', color: '#ef4444', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '900' }}>URGENT</div>
                    <div style={{ background: '#fef2f2', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><AlertTriangle color="#ef4444" size={25} /></div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Medicine Quality Issue</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '20px', lineHeight: '1.5' }}>Shipment #A892 (Insulin) was damaged due to high temperature during delivery. This batch is not safe to use.</p>
                    <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>Value: ₹12,400.00</span>
                         <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Get Full Refund</button>
                    </div>
                </div>

                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '30px', padding: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#fef3c7', color: '#d97706', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '900' }}>PENDING</div>
                    <div style={{ background: '#fef3c7', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><Clock color="#d97706" size={25} /></div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Missing Medicines</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '20px', lineHeight: '1.5' }}>Surgical masks delivery #M210 was missing 500 units compared to the order. Seller is currently checking.</p>
                    <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>Value: ₹4,400.00</span>
                         <button style={{ background: 'white', border: '2px solid #e2e8f0', color: '#64748b', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>Track My Issue</button>
                    </div>
                </div>

                <div style={{ background: 'white', border: '1px solid #ecfdf5', borderRadius: '30px', padding: '30px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '30px', right: '30px', background: '#ecfdf5', color: '#10b981', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '900' }}>RESOLVED</div>
                    <div style={{ background: '#ecfdf5', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><CheckCircle color="#10b981" size={25} /></div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Expired Medicine Return</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '20px', lineHeight: '1.6' }}>Return request #R983 completed. Store credit of ₹1,050 has been added to your balance.</p>
                    <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>Cr: ₹1,050.00</span>
                         <button style={{ background: 'white', border: '2px solid #e2e8f0', color: '#10b981', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>View Details</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
