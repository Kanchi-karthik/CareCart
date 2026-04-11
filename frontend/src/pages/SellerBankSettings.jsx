import React, { useState, useEffect } from 'react';
import { Building, CreditCard, ShieldCheck, CheckCircle2, Save, ArrowLeft, History, DollarSign } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function SellerBankSettings() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [finData, setFinData] = useState({
        bankName: '',
        accountNo: '',
        ifscCode: '',
        holderName: ''
    });

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        // Fetch existing bank details if any
        const fetchBankDetails = async () => {
            try {
                const res = await apiClient.get(`/sellers/financials/?seller_id=${user.profile_id}`);
                if (res.data && res.data.bank_name) {
                    setFinData({
                        bankName: res.data.bank_name,
                        accountNo: res.data.account_no,
                        ifscCode: res.data.ifsc_code,
                        holderName: res.data.holder_name
                    });
                }
            } catch (err) {}
        };
        if (user.profile_id) fetchBankDetails();
    }, [user.profile_id]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.post('/sellers/financials/', {
                seller_id: user.profile_id,
                ...finData
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert("Security Protocol Failure: Could not sync bank node.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-transition" style={{ padding: '60px 8%', minHeight: '100vh', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                <div>
                    <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900', display: 'inline-block', marginBottom: '15px' }}>FINANCIAL HUB</div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3.5px' }}>Settlement Settings.</h1>
                    <p style={{ color: '#64748b', fontWeight: '700', fontSize: '18px' }}>Configure your verified bank node to receive multi-seller payouts.</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '35px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '5px' }}>NEXT SETTLEMENT</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>₹0.00</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', opacity: 0.6 }}>AUTO-DISBURSAL ENABLED</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '45px', padding: '50px', border: '2px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Building size={32} color="#b62d2d" /> My Receiving Node
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>BANK NAME</label>
                            <input 
                                value={finData.bankName} 
                                onChange={(e) => setFinData({...finData, bankName: e.target.value})} 
                                placeholder="e.g. HDFC Bank, ICICI, SBI" 
                                style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>ACCOUNT NUMBER</label>
                            <input 
                                value={finData.accountNo} 
                                onChange={(e) => setFinData({...finData, accountNo: e.target.value})} 
                                placeholder="Enter account no." 
                                style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>IFSC CODE</label>
                            <input 
                                value={finData.ifscCode} 
                                onChange={(e) => setFinData({...finData, ifscCode: e.target.value})} 
                                placeholder="e.g. HDFC0001234" 
                                style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} 
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>ACCOUNT HOLDER NAME</label>
                            <input 
                                value={finData.holderName} 
                                onChange={(e) => setFinData({...finData, holderName: e.target.value})} 
                                placeholder="Exactly as per bank records" 
                                style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        style={{ 
                            width: '100%', padding: '25px', background: success ? '#10b981' : '#0f172a', color: 'white', 
                            borderRadius: '25px', border: 'none', fontWeight: '900', fontSize: '18px', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' 
                        }}
                    >
                        {loading ? 'SYNCING...' : success ? <CheckCircle2 size={24} /> : 'UPDATE FINANCIALS'}
                        {!loading && !success && <Save size={22} />}
                    </button>
                    {success && <p style={{ textAlign: 'center', color: '#10b981', fontWeight: '800', marginTop: '20px' }}>Financial Node Linked Successfully!</p>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ background: '#fffbeb', padding: '40px', borderRadius: '40px', border: '1px solid #fef3c7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <ShieldCheck color="#f59e0b" size={28} />
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#92400e' }}>Escrow Protection</h3>
                        </div>
                        <p style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.6', fontWeight: '700' }}>
                            Your funds are collected via our centralized portal and distributed using the <strong>Oracle Settlement Procedure</strong>. Correct bank details ensure T+1 settlement cycles.
                        </p>
                    </div>

                    <div style={{ background: '#f0f9ff', padding: '40px', borderRadius: '40px', border: '1px solid #e0f2fe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <History color="#0ea5e9" size={28} />
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0369a1' }}>Recent Disbursals</h3>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px', color: '#0369a1', opacity: 0.5, fontWeight: '800' }}>
                            NO PREVIOUS TRANSFERS FOUND
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
