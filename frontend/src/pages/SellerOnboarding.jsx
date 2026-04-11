import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, MapPin, ShieldCheck, ChevronRight, ArrowLeft, 
    Navigation, CheckCircle2, Factory, Truck, Store, Info, Shield, Plus
} from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import Logo from '../components/Logo';

export default function SellerOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [seller, setSeller] = useState(null);

    const [profile, setProfile] = useState({
        company_name: '',
        business_type: 'WHOLESALE',
        business_reg_no: '',
        address: '',
        city: '',
        country: 'India',
        latitude: null,
        longitude: null
    });

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.role !== 'SELLER') {
            navigate('/login');
            return;
        }

        const fetchSeller = async () => {
            try {
                const res = await apiClient.get(`/sellers/?user_id=${user.user_id}`);
                if (res.data && res.data.seller_id) {
                    setSeller(res.data);
                    setProfile({
                        ...profile,
                        company_name: res.data.company_name || '',
                        business_reg_no: res.data.business_reg_no || '',
                        address: res.data.address || '',
                        city: res.data.city || '',
                        business_type: res.data.business_type || 'WHOLESALE',
                        latitude: res.data.latitude,
                        longitude: res.data.longitude
                    });
                }
            } catch (err) { console.error(err); }
        };
        fetchSeller();
    }, []);

    const handleSyncLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setProfile(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setDetecting(false);
            },
            (err) => {
                console.error(err);
                alert("Location detection failed. Please enter manually.");
                setDetecting(false);
            }
        );
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await apiClient.put('/sellers/', {
                ...profile,
                seller_id: seller.seller_id,
                verification_status: 'PENDING'
            });
            
            // Update local storage status
            const user = JSON.parse(sessionStorage.getItem('user'));
            user.verification_status = 'PENDING';
            sessionStorage.setItem('user', JSON.stringify(user));

            navigate('/app/dashboard', { state: { onboardingComplete: true } });
        } catch (err) {
            alert("Onboarding failed. Please check your data.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="fade-in">
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Business Details</h2>
                            <p style={{ color: '#64748b', fontWeight: '600' }}>Tell us about your company to get started.</p>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                {[
                                    { id: 'WHOLESALE', label: 'Wholesale', icon: <Truck size={20} /> },
                                    { id: 'MANUFACTURER', label: 'Manufacturer', icon: <Factory size={20} /> },
                                    { id: 'RETAIL_CHAIN', label: 'Retail Owner', icon: <Store size={20} /> }
                                ].map(t => (
                                    <div 
                                        key={t.id}
                                        onClick={() => setProfile({ ...profile, business_type: t.id })}
                                        style={{ 
                                            padding: '20px', borderRadius: '25px', border: '2px solid', 
                                            borderColor: profile.business_type === t.id ? '#b62d2d' : '#f1f5f9',
                                            background: profile.business_type === t.id ? '#fff5f5' : 'white',
                                            cursor: 'pointer', textAlign: 'center', transition: '0.2s'
                                        }}
                                    >
                                        <div style={{ color: profile.business_type === t.id ? '#b62d2d' : '#94a3b8', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{t.icon}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '900', color: profile.business_type === t.id ? '#b62d2d' : '#0f172a' }}>{t.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>COMPANY NAME</label>
                                <input 
                                    value={profile.company_name} 
                                    onChange={e => setProfile({ ...profile, company_name: e.target.value })}
                                    style={{ width: '100%', padding: '18px', borderRadius: '18px', border: '2px solid #f1f5f9', background: 'white', marginTop: '8px', fontWeight: '700' }} 
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>LICENSE / REG. NUMBER</label>
                                <input 
                                    value={profile.business_reg_no} 
                                    onChange={e => setProfile({ ...profile, business_reg_no: e.target.value })}
                                    style={{ width: '100%', padding: '18px', borderRadius: '18px', border: '2px solid #f1f5f9', background: 'white', marginTop: '8px', fontWeight: '700' }} 
                                    placeholder="e.g. GST Number"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="fade-in">
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Warehouse Location</h2>
                            <p style={{ color: '#64748b', fontWeight: '600' }}>Where is your stock located?</p>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '35px', borderRadius: '35px', border: '2px dashed #e2e8f0', marginBottom: '35px', textAlign: 'center' }}>
                            <div style={{ width: '70px', height: '70px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                                <Navigation size={30} color="#b62d2d" />
                            </div>
                            <h4 style={{ fontWeight: '900', fontSize: '20px', marginBottom: '8px' }}>Store GPS Sync</h4>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px', padding: '0 30px' }}>Allow us to find your location automatically on the map.</p>
                            <button 
                                onClick={handleSyncLocation} 
                                disabled={detecting}
                                style={{ padding: '14px 35px', background: '#0f172a', color: 'white', borderRadius: '50px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', transition: '0.3s' }}
                            >
                                {detecting ? 'FINDING...' : profile.latitude ? 'LOCATION FOUND' : 'GET CURRENT LOCATION'}
                            </button>
                            {profile.latitude && (
                                <div style={{ marginTop: '20px', fontSize: '12px', fontWeight: '900', color: '#10b981', background: '#ecfdf5', padding: '10px', borderRadius: '12px', display: 'inline-block' }}>
                                    Latitude: {profile.latitude.toFixed(6)} | Longitude: {profile.longitude.toFixed(6)}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>FULL OFFICE/WAREHOUSE ADDRESS</label>
                                <input 
                                    value={profile.address} 
                                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                                    style={{ width: '100%', padding: '18px', borderRadius: '18px', border: '2px solid #f1f5f9', background: 'white', marginTop: '8px', fontWeight: '700' }} 
                                    placeholder="Enter street and building details"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input 
                                    value={profile.city} 
                                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                                    style={{ width: '100%', padding: '18px', borderRadius: '18px', border: '2px solid #f1f5f9', background: 'white', fontWeight: '700' }} 
                                    placeholder="City"
                                />
                                <input 
                                    value={profile.country} 
                                    readOnly
                                    style={{ width: '100%', padding: '18px', borderRadius: '18px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: '700', color: '#94a3b8' }} 
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ width: '110px', height: '110px', background: '#ecfdf5', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)' }}>
                                <ShieldCheck size={55} color="#10b981" />
                            </div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Review Details</h2>
                            <p style={{ color: '#64748b', fontWeight: '600' }}>Check your info before submitting for approval.</p>
                        </div>

                        <div style={{ background: 'white', padding: '35px', borderRadius: '35px', border: '2px solid #f1f5f9', textAlign: 'left', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', gap: '18px', marginBottom: '25px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#fff5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Building2 size={20} color="#b62d2d" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>Business Info Saved</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{profile.company_name} • {profile.business_type}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '18px', marginBottom: '25px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <MapPin size={20} color="#0ea5e9" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>Location Saved</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{profile.city}, {profile.country} {profile.latitude ? '(GPS Selected)' : ''}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '18px', padding: '20px', background: '#f8fafc', borderRadius: '20px' }}>
                                <Info size={20} color="#64748b" />
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', lineHeight: '1.5' }}>
                                    Note: Our team will check your license. You can use the shop after your account is approved.
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ width: '400px', background: '#0f172a', color: 'white', padding: '70px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(182, 45, 45, 0.15) 0%, transparent 70%)' }}></div>
                
                <div style={{ marginBottom: '80px', position: 'relative' }}><Logo inverse size={45} /></div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                    {[
                        { step: 1, title: 'Business Details', desc: 'Company Info' },
                        { step: 2, title: 'Location', desc: 'Warehouse & Address' },
                        { step: 3, title: 'Finish', desc: 'Submit for Approval' }
                    ].map(s => (
                        <div key={s.step} style={{ display: 'flex', gap: '25px', marginBottom: '60px', opacity: step >= s.step ? 1 : 0.3, transition: '0.4s ease-out' }}>
                            <div style={{ 
                                width: '45px', height: '45px', borderRadius: '18px', border: '2.5px solid', 
                                borderColor: step === s.step ? '#b62d2d' : (step > s.step ? '#10b981' : '#334155'), 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                fontWeight: '900', background: step > s.step ? '#10b981' : 'transparent',
                                color: step > s.step ? 'white' : 'inherit'
                            }}>
                                {step > s.step ? <CheckCircle2 size={24} /> : s.step}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{s.title}</div>
                                <div style={{ fontSize: '13px', opacity: 0.5, marginTop: '2px', fontWeight: '600' }}>{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px', padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '30px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'rgba(182, 45, 45, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={24} color="#b62d2d" />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#b62d2d', letterSpacing: '1px' }}>SECURE PROCESS</div>
                        <div style={{ fontSize: '14px', fontWeight: '800' }}>Privacy Verified</div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', position: 'relative' }}>
                <div style={{ maxWidth: '650px', width: '100%' }}>
                    {renderStep()}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '70px', alignItems: 'center' }}>
                        <button 
                            disabled={step === 1 || loading}
                            onClick={() => setStep(step - 1)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', background: 'white', 
                                border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '900', 
                                fontSize: '14px', cursor: 'pointer', padding: '15px 25px', borderRadius: '15px',
                                opacity: step === 1 ? 0 : 1, transition: '0.3s'
                            }}
                        >
                            <ArrowLeft size={18} /> BACK
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (step < 3) setStep(step + 1);
                                else handleComplete();
                            }}
                            disabled={loading}
                            style={{ 
                                padding: '20px 45px', background: '#b62d2d', color: 'white', borderRadius: '20px', 
                                border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '15px', 
                                boxShadow: '0 15px 35px rgba(182, 45, 45, 0.25)', transition: '0.3s'
                            }}
                            className="hover-up"
                        >
                            {loading ? 'SAVING...' : step === 3 ? 'SUBMIT FOR APPROVAL' : 'SAVE & NEXT'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .hover-up:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(182, 45, 45, 0.3); }
                .hover-up:active { transform: translateY(-1px); }
            `}</style>
        </div>
    );
}
