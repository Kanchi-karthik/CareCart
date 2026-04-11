import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowRight, Truck, ShieldCheck, Zap, Database, Globe, 
    CheckCircle2, ChevronRight, Activity, Box, Shield, ShoppingCart 
} from 'lucide-react';
import Logo from '../components/Logo';

const HowItWorks = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      title: "1. Checking Everyone",
      desc: "We check every medicine company and hospital before they join. We make sure they have real licenses and follow safety rules.",
      icon: ShieldCheck,
      color: "#b62d2d",
      detail: "FULLY_SAFE"
    },
    {
      title: "2. Updating Stocks",
      desc: "Medicine companies update their list of medicines with us. You can see what is available in real-time on our store.",
      icon: Database,
      color: "#f59e0b",
      detail: "LIVE_MEDS"
    },
    {
      title: "3. Buying Medicines",
      desc: "Hospitals and medicine shops can browse our list and buy in bulk. We handle the prices and taxes automatically for you.",
      icon: ShoppingCart,
      color: "#3b82f6",
      detail: "EASY_BUY"
    },
    {
      title: "4. Fast Delivery",
      desc: "Once you buy, our delivery team picks up the medicine from the company and brings it safely to your shop doorstep.",
      icon: Truck,
      color: "#10b981",
      detail: "FAST_DELIVERY"
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        
        .glass-header { 
            background: rgba(255,255,255,0.9); 
            backdrop-filter: blur(10px); 
            border-bottom: 1px solid #f1f5f9;
        }
        
        .step-card {
            background: #f8fafc; 
            border: 1px solid #f1f5f9; 
            border-radius: 40px; 
            padding: 50px;
            transition: all 0.4s ease;
            position: relative;
        }
        .step-card:hover { transform: translateY(-10px); background: white; box-shadow: 0 30px 60px rgba(0,0,0,0.05); }

        .luxury-btn {
            padding: 15px 35px; border-radius: 12px; font-weight: 800;
            font-size: 15px; cursor: pointer; transition: 0.3s; border: none; 
            display: flex; align-items: center; gap: 10px;
        }
        .btn-navy { background: #0f172a; color: white; }
        .btn-navy:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
      `}</style>

      <nav className="glass-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: scrolled ? '15px 8%' : '25px 8%', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}><Logo size={scrolled ? 35 : 45} /></div>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#475569', fontWeight: '800', fontSize: '14px' }}>HOME</span>
            <button onClick={() => navigate('/login')} className="luxury-btn btn-navy" style={{ padding: '10px 25px' }}>
              LOGIN NOW
            </button>
          </div>
        </div>
      </nav>

      <section style={{ paddingTop: '200px', paddingBottom: '100px', textAlign: 'center', paddingLeft: '8%', paddingRight: '8%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 20px', borderRadius: '50px', border: '1px solid #e2e8f0', marginBottom: '30px', color: '#b62d2d', fontSize: '12px', fontWeight: '900' }}>
            <Activity size={16} /> SIMPLE & SECURE PROCESS
        </div>
        <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#0f172a', marginBottom: '30px', lineHeight: '1.1' }}>
          How <span style={{ color: '#b62d2d' }}>CareCart</span> Helps You.
        </h1>
        <p style={{ color: '#64748b', fontSize: '20px', fontWeight: '600', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6' }}>
          We make medicine buying and selling very easy for hospitals and companies. No more complex steps, just fast and safe deliveries.
        </p>
      </section>

      <section style={{ padding: '0 8% 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          {steps.map((step, i) => (
            <div key={i} className="step-card">
              <div style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '10px', fontWeight: '900', color: '#b62d2d', background: 'white', padding: '6px 12px', borderRadius: '50px', border: '1px solid #f1f5f9' }}>
                {step.detail}
              </div>
              <div style={{ background: `${step.color}15`, color: step.color, width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '35px' }}>
                <step.icon size={35} />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>{step.title}</h3>
              <p style={{ color: '#64748b', fontSize: '17px', lineHeight: '1.7', fontWeight: '600' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '120px', background: '#0f172a', borderRadius: '50px', padding: '100px 8%', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '25px' }}>Start Your Business Today.</h2>
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px', fontWeight: '600' }}>
              Whether you are a big medicine company or a small medical clinic, CareCart helps you grow faster.
            </p>
            <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/login?role=BUYER')} className="luxury-btn" style={{ background: '#f59e0b', color: '#0f172a', padding: '20px 40px' }}>
                SIGN UP AS BUYER <ChevronRight size={20} />
              </button>
              <button onClick={() => navigate('/login?role=SELLER')} className="luxury-btn" style={{ background: 'white', color: '#0f172a', padding: '20px 40px' }}>
                SIGN UP AS SELLER <ArrowRight size={20} />
              </button>
            </div>
        </div>
      </section>

      <footer style={{ background: '#f8fafc', padding: '100px 8%', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Logo size={40} />
        <p style={{ marginTop: '30px', color: '#94a3b8', fontSize: '13px', fontWeight: '800' }}>
          © 2026 CARECART MEDICINES PVT LTD. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default HowItWorks;
