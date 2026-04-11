import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Users, Layout, ChevronLeft, MapPin, DollarSign, Mail, Phone, ShoppingBag, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Franchise = () => {
    const navigate = useNavigate();

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
                
                .nav-mini { padding: 25px 8%; display: flex; align-items: center; background: white; border-bottom: 1px solid #e2e8f0; }
                .hero-franchise { padding: 100px 8%; text-align: center; background: white; border-bottom: 1px solid #f1f5f9; }
                .benefit-card { padding: 40px; background: white; border-radius: 30px; border: 1px solid #f1f5f9; transition: 0.3s; }
                .benefit-card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.05); }
                .form-box { background: white; padding: 60px; border-radius: 40px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
                .input-field { width: 100%; padding: 18px; border-radius: 12px; border: 2px solid #f1f5f9; margin-bottom: 20px; outline: none; transition: 0.3s; font-weight: 600; }
                .input-field:focus { border-color: #b62d2d; }
            `}</style>

            <div className="nav-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <Logo size={40} />
                <div style={{ marginLeft: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontWeight: '800', fontSize: '13px' }}>
                    <ChevronLeft size={20} /> GO BACK
                </div>
            </div>

            <section className="hero-franchise">
                <div style={{ display: 'inline-block', background: '#fee2e2', color: '#b62d2d', padding: '10px 25px', borderRadius: '50px', fontSize: '12px', fontWeight: '900', marginBottom: '30px', letterSpacing: '1.5px' }}>
                    JOIN AS A PARTNER
                </div>
                <h1 style={{ fontSize: '64px', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>Open Your Own <br/><span style={{ color: '#b62d2d' }}>Medicine Branch.</span></h1>
                <p style={{ fontSize: '20px', color: '#64748b', fontWeight: '600', maxWidth: '700px', margin: '0 auto 60px' }}>Join the fastest growing medicine network. Work with top companies and deliver original medicines to everyone who needs them.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                    <div className="benefit-card">
                        <Truck size={40} color="#b62d2d" style={{ marginBottom: '25px' }} />
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>Delivery Support</h3>
                        <p style={{ color: '#64748b', fontWeight: '600' }}>We help you with fast and safe medicine deliveries in your area.</p>
                    </div>
                    <div className="benefit-card">
                        <DollarSign size={40} color="#b62d2d" style={{ marginBottom: '25px' }} />
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>High Earnings</h3>
                        <p style={{ color: '#64748b', fontWeight: '600' }}>Get low wholesale prices from top companies and earn more profit.</p>
                    </div>
                    <div className="benefit-card">
                        <Users size={40} color="#b62d2d" style={{ marginBottom: '25px' }} />
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>More Customers</h3>
                        <p style={{ color: '#64748b', fontWeight: '600' }}>Connect with 1000s of hospitals and clinic customers in our network.</p>
                    </div>
                </div>
            </section>

            <section style={{ padding: '120px 8%', background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>Why Work <br/>With CareCart?</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                           <div style={{ display: 'flex', gap: '20px' }}>
                               <CheckCircle size={28} color="#b62d2d" />
                               <div>
                                   <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Real Medicine Quality</div>
                                   <div style={{ color: '#64748b', fontWeight: '600' }}>We only work with the best and safest medicine companies.</div>
                               </div>
                           </div>
                           <div style={{ display: 'flex', gap: '20px' }}>
                               <CheckCircle size={28} color="#b62d2d" />
                               <div>
                                   <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Training Helps</div>
                                   <div style={{ color: '#64748b', fontWeight: '600' }}>We will teach you how to handle medicines and manage your store.</div>
                               </div>
                           </div>
                           <div style={{ display: 'flex', gap: '20px' }}>
                               <CheckCircle size={28} color="#b62d2d" />
                               <div>
                                   <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>24/7 Helpline Support</div>
                                   <div style={{ color: '#64748b', fontWeight: '600' }}>Call us anytime if you need help with your business.</div>
                               </div>
                           </div>
                        </div>
                    </div>

                    <div className="form-box">
                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Get in Touch</h3>
                        <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '40px' }}>Leave your details and we will call you back today.</p>
                        
                        <input className="input-field" placeholder="Full Name" />
                        <input className="input-field" placeholder="Mobile Number" />
                        <input className="input-field" placeholder="Your City" />
                        <textarea className="input-field" style={{ height: '120px', resize: 'none' }} placeholder="Tell us about yourself..."></textarea>
                        
                        <button style={{ width: '100%', padding: '22px', background: '#b62d2d', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '18px' }}>SEND DETAILS</button>
                    </div>
                </div>
            </section>

            <footer style={{ background: '#0f172a', color: 'white', padding: '100px 8% 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <Logo size={40} inverse />
                        <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Your Trusted Medicine Partner. Helping medicines reach every person who needs them.</p>
                    </div>
                    <div></div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#f59e0b', marginBottom: '15px' }}>HELPLINES</div>
                        <div style={{ fontSize: '24px', fontWeight: '900' }}>+91-8885 XXX XXX</div>
                        <div style={{ color: '#64748b', fontWeight: '800', marginTop: '10px' }}>help@carecart.in</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Franchise;
