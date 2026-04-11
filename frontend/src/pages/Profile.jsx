import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, MapPin, Phone, Save, Building2, ShieldCheck, Edit2, Activity, Globe, CheckCircle2 } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function Profile() {
    const rawUser = sessionStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : { role: 'BUYER', username: 'Unknown', email: '' };

    const [formData, setFormData] = useState({
        email: user.email || '',
        phone: '',
        address: '',
        city: '',
        name: '', // Unified as 'name'
        license_no: '',
        registration_no: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user.user_id) { setLoading(false); return; }
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get(`/users/profile?user_id=${user.user_id}&role=${user.role}`);
                if (res.data && res.data.status === 'success') {
                    setFormData(prev => ({ ...prev, ...res.data }));
                } else if (res.data) {
                    // Fallback for direct data
                    setFormData(prev => ({ ...prev, ...res.data }));
                }
            } catch (err) {
                console.error("Profile load failed", err);
                setError("Clinical Registry Node connection failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user.user_id, user.role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(''); setSuccess('');

            const payload = { ...formData, user_id: user.user_id, role: user.role };
            const res = await apiClient.post('/users/profile', payload);
            
            if (res.data.status === 'success') {
                const updatedUser = { ...user, email: formData.email };
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                setSuccess('Clinical identity updated successfully.');
                setTimeout(() => setSuccess(''), 4000);
            } else {
                setError(res.data.message || 'Registry update failed');
            }
        } catch (error) {
            setError('Gateway connection failure. Verify network integrity.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div className="pulse-loader"></div>
            <p style={{ color: '#64748b', fontWeight: '800', letterSpacing: '1px' }}>SYNCING CLINICAL IDENTITY...</p>
        </div>
    );

    return (
        <div className="page-transition">
            <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', marginBottom: '10px' }}>Clinical Profile</h1>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>Secure identity management for your pharmaceutical node.</p>
                </div>
                <div style={{ background: '#ecfdf5', padding: '12px 25px', borderRadius: '20px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <ShieldCheck size={20} color="#059669" />
                     <span style={{ fontSize: '12px', fontWeight: '900', color: '#047857' }}>{user.role} VERIFIED</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '50px' }}>
                {/* Visual Identity Card */}
                <div className="card" style={{ padding: '0', background: 'white', borderRadius: '40px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.03)', height: 'fit-content' }}>
                    <div style={{ height: '140px', background: user.role === 'BUYER' ? '#b62d2d' : '#0f172a', position: 'relative' }}>
                        <Logo size={80} inverse style={{ position: 'absolute', top: '20px', right: '30px', opacity: 0.1 }} />
                    </div>
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '40px', margin: '-100px auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '4px solid white' }}>
                            <User size={60} color="#0f172a" />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>{user.username}</h2>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', letterSpacing: '1px' }}>{formData.name || 'INSTITUTION NAME UNSET'}</div>
                        
                        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '2px dashed #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b' }}><Mail size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>OFFICIAL EMAIL</div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>{formData.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b' }}><Phone size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>CONTACT NODE</div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>{formData.phone || 'N/A'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b' }}><MapPin size={18} /></div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>GEO LOCATION</div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>{formData.city || 'GLOBAL'}, IN</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="card" style={{ padding: '60px', borderRadius: '45px', background: 'white', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Building2 size={28} color={user.role === 'BUYER' ? '#b62d2d' : '#3b82f6'} /> Registry Particulars
                            </h3>
                            {success && (
                                <div className="status-toast success">
                                    <CheckCircle2 size={16} /> {success}
                                </div>
                            )}
                            {error && (
                                <div className="status-toast error">
                                    <Activity size={16} /> {error}
                                </div>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="input-group">
                                <label>INSTITUTIONAL NAME</label>
                                <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Official Medical Shop / Company Name" />
                            </div>
                            <div className="input-group">
                                <label>{user.role === 'BUYER' ? 'HOSPITAL LICENSE (READ-ONLY)' : 'BUSINESS REG NO (READ-ONLY)'}</label>
                                <input disabled value={(user.role === 'BUYER' ? formData.license_no : formData.registration_no) || ''} style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                            </div>
                            <div className="input-group">
                                <label>COMMUNICATION EMAIL</label>
                                <input name="email" value={formData.email || ''} onChange={handleChange} type="email" />
                            </div>
                            <div className="input-group">
                                <label>PRIMARY CONTACT NO</label>
                                <input name="phone" value={formData.phone || ''} onChange={handleChange} />
                            </div>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label>PHYSICAL VAULT ADDRESS</label>
                                <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Detailed clinical address..." />
                            </div>
                            <div className="input-group">
                                <label>SYSTEM CITY</label>
                                <input name="city" value={formData.city || ''} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>NETWORK COUNTRY</label>
                                <input disabled value="INDIA" style={{ background: '#f8fafc', color: '#94a3b8' }} />
                            </div>
                        </div>

                        <div style={{ marginTop: '50px', paddingTop: '40px', borderTop: '2px dashed #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={saving} className="save-btn" style={{ background: user.role === 'BUYER' ? '#b62d2d' : '#0f172a' }}>
                                {saving ? 'SYNCHRONIZING...' : 'SAVE REGISTRY'}
                                <Save size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                .input-group label { display: block; font-size: 11px; font-weight: 900; color: #94a3b8; margin-bottom: 12px; letter-spacing: 1px; }
                .input-group input { width: 100%; padding: 18px 25px; border-radius: 18px; border: 2px solid #f1f5f9; background: #ffffff; outline: none; font-weight: 700; color: #0f172a; font-size: 15px; transition: 0.3s; }
                .input-group input:focus { border-color: #cbd5e1; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
                
                .save-btn { padding: 18px 45px; border-radius: 20px; color: white; border: none; font-weight: 900; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; }
                .save-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                
                .status-toast { padding: 8px 20px; borderRadius: 12px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 8px; }
                .status-toast.success { background: #ecfdf5; color: #10b981; border: 1px solid #d1fae5; }
                .status-toast.error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
                
                .pulse-loader { width: 60px; height: 60px; border: 5px solid #f1f5f9; border-top-color: #b62d2d; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .page-transition { padding: 20px; }
                    .form-grid { grid-template-columns: 1fr; }
                    div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

const Logo = ({ size, inverse, style }) => (
    <div style={{ width: size, height: size, background: inverse ? 'white' : '#b62d2d', borderRadius: size/2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        <Activity size={size/1.8} color={inverse ? '#b62d2d' : 'white'} />
    </div>
);
