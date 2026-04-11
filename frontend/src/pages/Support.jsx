import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HelpCircle, ArrowLeft, Book, ShieldAlert, Mail,
    MessageSquare, Phone, ChevronRight, X, ExternalLink,
    Search, PlayCircle, Download, CheckCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Support = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const downloadGuide = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(24);
            doc.setTextColor(15, 23, 42);
            doc.text('CareCart Partner Guide', 14, 25);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
            doc.text(`Notice: Official Business Document`, 14, 40);

            autoTable(doc, {
                startY: 50,
                head: [['Topic', 'Policy', 'Details']],
                body: [
                    ['Fast Delivery', '24-48 Hours', 'Nationwide Network'],
                    ['Genuine Medicine', '100% Verified', 'From Mfgs Only'],
                    ['Payment Terms', '7 Day Credit', 'Secure Transactions'],
                    ['Return Policy', 'Easy Exchange', 'For Expired Stock'],
                    ['Support', '24/7 Helpline', 'Call 1800-PHARMA']
                ],
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] }
            });

            doc.save(`CareCart_Partner_Guide_${Date.now()}.pdf`);
        } catch (err) {
            console.error("Guide Export failed:", err);
            alert("Guide Download Failure: Please try again.");
        }
    };

    const supportCards = [
        {
            id: 'help',
            title: 'Common Questions',
            desc: 'Find quick answers about ordering, tracking, and shop registration.',
            icon: HelpCircle,
            color: '#3498db',
            content: [
                { q: 'How do I start a retail shop?', a: 'Sign up as a "Shop Partner", upload your Pharma license, and start ordering.' },
                { q: 'What is the minimum order value?', a: 'Minimum bulk orders usually start from 10 units per medicine.' },
                { q: 'Is my data secure?', a: 'Yes, we use bank-grade security to protect your shop and order details.' }
            ]
        },
        {
            id: 'api',
            title: 'Sell with Us',
            desc: 'Information for manufacturers and suppliers wanting to list products.',
            icon: Book,
            color: '#9b59b6',
            code: 'Dear CareCart Team,\n\nWe would like to list our pharmaceutical products on your platform.\n\nCompany Name: [Your Company]\nLicense No: [Your License]\nContact: [Your Phone]\n\nBest regards.'
        },
        {
            id: 'security',
            title: 'Business Quality',
            desc: 'Our commitment to quality standards and safe medicine distribution.',
            icon: ShieldAlert,
            color: '#e67e22',
            stats: [
                { label: 'Delivery Rate', value: '99.9%' },
                { label: 'Verified Sellers', value: '500+' },
                { label: 'Licensed Items', value: '10k+' }
            ]
        },
        {
            id: 'sales',
            title: 'Business Query',
            desc: 'Contact our partner team for bulk pricing or distribution setups.',
            icon: Mail,
            color: '#1abc9c',
            form: true
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulated success for demo/UX purposes
            setSubmitted(true);
            setFormData({ fullName: '', email: '', message: '' });
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to send request. Please contact us via phone.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', padding: '100px 10%', fontFamily: "'Outfit', sans-serif", position: 'relative' }}>
            <style>{`
            .card-interactive:hover { transform: translateY(-10px); background: #fff !important; box-shadow: 0 40px 80px rgba(0,0,0,0.06); border-color: #b62d2d30 !important; }
            .chat-bubble { position: fixed; bottom: 40px; right: 40px; width: 350px; height: 500px; background: white; border-radius: 30px; border: 1px solid #eee; box-shadow: 0 20px 50px rgba(0,0,0,0.1); z-index: 1000; overflow: hidden; display: flex; flexDirection: column; }
        `}</style>

            <button
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '900', color: '#b62d2d', cursor: 'pointer', marginBottom: '50px' }}
            >
                <ArrowLeft size={20} /> BACK TO HOME
            </button>

            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h1 style={{ fontSize: '72px', fontWeight: '900', color: '#0f172a', letterSpacing: '-4px', marginBottom: '20px' }}>Help & Support</h1>
                <p style={{ fontSize: '22px', color: '#64748b', fontWeight: '500', maxWidth: '700px', margin: '0 auto' }}>
                    Welcome to the CareCart Help Desk. We're here to help you grow your pharmacy business.
                </p>
            </div>

            {/* Interactive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '100px' }}>
                {supportCards.map((card, i) => (
                    <div
                        key={i}
                        className="card-interactive"
                        onClick={() => setActiveTab(card.id)}
                        style={{
                            padding: '50px 40px',
                            background: activeTab === card.id ? '#fff' : '#f8fafc',
                            borderRadius: '40px',
                            border: `2px solid ${activeTab === card.id ? card.color : '#f1f5f9'}`,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        <div style={{ color: card.color, marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                            <card.icon size={56} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>{card.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', fontWeight: '500', marginBottom: '25px' }}>{card.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '900', color: card.color, fontSize: '14px' }}>
                            EXPLORE <ChevronRight size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dynamic Content Section */}
            {activeTab && (
                <div style={{ background: '#f8fafc', borderRadius: '50px', padding: '80px', marginBottom: '100px', border: '1px solid #f1f5f9', position: 'relative' }}>
                    <button onClick={() => setActiveTab(null)} style={{ position: 'absolute', top: '40px', right: '40px', background: 'white', border: 'none', padding: '15px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                        <X size={24} />
                    </button>

                    {activeTab === 'help' && (
                        <div>
                            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '40px' }}>Frequently Asked Questions</h2>
                            <div style={{ display: 'grid', gap: '30px' }}>
                                {supportCards[0].content.map((item, idx) => (
                                    <div key={idx} style={{ background: 'white', padding: '30px', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: '900', fontSize: '18px', marginBottom: '10px', color: '#0f172a' }}>{item.q}</div>
                                        <div style={{ color: '#64748b', fontWeight: '600' }}>{item.a}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div>
                            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '20px' }}>System Integration</h2>
                            <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '40px' }}>Use our secure endpoints to sync your inventory nodes.</p>
                            <pre style={{ background: '#0f172a', color: '#10b981', padding: '40px', borderRadius: '30px', fontSize: '16px', fontWeight: '700', overflowX: 'auto' }}>
                                {supportCards[1].code}
                            </pre>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '40px' }}>Quality & Trust</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                                {supportCards[2].stats.map((s, idx) => (
                                    <div key={idx} style={{ background: 'white', padding: '40px', borderRadius: '30px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px' }}>{s.label}</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#e67e22' }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={downloadGuide} 
                                style={{ marginTop: '50px', background: '#0f172a', color: 'white', border: 'none', padding: '20px 40px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '50px auto 0' }}
                            >
                                <Download size={20} /> DOWNLOAD PARTNER GUIDE
                            </button>
                        </div>
                    )}

                    {activeTab === 'sales' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ color: '#1abc9c', marginBottom: '20px' }}><CheckCircle size={80} style={{ margin: '0 auto' }} /></div>
                                    <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px' }}>Request Sent!</h2>
                                    <p style={{ color: '#64748b', fontWeight: '600' }}>Our enterprise team will contact you within 24 hours.</p>
                                    <button onClick={() => setSubmitted(false)} style={{ marginTop: '30px', background: '#0f172a', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>SEND ANOTHER</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '40px', textAlign: 'center' }}>Message Our Team</h2>
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your Full Name"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            style={{ width: '100%', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', fontWeight: '600' }}
                                        />
                                        <input
                                            type="email"
                                            required
                                            placeholder="Your Contact Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            style={{ width: '100%', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', fontWeight: '600' }}
                                        />
                                        <textarea
                                            required
                                            placeholder="Tell us about your requirement..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows="4"
                                            style={{ width: '100%', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', fontWeight: '600' }}
                                        ></textarea>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{ background: '#1abc9c', color: 'white', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                                        >
                                            {loading ? 'SENDING...' : 'SEND MESSAGE'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Still need help? Bar */}
            <div style={{ background: '#0f172a', padding: '60px 80px', borderRadius: '50px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
                <div>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '10px' }}>Still need help?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: '18px' }}>Our support engineers are ready to assist you.</p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button onClick={() => setShowChat(true)} style={{ background: '#b62d2d', border: 'none', color: 'white', padding: '20px 45px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px' }}>
                        <MessageSquare size={22} fill="white" /> LIVE CHAT
                    </button>
                    <a href="tel:+1800MEDICART" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '20px 45px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px' }}>
                        <Phone size={22} fill="white" /> CALL US
                    </a>
                </div>
            </div>

            {/* Mock Chat Window */}
            {showChat && (
                <div className="chat-bubble">
                    <div style={{ background: '#b62d2d', padding: '20px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '900' }}>MediCart Assistant</div>
                        <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowChat(false)} />
                    </div>
                    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc' }}>
                        <div style={{ background: 'white', padding: '15px 20px', borderRadius: '20px 20px 20px 0', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', maxWidth: '85%' }}>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Hello! I'm the MediCart AI Support. How can I help you today?</p>
                        </div>
                    </div>
                    <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                        <input type="text" placeholder="Type a message..." style={{ width: '100%', padding: '15px 25px', borderRadius: '25px', border: '1px solid #eee' }} />
                    </div>
                </div>
            )}

            <footer style={{ marginTop: '120px', borderTop: '1px solid #f1f5f9', paddingTop: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '800' }}>
                © 2026 CARECART NETWORK SUPPORT - PRIORITY HELP
            </footer>
        </div>
    );
};

export default Support;
