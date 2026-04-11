import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Pill, Package, ArrowRight, Info, ShieldCheck, ChevronRight, Truck, Receipt, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Logo from '../components/Logo';

export default function Cart() {
    const navigate = useNavigate();
    const { 
        cart, updateQuantity, removeFromCart, getSubtotal, getTaxAmount, 
        getSellerLogisticsTotal, getTotal, settings 
    } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (cart.length === 0) {
        return (
            <div className="page-transition" style={{ padding: '100px 8%', textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '80px', borderRadius: '50px', border: '2px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.03)' }}>
                    <div style={{ position: 'relative' }}>
                        <ShoppingBag size={100} color="#e2e8f0" />
                        <div style={{ position: 'absolute', top: '0', right: '-10px', background: '#b62d2d', width: '30px', height: '30px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>0</div>
                    </div>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a' }}>My Bag is Empty</h2>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600', maxWidth: '450px' }}>You haven't added any medicines yet.</p>
                    <button onClick={() => navigate('/app/products')} style={{ padding: '18px 40px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        SEE MEDICINES LIST <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-transition" style={{ padding: '60px 5%' }}>
            <div style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#b62d2d', fontWeight: '900', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <Truck size={16} /> DELIVERY BAG
                </div>
                <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2.5px' }}>Review My Order.</h1>
                <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>Transactional Hub: Multi-seller procurement summary.</p>
            </div>

            <div className="cart-grid">
                {/* Medicines List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {cart.map((item) => {
                        const isWholesale = item.quantity >= (item.min_wholesale_qty || 100);
                        const price = isWholesale ? (item.wholesale_price || item.selling_price) : (item.selling_price || item.retail_price || 0);
                        return (
                            <div key={item.product_id} className="item-card responsive-item-card" style={{ background: 'white', borderRadius: '35px', padding: '30px', display: 'flex', gap: '30px', alignItems: 'center', border: '2px solid #f1f5f9' }}>
                                <div className="item-img-node" style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Package size={45} color="#cbd5e1" />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#b62d2d', letterSpacing: '1px', textTransform: 'uppercase' }}>{item.category || 'PHARMACEUTICAL'}</div>
                                        {isWholesale && <div style={{ background: '#fef2f2', color: '#b62d2d', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' }}>WHOLESALE APPLIED</div>}
                                    </div>
                                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '5px 0' }}>{item.name}</h3>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Supplier Node: {item.seller_name || 'Authorized Lab'}</div>
                                </div>

                                <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc', padding: '12px 18px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Minus size={16} /></button>
                                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Plus size={16} /></button>
                                </div>

                                <div className="price-node" style={{ textAlign: 'right', minWidth: '150px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>₹{(price * item.quantity).toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: isWholesale ? '#b62d2d' : '#94a3b8' }}>
                                        ₹{Number(price).toLocaleString()} / UNIT
                                    </div>
                                    <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', marginTop: '10px' }}>
                                        <Trash2 size={14} /> REMOVE
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    
                    <button onClick={() => navigate('/app/products')} style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', padding: '25px', borderRadius: '25px', color: '#64748b', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <Plus size={20} /> ADD MORE MEDICINES
                    </button>
                </div>

                {/* Summary */}
                <div className="summary-wrapper" style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                    <div style={{ background: '#0f172a', borderRadius: '45px', padding: 'clamp(20px, 5vw, 50px)', color: 'white', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '40px' }}>
                            <Receipt size={32} color="#f59e0b" />
                            <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Bill Summary</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '45px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: '15px' }}>
                                <span>PROCUREMENT VALUE</span>
                                <span style={{ color: 'white' }}>₹{getSubtotal().toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: '15px' }}>
                                <span>TAX (GST {settings.tax_percent}%)</span>
                                <span style={{ color: 'white' }}>₹{getTaxAmount().toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: '15px' }}>
                                <span>TRAVEL CHARGES (ADMIN)</span>
                                <span style={{ color: 'white' }}>₹{settings.admin_travel_fee.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: '15px' }}>
                                <span>LOGISTICS FEE (SELLERS)</span>
                                <span style={{ color: 'white' }}>₹{getSellerLogisticsTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '35px', marginBottom: '50px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '900', color: 'rgba(255,255,255,0.5)' }}>TOTAL PAYABLE (₹)</span>
                                <span style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '900', color: '#f59e0b' }}>₹{getTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/app/checkout')}
                            style={{ width: '100%', padding: '24px', background: '#b62d2d', color: 'white', border: 'none', borderRadius: '25px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
                        >
                            PAY NOW <ChevronRight size={22} />
                        </button>

                        <div style={{ marginTop: '35px', display: 'flex', gap: '15px', padding: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '25px' }}>
                            <ShieldCheck color="#10b981" />
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', lineHeight: '1.6', margin: 0 }}>
                                Safe Payment: Your payment is secured and will be distributed to medicine suppliers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .cart-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: clamp(20px, 5vw, 60px);
                }
                
                @media (max-width: 1400px) {
                    .cart-grid { grid-template-columns: 1fr; }
                    .summary-wrapper { position: static !important; }
                }

                @media (max-width: 768px) {
                    .responsive-item-card { 
                        flex-direction: column; 
                        align-items: flex-start !important; 
                        padding: 20px !important; 
                        gap: 15px !important;
                    }
                    .price-node { 
                        text-align: left !important; 
                        min-width: 0 !important; 
                        width: 100%; 
                        margin-top: 15px; 
                        border-top: 1px solid #f1f5f9; 
                        padding-top: 15px; 
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                    }
                    .item-img-node { width: 60px !important; height: 60px !important; }
                }
            `}</style>
        </div>
    );
}
