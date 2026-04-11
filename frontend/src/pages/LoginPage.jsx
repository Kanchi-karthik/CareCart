import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, Lock, Mail, Users, ArrowRight, Shield, Activity, 
  MapPin, Phone, Building, Search, HelpCircle, Check, Copy, CheckCircle2, ShoppingBag, Truck, Eye, EyeOff, Globe
} from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import Logo from '../components/Logo';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialRole = (queryParams.get('role') || '').toUpperCase();
    const [selectedPortal, setSelectedPortal] = useState(initialRole);
    const [isLogin, setIsLogin] = useState(initialRole === 'ADMIN' ? true : true); // Default to login focus
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Status Track State
    const [trackEmail, setTrackEmail] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusResult, setStatusResult] = useState(null);
    const [showStatusCheck, setShowStatusCheck] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredSellerCode, setRegisteredSellerCode] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        username: '', 
        password: '',
        confirmPassword: '', 
        role: initialRole || 'BUYER',
        email: '',
        phone: '',
        name: '', 
        license_no: '',
        address: '',
        city: 'N/A',
        country: 'India'
    });

    const search = location.search;
    useEffect(() => {
        const activeUser = sessionStorage.getItem('user');
        if (activeUser && !search.includes('logout=true')) {
            navigate('/app/dashboard');
        }
    }, [navigate, search]);

    const handlePortalSelect = (role) => {
        const normalizedRole = role.toUpperCase();
        setSelectedPortal(normalizedRole);
        if (normalizedRole === 'ADMIN') setIsLogin(true); // Force login focus for Admin
        setFormData(prev => ({ ...prev, role: normalizedRole }));
        setError('');
        setSuccessMsg('');
    };

    useEffect(() => {
        if (selectedPortal === 'ADMIN') {
            setIsLogin(true);
        }
    }, [selectedPortal]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccessMsg('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(registeredSellerCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCheckStatus = async () => {
        if (!trackEmail) return;
        setStatusLoading(true);
        setStatusResult(null);
        setError('');
        try {
            const isEmail = trackEmail.includes('@');
            const url = isEmail ? `/sellers/?action=check-status&email=${trackEmail.trim()}` : `/sellers/?action=check-status&id=${trackEmail.toUpperCase().trim()}`;
            const res = await apiClient.get(url);
            if (res.data.status === 'success') {
                setStatusResult(res.data);
            } else {
                setError(res.data.message || 'Reference code or email not found.');
            }
        } catch (err) {
            setError('Status service unavailable.');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                setError("Password check failed: Passwords do not match.");
                setLoading(false);
                return;
            }
        }

        const endpoint = isLogin ? '/users/login' : '/users/register';
        let payload = isLogin ? { username: formData.username, password: formData.password, role: formData.role } : { ...formData };
        
        if (!isLogin) {
            if (formData.role === 'BUYER') {
                payload.license_no = 'NA_INSTITUTIONAL'; 
            }
        }

        try {
            const res = await apiClient.post(endpoint, payload);
            if (res.data.status === 'success' || res.data.success === true) {
                if (isLogin) {
                    sessionStorage.setItem('user', JSON.stringify(res.data.user || res.data));
                    navigate('/app/dashboard');
                } else {
                    const code = res.data.ref_code || (res.data.message.includes('REF_CODE: ') ? res.data.message.split('REF_CODE: ')[1] : 'PENDING');
                    setRegisteredSellerCode(code);
                    setShowSuccessModal(true);
                }
            } else {
                setError(res.data.message || 'Login details not matching.');
            }
        } catch (err) {
            setError('Connection failed. Please check your network.');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedPortal) {
        return (
            <div className="login-vibe">
                <div className="glass-blob blob-1"></div>
                <div className="glass-blob blob-2"></div>
                
                <div className="portal-selector card active-hover">
                    <div onClick={() => navigate('/')} className="logo-anchor">
                        <Logo size={70} />
                    </div>
                    
                    <div className="welcome-text">
                        <h2>Welcome to CareCart</h2>
                        <p>Join our professional medicine network.</p>
                    </div>

                    <div className="portal-grid">
                        {[
                            { role: 'BUYER', title: 'I am a Buyer', desc: 'Medical shops, clinics & hospitals needing stock', icon: ShoppingBag, color: '#b62d2d' },
                            { role: 'SELLER', title: 'I am a Seller', desc: 'Manufacturers & distributors selling medicines', icon: Truck, color: '#0f172a' }
                        ].map((portal) => (
                            <div key={portal.role} onClick={() => handlePortalSelect(portal.role)} className="portal-card">
                                <div className="portal-icon-box" style={{ background: `${portal.color}10` }}>
                                    <portal.icon size={48} color={portal.color} />
                                </div>
                                <h3>{portal.title}</h3>
                                <p>{portal.desc}</p>
                                <div className="portal-check"><CheckCircle2 size={24} /></div>
                            </div>
                        ))}
                    </div>

                    <div className="portal-footer">
                        <div onClick={() => navigate('/')} className="footer-link"><Globe size={18} /> BACK TO HOME</div>
                    </div>
                </div>

                <style>{`
                    .login-vibe { min-height: 100vh; background: #fff; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; font-family: 'Plus Jakarta Sans', sans-serif; }
                    .glass-blob { position: absolute; width: 600px; height: 600px; border-radius: 50%; filter: blur(120px); opacity: 0.15; z-index: 1; pointer-events: none; }
                    .blob-1 { background: #b62d2d; top: -100px; right: -100px; }
                    .blob-2 { background: #0f172a; bottom: -100px; left: -100px; }
                    .portal-selector { width: 100%; height: 100vh; background: rgba(255,255,255,0.8); backdrop-filter: blur(40px); border: none; padding: 5vh 5vw; border-radius: 0; text-align: center; position: relative; z-index: 10; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                    .logo-anchor { margin-bottom: 40px; cursor: pointer; transition: 0.3s; }
                    .logo-anchor:hover { transform: scale(1.05); }
                    .welcome-text h2 { font-size: 48px; font-weight: 900; color: #0f172a; margin-bottom: 15px; letter-spacing: -2px; }
                    .welcome-text p { font-size: 18px; font-weight: 600; color: #64748b; margin-bottom: 60px; }
                    .portal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 60px; }
                    .portal-card { background: white; padding: 60px 40px; border-radius: 40px; border: 2px solid #f1f5f9; cursor: pointer; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; text-align: left; }
                    .portal-card:hover { transform: translateY(-15px); border-color: #cbd5e1; box-shadow: 0 30px 60px rgba(0,0,0,0.05); }
                    .portal-icon-box { width: 100px; height: 100px; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin-bottom: 30px; }
                    .portal-card h3 { font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
                    .portal-card p { font-size: 15px; font-weight: 600; color: #64748b; line-height: 1.6; }
                    .portal-check { position: absolute; top: 30px; right: 30px; color: #10b981; opacity: 0; transform: scale(0.5); transition: 0.3s; }
                    .portal-card:hover .portal-check { opacity: 1; transform: scale(1); }
                    .portal-footer { display: flex; justify-content: center; gap: 50px; align-items: center; }
                    .footer-link { font-size: 13px; font-weight: 900; color: #b62d2d; cursor: pointer; letter-spacing: 1px; display: flex; align-items: center; gap: 10px; opacity: 0.8; transition: 0.3s; }
                    .footer-link:hover { opacity: 1; transform: translateX(-5px); }
                    @media (max-width: 768px) {
                        .portal-grid { grid-template-columns: 1fr; }
                        .portal-selector { padding: 50px 30px; }
                        .welcome-text h2 { font-size: 32px; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="login-vibe">
            <div className={`glass-blob ${selectedPortal === 'SELLER' ? 'blob-2' : (selectedPortal === 'ADMIN' ? 'blob-1' : 'blob-1')}`}></div>
            
            <div className="auth-split card">
                <div className="auth-sidebar" style={{ background: selectedPortal === 'SELLER' ? '#0f172a' : (selectedPortal === 'ADMIN' ? '#1e293b' : '#b62d2d') }}>
                    <div className="sidebar-content">
                        <button onClick={() => setSelectedPortal(null)} className="back-portal-btn"><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> GO BACK</button>
                        
                        <div className="brand-focus">
                            <Logo size={60} inverse />
                            <h2>{selectedPortal} Control</h2>
                            <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Manage your medicines and orders easily.</p>
                        </div>

                        <div className="benefit-list">
                            <div className="benefit"><Shield size={20} /> Verified Medicine List</div>
                            <div className="benefit"><Activity size={20} /> Live Order Updates</div>
                            <div className="benefit"><Truck size={20} /> Safe Medicine Delivery</div>
                        </div>
                    </div>
                </div>

                <div className="auth-main">
                    <div className="main-header">
                        {selectedPortal.toUpperCase() !== 'ADMIN' && (
                            <div className="auth-mode-pills">
                                <div onClick={() => setIsLogin(true)} className={`pill ${isLogin ? 'active' : ''}`}>{showStatusCheck ? 'SUPPORT' : 'LOG IN'}</div>
                                {selectedPortal === 'SELLER' && (
                                    <div onClick={() => setIsLogin(false)} className={`pill ${!isLogin ? 'active' : ''}`}>JOIN US</div>
                                )}
                                {selectedPortal === 'BUYER' && (
                                    <div onClick={() => setIsLogin(false)} className={`pill ${!isLogin ? 'active' : ''}`}>REGISTER</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-content">
                        <h2>{showStatusCheck ? 'Check Progress' : (selectedPortal.toUpperCase() === 'ADMIN' ? 'Welcome Back Administrator' : (isLogin ? 'Welcome Back' : 'Create Account'))}</h2>
                        <p>{showStatusCheck ? 'Check your application status' : (selectedPortal.toUpperCase() === 'ADMIN' ? 'Identity verification required for secure vault access.' : 'Enter your details below')}</p>

                        {error && <div className="error-badge">{error}</div>}
                        {successMsg && <div className="success-badge">{successMsg}</div>}

                        {showStatusCheck ? (
                            <div className="status-track-grid">
                                <div className="lux-input-field">
                                    <label>APPLICATION EMAIL OR REFERENCE CODE</label>
                                    <div className="input-wrap">
                                        <Search className="icon" />
                                        <input placeholder="Enter business email or Code" value={trackEmail} onChange={(e) => setTrackEmail(e.target.value)} />
                                    </div>
                                </div>
                                <button onClick={handleCheckStatus} disabled={statusLoading} className="prime-btn">{statusLoading ? 'PLEASE WAIT...' : 'CHECK STATUS'}</button>
                                
                                {statusResult && (
                                    <div className="status-box">
                                        <div className="biz-id">REFERENCE ID: {statusResult.seller_id}</div>
                                        <div className="biz-name">{statusResult.name}</div>
                                        <div className={`status-pill ${statusResult.verification_status}`}>{statusResult.verification_status}</div>
                                        <p className="timeline-msg">{statusResult.timeline}</p>
                                    </div>
                                )}
                                <div onClick={() => setShowStatusCheck(false)} className="cancel-track">Back to Login</div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="inputs-layer">
                                    <div className="lux-input-field">
                                        <label>{(isLogin || selectedPortal.toUpperCase() === 'ADMIN') ? 'SECURED USER ID' : 'PICK A USER NAME'}</label>
                                        <div className="input-wrap">
                                            <Mail className="icon" />
                                            <input name="username" placeholder={selectedPortal.toUpperCase() === 'ADMIN' ? "Admin Username" : "e.g. yourname_shop"} value={formData.username} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    {(selectedPortal.toUpperCase() !== 'ADMIN' && !isLogin) && (
                                        <>
                                            <div className="lux-input-field">
                                                <label>CONTACT EMAIL</label>
                                                <div className="input-wrap">
                                                    <Shield className="icon" />
                                                    <input name="email" placeholder="example@email.com" value={formData.email} onChange={handleInputChange} required />
                                                </div>
                                            </div>
                                            <div className="lux-input-field">
                                                <label>{selectedPortal === 'SELLER' ? 'COMPANY NAME' : 'HOSPITAL / SHOP NAME'}</label>
                                                <div className="input-wrap">
                                                    <Building className="icon" />
                                                    <input name="name" placeholder="Full Official Name" value={formData.name} onChange={handleInputChange} required />
                                                </div>
                                            </div>
                                            {selectedPortal === 'SELLER' && (
                                                <div className="lux-input-field">
                                                    <label>DRUG LICENSE OR REG NO.</label>
                                                    <div className="input-wrap">
                                                        <Activity className="icon" />
                                                        <input name="license_no" placeholder="Registration Number" value={formData.license_no} onChange={handleInputChange} required />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="lux-input-field">
                                                <label>PHONE NUMBER</label>
                                                <div className="input-wrap">
                                                    <Phone className="icon" />
                                                    <input name="phone" placeholder="+91..." value={formData.phone} onChange={handleInputChange} required />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="lux-input-field">
                                        <label>VAULT PASSWORD</label>
                                        <div className="input-wrap">
                                            <Lock className="icon" />
                                            <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                                            <div onClick={() => setShowPassword(!showPassword)} className="eye-btn">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</div>
                                        </div>
                                    </div>

                                    {(selectedPortal.toUpperCase() !== 'ADMIN' && !isLogin) && (
                                        <div className="lux-input-field">
                                            <label>RE-TYPE PASSWORD</label>
                                            <div className="input-wrap">
                                                <Lock className="icon" />
                                                <input type="password" name="confirmPassword" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={loading} className="prime-btn action-hover">
                                    {loading ? 'SYNCING...' : ( (isLogin || selectedPortal.toUpperCase() === 'ADMIN') ? `AUTHORIZE LOG IN` : 'CREATE MY ACCOUNT')}
                                </button>
                                {isLogin && selectedPortal === 'SELLER' && (
                                     <div onClick={() => setShowStatusCheck(true)} className="status-trigger"><HelpCircle size={16} /> Track My Status</div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <div style={{ zIndex: 9999, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '50px', padding: '60px', maxWidth: '520px', width: '90%', textAlign: 'center', boxShadow: '0 60px 120px rgba(0,0,0,0.3)', animation: 'popIn 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
                        <Logo size={80} />
                        {formData.role === 'BUYER' ? (
                            <>
                                <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '25px', marginBottom: '10px' }}>Account Activated! 🎉</h3>
                                <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '35px' }}>Your buyer account is ready. You can login and start ordering medicines right away.</p>
                                <button onClick={() => { setShowSuccessModal(false); setIsLogin(true); }} className="prime-btn" style={{ background: '#b62d2d' }}>LOGIN NOW →</button>
                            </>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', marginTop: '25px', marginBottom: '8px' }}>Account Created! 🏭</h3>
                                <p style={{ color: '#64748b', fontWeight: '600', fontSize: '15px', marginBottom: '30px' }}>Your seller profile is registered. <strong>Save your unique Seller Code below</strong> — use it to track approval status. You can login only after admin approves your account.</p>
                                
                                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '35px', borderRadius: '30px', marginBottom: '25px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>YOUR UNIQUE SELLER CODE</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                        <code style={{ fontSize: '42px', fontWeight: '900', color: '#f59e0b', fontFamily: 'monospace', letterSpacing: '4px' }}>{registeredSellerCode}</code>
                                        <button onClick={handleCopy} style={{ background: copied ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '14px', borderRadius: '15px', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '12px' }}>
                                            {copied ? <><Check size={16} /> COPIED!</> : <><Copy size={16} /> COPY</>}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ background: '#fef9ec', border: '1px solid #fbbf24', borderRadius: '20px', padding: '20px', marginBottom: '30px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#d97706', marginBottom: '8px', letterSpacing: '1px' }}>📋 HOW TO USE THIS CODE</div>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', lineHeight: '1.8' }}>
                                        1. Go to Login → Select <strong>Seller</strong> portal<br/>
                                        2. Click <strong>"Track My Status"</strong> link below login<br/>
                                        3. Enter this code to see if Admin approved you<br/>
                                        4. Once approved → Login with your credentials
                                    </div>
                                </div>

                                <button onClick={() => { setShowSuccessModal(false); setIsLogin(true); }} className="prime-btn">BACK TO LOGIN</button>
                            </>
                        )}
                    </div>
                    <style>{`@keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }`}</style>
                </div>
            )}

            <style>{`
                .login-vibe { width: 100%; min-height: 100vh; background: white; display: flex; overflow: hidden; font-family: 'Plus Jakarta Sans', sans-serif; }
                .auth-split { width: 100%; width: 100vw; min-height: 100vh; background: white; border-radius: 0; display: flex; z-index: 20; border: none; }
                .auth-sidebar { width: 40%; min-height: 100vh; padding: 10vh 5vw; color: white; display: flex; flex-direction: column; position: relative; }
                .sidebar-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; }
                .back-portal-btn { background: rgba(255,255,255,0.1); border: none; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 11px; width: fit-content; margin-bottom: 60px; }
                .brand-focus h2 { font-size: 52px; font-weight: 900; margin-top: 30px; letter-spacing: -2px; line-height: 1; }
                .tag-clinical { background: rgba(255,255,255,0.2); width: fit-content; padding: 6px 15px; border-radius: 10px; font-size: 10px; font-weight: 900; margin-top: 15px; letter-spacing: 1px; }
                .benefit-list { margin-top: auto; display: flex; flex-direction: column; gap: 30px; }
                .benefit { display: flex; align-items: center; gap: 20px; font-weight: 700; font-size: 18px; opacity: 0.9; }
                .auth-main { flex: 1; padding: 10vh 8vw; display: flex; flex-direction: column; justify-content: center; background: white; }
                .main-header { display: flex; justify-content: flex-end; margin-bottom: 40px; }
                .auth-mode-pills { display: flex; background: #f1f5f9; padding: 6px; border-radius: 20px; }
                .pill { padding: 10px 30px; border-radius: 15px; font-weight: 800; font-size: 13px; cursor: pointer; color: #64748b; transition: 0.3s; }
                .pill.active { background: white; color: #0f172a; boxShadow: 0 5px 15px rgba(0,0,0,0.05); }
                .form-content h2 { font-size: 38px; font-weight: 900; color: #0f172a; letter-spacing: -1.5px; margin-bottom: 8px; }
                .form-content p { font-size: 16px; font-weight: 600; color: #94a3b8; margin-bottom: 45px; }
                .lux-input-field { margin-bottom: 25px; }
                .lux-input-field label { font-size: 11px; font-weight: 900; color: #94a3b8; display: block; margin-bottom: 12px; letter-spacing: 1px; }
                .input-wrap { position: relative; }
                .input-wrap .icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #cbd5e1; width: 20px; }
                .input-wrap input { width: 100%; padding: 20px 20px 20px 55px; border-radius: 20px; border: 2px solid #f1f5f9; outline: none; font-weight: 700; background: #f8fafc; color: #0f172a; fontSize: 16px; transition: 0.3s; }
                .input-wrap input:focus { border-color: #cbd5e1; background: white; }
                .eye-btn { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #cbd5e1; }
                .prime-btn { width: 100%; padding: 22px; border: none; border-radius: 22px; background: #0f172a; color: white; font-weight: 900; font-size: 16px; cursor: pointer; transition: 0.3s; margin-top: 15px; }
                .prime-btn:hover { background: #1e293b; transform: translateY(-5px); boxShadow: 0 20px 40px rgba(15, 23, 42, 0.2); }
                .prime-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .error-badge { padding: 18px; border-radius: 18px; background: #fef2f2; color: #dc2626; font-weight: 700; font-size: 14px; margin-bottom: 30px; border: 1px solid #fee2e2; }
                .success-badge { padding: 18px; border-radius: 18px; background: #ecfdf5; color: #10b981; font-weight: 700; font-size: 14px; margin-bottom: 30px; border: 1px solid #d1fae5; }
                .status-trigger { text-align: center; margin-top: 25px; color: #64748b; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .id-card { background: #f8fafc; padding: 40px; border-radius: 40px; border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: space-between; margin: 30px 0; }
                .id-card code { font-size: 32px; font-weight: 900; color: #0f172a; font-family: monospace; }
                .copy-act { background: white; border: none; padding: 15px; border-radius: 50%; cursor: pointer; boxShadow: 0 5px 15px rgba(0,0,0,0.1); }
                @media (max-width: 1024px) {
                    .login-vibe { flex-direction: column; overflow-y: auto; }
                    .auth-split { flex-direction: column; height: auto; min-height: 100vh; }
                    .auth-sidebar { width: 100%; padding: 60px 40px; min-height: auto; }
                    .auth-main { padding: 60px 40px; flex: none; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
