import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, ArrowUpRight, TrendingUp, History, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function Wallet() {
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchBalance = async () => {
        try {
            const res = await apiClient.get(`/dashboard?role=CLIENT&userId=${user.user_id}`);
            setBalance(res.data.wallet_balance || 0);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAddMoney = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        setLoading(true);
        try {
            // Simulated payment top-up
            await apiClient.post('/wallet/topup', {
                user_id: user.user_id,
                amount: parseFloat(amount)
            });
            alert('Money added successfully to your store wallet!');
            setAmount('');
            fetchBalance();
        } catch (error) {
            alert('Failed to add money. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-transition" style={{ padding: '60px 8%', minHeight: '100vh', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                   <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900', display: 'inline-block', marginBottom: '15px', letterSpacing: '1px' }}>INSTITUTIONAL FUNDS</div>
                   <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3.5px' }}>My Wallet.</h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
                <div>
                   {/* Main Balance Card */}
                   <div style={{ background: '#0f172a', borderRadius: '45px', padding: '60px', color: 'white', position: 'relative', overflow: 'hidden', marginBottom: '40px' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', opacity: 0.6 }}>
                                <WalletIcon size={24} />
                                <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '1px' }}>AVAILABLE CREDIT</span>
                            </div>
                            <div style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-4px', marginBottom: '15px' }}>₹{Number(balance).toLocaleString()}</div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: '800' }}>Active for Purchases</span>
                                </div>
                            </div>
                        </div>
                        {/* Abstract background elements */}
                        <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                   </div>

                   {/* Add Money Card */}
                   <div style={{ background: '#f8fafc', borderRadius: '45px', padding: '50px', border: '1px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Plus size={28} color="#b62d2d" /> Top Up Balance
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: '#94a3b8' }}>₹</div>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                    style={{ width: '100%', padding: '25px 25px 25px 45px', borderRadius: '25px', border: '2px solid #e2e8f0', fontWeight: '800', fontSize: '18px', outline: 'none' }}
                                />
                            </div>
                            <button 
                                onClick={handleAddMoney}
                                disabled={loading}
                                style={{ background: '#0f172a', color: 'white', borderRadius: '25px', border: 'none', fontWeight: '900', fontSize: '18px', cursor: 'pointer', transition: '0.2s' }}
                            >
                                {loading ? 'UPDATING...' : 'ADD MONEY'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            {[1000, 5000, 10000].map(val => (
                                <button key={val} onClick={() => setAmount(val.toString())} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: '900', color: '#64748b', cursor: 'pointer' }}>+ ₹{val.toLocaleString()}</button>
                            ))}
                        </div>
                   </div>
                </div>

                <div>
                    <div style={{ background: '#f8fafc', borderRadius: '45px', padding: '45px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <ShieldCheck size={18} /> SECURITY DETAILS
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={20} color="#10b981" /></div>
                                <div><div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>Locked Funds</div><div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Every purchase is secured via escrow.</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} color="#f59e0b" /></div>
                                <div><div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>Procurement Insights</div><div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Track institutional spends in real-time.</div></div>
                            </div>
                        </div>
                        
                        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '40px', paddingTop: '40px' }}>
                             <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <History size={18} /> RECENT LOGS
                             </div>
                             <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textAlign: 'center', padding: '20px' }}>- Institutional logs will appear here -</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
