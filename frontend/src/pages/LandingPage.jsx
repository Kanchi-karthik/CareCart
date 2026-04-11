import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Truck, Users, Zap, Search, ShoppingCart, 
  MapPin, PhoneCall, Bell, User, Menu, ChevronRight, 
  ArrowRight, Heart, Star, Activity, Package, Mail, 
  Facebook, Twitter, Youtube, Linkedin, Info, HelpCircle,
  Smartphone, Database, Globe, CheckCircle2, MessageSquare, ExternalLink, Phone, X, Plus, Sprout,
  Stethoscope, Pill, Thermometer, FlaskConical, Bandage, Syringe, ClipboardList
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "25% OFF Your Medicine List",
            desc: "Ordering stock for your hospital? Save big money with direct company prices today.",
            bg: "#b62d2d",
            tag: "LIMITED OFFER"
        },
        {
            title: "100% Original Clinical Meds",
            desc: "We only partner with top verified manufacturers for your clinic's safety.",
            bg: "#0f172a",
            tag: "VERIFIED SOURCE"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(s => (s + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const brands = [
        "Sun Pharma", "Cipla", "Apollo Pharmacy", "Dr. Reddy's", "Lupin", "Torrent", "Zydus", "Aurobindo", "Cadila", "Biocon"
    ];

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
                
                .offer-slider { 
                    height: 550px; position: relative; overflow: hidden; 
                    background: #f8fafc; display: flex; align-items: center;
                }
                .slide { 
                    position: absolute; inset: 0; opacity: 0; transition: 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex; align-items: center; padding: 0 8%;
                }
                .slide.active { opacity: 1; z-index: 10; }
                
                .brand-strip-container {
                    padding: 50px 0; background: #ffffff;
                    position: relative; overflow: hidden;
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
                .brand-scroll {
                    display: inline-block; white-space: nowrap; animation: scrollBrands 40s linear infinite;
                }
                @keyframes scrollBrands {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .nav-btn {
                    padding: 12px 30px; border-radius: 50px; font-weight: 800; cursor: pointer; transition: 0.3s;
                    font-size: 14px; border: none;
                }
                .nav-btn-red { background: #b62d2d; color: white; }
                .nav-btn-red:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(182, 45, 45, 0.25); }

                .grid-bg-overlay {
                    position: fixed; inset: 0; opacity: 0.05; pointer-events: none;
                    background-image: 
                        linear-gradient(#f1f5f9 2px, transparent 2px),
                        linear-gradient(90deg, #f1f5f9 2px, transparent 2px);
                    background-size: 50px 50px;
                    z-index: 1;
                }
            `}</style>
            
            <div className="grid-bg-overlay"></div>

            <nav style={{ padding: '0 8%', height: '90px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(15px)', zIndex: 1000, borderBottom: '1px solid #f1f5f9' }}>
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', zIndex: 10 }}>
                    <Logo size={42} />
                </div>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center', fontWeight: '900', fontSize: '14px', color: '#475569', zIndex: 10 }}>
                    <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', color: '#b62d2d' }}>HOME SHOP</span>
                    <span onClick={() => navigate('/how-it-works')} style={{ cursor: 'pointer' }}>GUIDE</span>
                    <span onClick={() => navigate('/franchise')} style={{ cursor: 'pointer' }}>PARTNER UP</span>
                    <button className="nav-btn nav-btn-red" onClick={() => navigate('/login')}>LOG IN / JOIN US</button>
                </div>
            </nav>

            <header className="offer-slider">
                {slides.map((s, i) => (
                    <div key={i} className={`slide ${i === currentSlide ? 'active' : ''}`} style={{ background: `linear-gradient(135deg, ${s.bg} 0%, #000 100%)` }}>
                        <div style={{ color: 'white', maxWidth: '650px', zIndex: 10 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '50px', marginBottom: '25px', fontSize: '11px', fontWeight: '900', letterSpacing: '2px' }}>
                                <Activity size={16} color="#f59e0b" /> {s.tag}
                            </div>
                            <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-2px' }}>{s.title}</h1>
                            <p style={{ fontSize: '20px', opacity: 0.7, marginBottom: '45px', fontWeight: '600', lineHeight: 1.6 }}>{s.desc}</p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button className="nav-btn" style={{ background: 'white', color: '#0f172a', padding: '20px 50px', fontSize: '18px' }} onClick={() => navigate('/home')}>GO TO MEDICINE SHOP</button>
                                <button className="nav-btn" style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.2)', padding: '20px 40px', fontSize: '18px' }} onClick={() => navigate('/how-it-works')}>HOW TO ORDER</button>
                            </div>
                        </div>
                    </div>
                ))}
            </header>

            <div className="brand-strip-container">
                <div className="brand-scroll">
                    {[...brands, ...brands].map((b, i) => (
                        <span key={i} style={{ margin: '0 80px', fontSize: '28px', fontWeight: '900', color: '#cbd5e1', letterSpacing: '2px', opacity: 0.8 }}>{b.toUpperCase()}</span>
                    ))}
                </div>
            </div>

            <section style={{ padding: '120px 8%', textAlign: 'center', position: 'relative', zIndex: 5 }}>
                <div style={{ display: 'inline-block', background: '#fee2e2', color: '#b62d2d', padding: '10px 25px', borderRadius: '50px', fontSize: '12px', fontWeight: '900', marginBottom: '30px', letterSpacing: '2px' }}>OUR SERVICES</div>
                <h2 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', marginBottom: '80px', letterSpacing: '-2px' }}>Medicine Supply Made <span style={{ color: '#b62d2d' }}>Simple.</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                    {[
                        { title: "Real & Safe Meds", desc: "No generic nodes here. We deliver 100% original and verified hospital medicines directly to you.", icon: ShieldCheck, color: "#10b981" },
                        { title: "Easy Wholesale", desc: "Browse a specialized clinical registry and buy in bulk with just one simple tap.", icon: ShoppingCart, color: "#b62d2d" },
                        { title: "Express Logistics", desc: "Your clinical stock arrives faster than ever with our state-of-the-art delivery fleet.", icon: Truck, color: "#3b82f6" }
                    ].map((f, i) => (
                        <div key={i} style={{ padding: '70px 50px', borderRadius: '50px', background: '#ffffff', border: '1px solid #f1f5f9', transition: '0.4s', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-15px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                            <div style={{ background: `${f.color}10`, width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}>
                                <f.icon size={50} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '20px', color: '#0f172a' }}>{f.title}</h3>
                            <p style={{ color: '#64748b', fontWeight: '600', lineHeight: '1.8', fontSize: '17px' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer style={{ background: '#0f172a', padding: '120px 8% 60px', color: 'white', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '100px', marginBottom: '100px' }}>
                    <div>
                        <Logo size={45} inverse />
                        <p style={{ marginTop: '30px', color: '#94a3b8', fontWeight: '600', fontSize: '16px', lineHeight: '1.8', maxWidth: '400px' }}>The trusted medicine procurement partner for hospitals and clinical stores across the country.</p>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '900', marginBottom: '40px', letterSpacing: '1px' }}>RESOURCES</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#94a3b8', fontWeight: '700' }}>
                            <span onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} onMouseOver={(e)=>e.target.style.color='white'} onMouseOut={(e)=>e.target.style.color='#94a3b8'}>Browse Home Hub</span>
                            <span onClick={() => navigate('/franchise')} style={{ cursor: 'pointer' }} onMouseOver={(e)=>e.target.style.color='white'} onMouseOut={(e)=>e.target.style.color='#94a3b8'}>Open a Partner Branch</span>
                            <span onClick={() => navigate('/how-it-works')} style={{ cursor: 'pointer' }} onMouseOver={(e)=>e.target.style.color='white'} onMouseOut={(e)=>e.target.style.color='#94a3b8'}>How CareCart Works</span>
                        </div>
                    </div>
                    <div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '45px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '20px' }}>OFFICIAL HELPLINE</h4>
                            <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: '900', marginBottom: '10px' }}>+91-8885 XXX XXX</div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '800' }}>Call us for order help or medicine queries.</p>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#334155', fontWeight: '800' }}>&copy; 2026 CARECART MEDICINES PVT LTD. PROTECTING CLINICAL INTEGRITY.</p>
                    <span onClick={() => navigate('/login?role=admin')} style={{ fontSize: '10px', color: '#1e293b', cursor: 'pointer', opacity: 0.3 }} onMouseOver={(e)=>e.target.style.opacity=1} onMouseOut={(e)=>e.target.style.opacity=0.3}>System Admin Portal</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
