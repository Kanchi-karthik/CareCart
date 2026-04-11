import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, Smartphone, ShieldCheck, Lock, ArrowRight, Loader2, CheckCircle, Package, ExternalLink } from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import Logo from '../components/Logo';

export default function Payment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderTotal, setOrderTotal] = useState(0);
    const [orderIds, setOrderIds] = useState([]);
    const [paymentData, setPaymentData] = useState({
        mode: 'CARD',
        transactionId: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        const total = sessionStorage.getItem('orderTotal');
        const ids = sessionStorage.getItem('pendingOrderIds');

        if (!total || !ids) {
            navigate('/app/cart');
            return;
        }

        setOrderTotal(parseFloat(total));
        setOrderIds(JSON.parse(ids));
    }, [navigate]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const paymentPromises = orderIds.map(orderId =>
                apiClient.post('/payments/', {
                    order_id: orderId,
                    amount: orderTotal / orderIds.length,
                    mode: paymentData.mode,
                    status: 'SUCCESS',
                    transaction_id: `CARE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
                })
            );

            await Promise.all(paymentPromises);

            // Update orders to CONFIRMED or similar if needed, 
            // though status PENDING is usually fine until seller acts.
            
            sessionStorage.removeItem('pendingOrderIds');
            sessionStorage.removeItem('orderTotal');

            setSuccess(true);
            setTimeout(() => {
                navigate('/app/buyer-orders');
            }, 5000);
        } catch (error) {
            console.error('Settlement Error:', error);
            alert('Financial Core Timeout: Transaction could not be verified.');
        } finally {
            setLoading(false);
        }
    };

    const paymentModes = [
        { value: 'CARD', label: 'Corporate Credit Card', sub: 'Instant Sync', icon: CreditCard },
        { value: 'UPI', label: 'Business UPI Protocol', sub: 'Direct Settlement', icon: Smartphone },
        { value: 'NET_BANKING', label: 'Institutional Banking', sub: 'Bulk Clearing', icon: ExternalLink },
    ];

    if (success) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div style={{ textAlign: 'center', maxWidth: '500px', animation: 'fadeIn 0.8s ease-out' }}>
                    <div style={{ width: '120px', height: '120px', background: '#ecfdf5', borderRadius: '50%', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)' }}>
                        <CheckCircle size={60} strokeWidth={3} />
                    </div>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>Settlement Finalized.</h1>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600', marginBottom: '40px', lineHeight: '1.6' }}>
                        Your procurement batch has been synchronized. Orders are now visible in your clinical dashboard.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                        <Loader2 className="spin" size={20} color="#b62d2d" />
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>REDIRECTING TO MISSION CONTROL...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '60px 8%', minHeight: '100vh', background: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
                
                .payment-card { 
                    background: #f8fafc; border-radius: 40px; border: 1px solid #f1f5f9; 
                    padding: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
                }
                .method-btn {
                    background: white; border: 2px solid #e2e8f0; border-radius: 25px; 
                    padding: 25px; cursor: pointer; transition: all 0.3s;
                    display: flex; align-items: center; gap: 20px; text-align: left;
                    width: 100%; position: relative;
                }
                .method-btn:hover { border-color: #cbd5e1; transform: translateY(-3px); }
                .method-active { border-color: #b62d2d; background: #fff1f2; }
                .method-active i { color: #b62d2d; }
                
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900', display: 'inline-block', marginBottom: '15px' }}>FINANCIAL CLEARING ENGINE</div>
                <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2.5px' }}>Settlement Node</h1>
                <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>Confirming total procurement value: <span style={{ color: '#b62d2d' }}>₹{orderTotal.toLocaleString()}</span></p>
            </div>

            <div className="payment-card">
                {/* Payment Methods */}
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>Select Instrument</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {paymentModes.map(mode => (
                            <button 
                                key={mode.value}
                                onClick={() => setPaymentData({ ...paymentData, mode: mode.value })}
                                className={`method-btn ${paymentData.mode === mode.value ? 'method-active' : ''}`}
                            >
                                <div style={{ background: paymentData.mode === mode.value ? '#b62d2d' : '#f1f5f9', color: paymentData.mode === mode.value ? 'white' : '#64748b', padding: '15px', borderRadius: '15px' }}>
                                    <mode.icon size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>{mode.label}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{mode.sub}</div>
                                </div>
                                {paymentData.mode === mode.value && <div style={{ width: '12px', height: '12px', background: '#b62d2d', borderRadius: '50%' }} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Confirm Section */}
                <div style={{ background: 'white', padding: '50px', borderRadius: '35px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '10px' }}>TOTAL CLEARING AMOUNT</div>
                        <div style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3px' }}>₹{orderTotal.toLocaleString()}</div>
                        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '800', marginTop: '5px' }}>BATCH: {orderIds.length} CLINICAL UNITS</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '25px', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
                           <Lock size={18} /> Validating via SSL-TLS 1.3
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        style={{ width: '100%', padding: '25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
                    >
                        {loading ? <><Loader2 className="spin" size={22} /> SYNCING LEDGER...</> : <><ShieldCheck size={22} /> FINALIZE SETTLEMENT</>}
                    </button>
                    
                    <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
                        By clicking, you authorize the CareCart Clearing House to debit the specified amount as per the B2B master agreement.
                    </p>
                </div>
            </div>
        </div>
    );
}
