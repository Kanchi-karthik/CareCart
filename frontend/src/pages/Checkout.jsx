import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, CreditCard, MapPin, Building, Phone, ArrowLeft, ShieldCheck, Activity, CheckCircle2, ChevronRight, Package, Trash2, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient from '../utils/axiosConfig';

export default function Checkout() {
    const navigate = useNavigate();
    const { 
        cart, getSubtotal, getTaxAmount, getSellerLogisticsTotal, 
        getTotal, settings, clearCart 
    } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Completed
    const [payMethod, setPayMethod] = useState('wallet'); // Default to Wallet
    const [confirmTick, setConfirmTick] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState(null);
    
    const [formData, setFormData] = useState({
        org_name: '',
        address: '',
        city: '',
        phone: '',
        zip: ''
    });

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        window.scrollTo(0, 0);
        if (cart.length === 0 && step !== 3) navigate('/app/products');
        
        if (user.username && !formData.org_name) {
            setFormData(prev => ({
                ...prev,
                org_name: user.username,
                city: user.city || '',
                phone: user.phone || ''
            }));
        }
    }, [cart, navigate, step]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const bundleId = `BNDL_${Date.now()}`;
            const shippingAddress = `${formData.org_name}, ${formData.address}, ${formData.city} - ${formData.phone}`;
            
            for (const item of cart) {
                const threshold = item.min_wholesale_qty || 100;
                const itemIsWholesale = item.quantity >= threshold;
                const unitPrice = itemIsWholesale ? (item.wholesale_price || item.selling_price) : (item.selling_price || item.retail_price || 0);

                const res = await apiClient.post('/orders/', {
                    bundle_id: bundleId,
                    buyer_id: user.profile_id || user.id,
                    product_id: item.product_id,
                    seller_id: item.seller_id,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    total_amount: unitPrice * item.quantity,
                    tax_amount: (getTaxAmount() / cart.length).toFixed(2),
                    delivery_charge: (getSellerLogisticsTotal() / cart.length).toFixed(2),
                    admin_fee: (settings.admin_travel_fee / cart.length).toFixed(2),
                    grand_total: (getTotal() / cart.length).toFixed(2),
                    status: 'PENDING',
                    shipping_address: shippingAddress,
                    payment_method: payMethod
                });
                if (res.data && res.data.order_id) {
                    setPlacedOrderId(res.data.order_id);
                }
            }
            setStep(3);
        } catch (error) {
            alert('Payment Settlement Failure. Please check bank connection.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && step !== 3) return null;

    return (
        <div className="page-transition" style={{ padding: '60px 8%', minHeight: '100vh', background: '#ffffff' }}>
            <button onClick={() => setStep(prev => prev > 1 ? prev - 1 : 1)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                <ArrowLeft size={18} /> BACK TO PREVIOUS PHASE
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                <div>
                   <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900', display: 'inline-block', marginBottom: '15px', letterSpacing: '1px' }}>SECURE PAYMENT</div>
                   <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3.5px' }}>Finish My Order.</h1>
                </div>
                {step < 3 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '900', fontSize: '12px', color: step === i ? '#b62d2d' : '#94a3b8' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= i ? '#0f172a' : '#e2e8f0', color: 'white' }}>{i}</div>
                                {i === 1 ? 'ADDRESS' : i === 2 ? 'PAYMENT' : 'FINISH'}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {step === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '45px', padding: '50px', border: '2px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Building size={32} color="#b62d2d" /> {formData.org_name || 'My Clinical Node'} / Procurement Hub
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>CLINICAL ENTITY / INSTITUTION NAME</label>
                                <input name="org_name" value={formData.org_name} onChange={handleInputChange} placeholder="e.g. Apollo Clinical Hub" style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>DETAILED LOGISTICS ADDRESS</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" placeholder="Enter facility location..." style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700', resize: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>CITY</label>
                                <input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Hyderabad" style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>SECURE CONTACT NO.</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 ..." style={{ width: '100%', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '700' }} />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} style={{ width: '100%', padding: '25px', background: '#0f172a', color: 'white', borderRadius: '25px', border: 'none', fontWeight: '900', fontSize: '18px', marginTop: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                            CONTINUE TO REVIEW <ChevronRight size={22} />
                        </button>
                    </div>
                    <SummarySidebar cart={cart} subtotal={getSubtotal()} tax={getTaxAmount()} admin_fee={settings.admin_travel_fee} shipping={getSellerLogisticsTotal()} total={getTotal()} />
                </div>
            )}

            {step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: '45px', padding: '50px', border: '2px solid #f1f5f9' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <ShieldCheck size={32} color="#10b981" /> Order Review
                        </h2>
                        
                        <div style={{ background: 'white', padding: '40px', borderRadius: '35px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '25px' }}>CHOOSE PAYMENT METHOD</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                {[
                                    { id: 'upi', label: 'UPI / Scan', icon: Activity, desc: 'Mobile Payment' },
                                    { id: 'card', label: 'Debit Card', icon: CreditCard, desc: 'Visa/Mastercard' },
                                    { id: 'bank', label: 'Net Banking', icon: Building, desc: 'Corporate Account' }
                                ].map(m => (
                                    <div 
                                        key={m.id} 
                                        onClick={() => setPayMethod(m.id)}
                                        style={{ 
                                            padding: '20px', borderRadius: '20px', border: `2px solid ${payMethod === m.id ? '#0f172a' : '#f1f5f9'}`,
                                            background: payMethod === m.id ? '#f8fafc' : 'white', cursor: 'pointer', textAlign: 'center', transition: '0.2s'
                                        }}
                                    >
                                        <m.icon size={24} color={payMethod === m.id ? '#0f172a' : '#94a3b8'} style={{ marginBottom: '10px' }} />
                                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{m.label}</div>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8' }}>{m.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '40px', borderRadius: '35px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '25px' }}>DELIVERY HUB LOCATION</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div><div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>ENTITY</div><div style={{ fontWeight: '900' }}>{formData.org_name}</div></div>
                                <div><div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>CONTACT</div><div style={{ fontWeight: '900' }}>{formData.phone}</div></div>
                                <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>LOCATION</div><div style={{ fontWeight: '900' }}>{formData.address}, {formData.city}</div></div>
                            </div>
                        </div>

                        <div 
                            onClick={() => setConfirmTick(!confirmTick)}
                            style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '30px', background: '#fffbeb', borderRadius: '25px', border: '1px solid #fef3c7', marginBottom: '50px', cursor: 'pointer' }}
                        >
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', border: '3px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', background: confirmTick ? '#f59e0b' : 'transparent' }}>
                                {confirmTick && <CheckCircle2 size={20} color="white" />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '900', color: '#92400e' }}>Ready for Settlement</div>
                                <div style={{ fontSize: '12px', color: '#92400e', opacity: 0.8 }}>I confirm the order value of ₹{getTotal().toLocaleString()} and internal fund segregation.</div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePlaceOrder}
                            disabled={!confirmTick || loading}
                            style={{ width: '100%', padding: '25px', background: confirmTick ? '#b62d2d' : '#cbd5e1', color: 'white', borderRadius: '25px', border: 'none', fontWeight: '900', fontSize: '18px', cursor: confirmTick ? 'pointer' : 'not-allowed' }}
                        >
                            {loading ? 'PROCESSING SETTLEMENT...' : `PAY FINAL AMOUNT ₹${getTotal().toLocaleString()}`}
                        </button>
                    </div>
                    <SummarySidebar cart={cart} subtotal={getSubtotal()} tax={getTaxAmount()} admin_fee={settings.admin_travel_fee} shipping={getSellerLogisticsTotal()} total={getTotal()} />
                </div>
            )}

            {step === 3 && (
                <div style={{ maxWidth: '600px', margin: '70px auto', textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}>
                        <CheckCircle2 size={60} />
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', marginBottom: '20px' }}>Order Success!</h1>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600', marginBottom: '50px' }}>Payment processed successfully. Your medicines are being prepared for shipping.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc', padding: '40px', borderRadius: '35px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                         <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>ORDER REFERENCE</div>
                         <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{placedOrderId || 'N/A'}</div>
                         <button 
                            onClick={() => window.alert('Professional PDF Invoice Saved to Downloads.')} // Mock PDF
                            style={{ background: '#b62d2d', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: '900', marginTop: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                         >
                             <FileText size={18} /> DOWNLOAD RECEIPT (PDF)
                         </button>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => { clearCart(); navigate('/app/orders'); }} style={{ flex: 1, padding: '22px', background: '#0f172a', color: 'white', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer' }}>TRACK SHIPPING</button>
                        <button onClick={() => { clearCart(); navigate('/app/products'); }} style={{ flex: 1, padding: '22px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' }}>BUY MORE</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const SummarySidebar = ({ cart, subtotal, tax, admin_fee, shipping, total }) => (
    <div style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
        <div style={{ background: '#0f172a', borderRadius: '45px', padding: '45px', color: 'white' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '30px' }}>PROCUREMENT BREAKDOWN</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px' }}>
                {cart.map(item => {
                    const threshold = item.min_wholesale_qty || 100;
                    const itemIsWholesale = item.quantity >= threshold;
                    const price = itemIsWholesale ? (item.wholesale_price || item.selling_price) : (item.selling_price || item.retail_price || 0);
                    return (
                        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                            <div>
                                <div style={{ fontWeight: '900', fontSize: '14px' }}>{item.name}</div>
                                <div style={{ fontSize: '10px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                     {item.quantity} units × ₹{price} {itemIsWholesale && <span style={{ color: '#ecfdf5', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>WHOLESALE</span>}
                                </div>
                            </div>
                            <div style={{ fontWeight: '900' }}>₹{(price * item.quantity).toLocaleString()}</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', fontWeight: '800' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}><span>Base Value</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}><span>Internal Fee</span><span>₹{admin_fee.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5 }}><span>Logistics</span><span>₹{shipping.toLocaleString()}</span></div>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: '#ecfdf5' }}>Total Price</span>
                    <span style={{ fontSize: '32px' }}>₹{total.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '35px', marginTop: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ShieldCheck color="#10b981" size={20} />
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>SECURE PAYMENT ACTIVE</div>
        </div>
    </div>
);
