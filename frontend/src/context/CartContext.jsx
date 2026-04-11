import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Persistent Medicine Storage (Safe Across Session Transitions)
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('carecart_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('carecart_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Professional Business Settings (Admin Managed Payout Architecture)
    const [settings, setSettings] = useState({
        tax_percent: 0.2,          // Unified Application Usage GST (0.2%)
        delivery_charge: 150,      // Base Logistics Fee per Seller
        admin_travel_fee: 50       // Standard Admin Surcharge
    });

    useEffect(() => {
        localStorage.setItem('carecart_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('carecart_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToCart = (product, qty = 1) => {
        if (!product) return;
        
        // Institutional Constraint Enforcement: Respect Minimum Order Quantity (MOQ)
        const minQty = product.min_order_qty || product.min_wholesale_qty || 1;
        const effectiveQty = Math.max(qty, minQty);

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.product_id);
            if (existing) {
                const newQty = existing.quantity + qty;
                showToast(`Inventory updated: ${product.name} increased to ${newQty} units.`);
                return prev.map(item => 
                    item.product_id === product.product_id 
                        ? { ...item, quantity: newQty } 
                        : item
                );
            }
            showToast(`Clinical Node Success: ${product.name} added to procurement bag.`);
            return [...prev, { ...product, quantity: effectiveQty }];
        });
    };

    const toggleWishlist = (product) => {
        if (!product) return;
        setWishlist(prev => {
            const exists = prev.find(p => p.product_id === product.product_id);
            if (exists) return prev.filter(p => p.product_id !== product.product_id);
            return [...prev, product];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, qty) => {
        if (qty < 1) return removeFromCart(productId);
        
        setCart(prev => prev.map(item => {
            if (item.product_id === productId) {
                // Prevent falling below institutional minimums
                const minQty = item.min_order_qty || item.min_wholesale_qty || 1;
                if (qty < minQty) {
                    showToast(`Error: Minimum procurement for this node is ${minQty} units.`, 'error');
                    return item;
                }
                return { ...item, quantity: qty };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const getSubtotal = () => {
        return cart.reduce((sum, item) => {
            // Tiered Pricing Logic: Wholesale price applies for min_wholesale_qty+ units
            const threshold = item.min_wholesale_qty || 100;
            const isWholesale = item.quantity >= threshold;
            const price = isWholesale ? (item.wholesale_price || item.selling_price || item.retail_price || 0) : (item.selling_price || item.retail_price || 0);
            return sum + (Number(price) * item.quantity);
        }, 0);
    };

    const getTaxAmount = () => {
        return (getSubtotal() * settings.tax_percent) / 100;
    };

    const getSellerLogisticsTotal = () => {
        // Flat logistics fee per unique seller in the cart
        const uniqueSellers = new Set(cart.map(item => item.seller_id)).size;
        return uniqueSellers * settings.delivery_charge;
    };

    const getTotal = () => {
        const sub = getSubtotal();
        if (sub === 0) return 0;
        return sub + getTaxAmount() + getSellerLogisticsTotal() + settings.admin_travel_fee;
    };

    return (
        <CartContext.Provider value={{ 
            cart, wishlist, addToCart, toggleWishlist, removeFromCart, updateQuantity, clearCart, 
            getSubtotal, getTaxAmount, getTotal, getSellerLogisticsTotal, settings, setSettings,
            showToast // Optional: expose for direct usage
        }}>
            {children}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#b62d2d' : '#0f172a', color: 'white',
                    padding: '16px 32px', borderRadius: '50px', fontWeight: '900', fontSize: '13px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)', zIndex: 10000, 
                    display: 'flex', alignItems: 'center', gap: '15px', animation: 'slideUp 0.4s ease-out'
                }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: toast.type === 'error' ? 'white' : '#10b981' }}></div>
                    {toast.message}
                    <style>{`
                        @keyframes slideUp {
                            from { transform: translate(-50%, 50px); opacity: 0; }
                            to { transform: translate(-50%, 0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
