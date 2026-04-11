import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, ShoppingCart, Star, Heart, Share2, 
  MapPin, Truck, Calendar, Store, Info, CheckCircle, Package, 
  ChevronRight, Activity, Percent, Edit3, X, FilePlus, PhoneCall, Home, Trash2, Image as ImageIcon, Database
} from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import Logo from '../components/Logo';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const { addToCart, toggleWishlist, wishlist } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [activeImg, setActiveImg] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/products/?id=${id}`);
                if (res.data && res.data.product_id) {
                    setProduct(res.data);
                    if (res.data.image_url) {
                        const gallery = (res.data.image_url.startsWith('data:')) ? [res.data.image_url] : res.data.image_url.split(',');
                        setActiveImg(gallery[0]);
                    }
                    const allRes = await apiClient.get('/products/');
                    const related = (allRes.data || []).filter(p => p.category === res.data.category && p.product_id !== res.data.product_id).slice(0, 4);
                    setRelatedProducts(related);
                } else {
                    setProduct(null);
                }
            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!user.role) {
            navigate('/login?role=BUYER', { state: { redirectTo: `/app/products/${id}` } });
            return;
        }
        
        if (user.role === 'ADMIN' || (user.role === 'SELLER' && product.seller_id === user.profile_id)) {
            navigate('/app/add-product', { state: { product } });
            return;
        }

        addToCart(product, 1);
    };

    const isLiked = wishlist.find(p => p.product_id === product?.product_id);

    const handleDelete = async () => {
        if (window.confirm("Are you sure? This will permanently remove the medicine from your clinical listing.")) {
            try {
                await apiClient.delete(`/products/?id=${id}`);
                navigate('/app/products');
            } catch (err) { alert("Failed: Could not remove the medicine."); }
        }
    };

    const handleQuickUpdate = async (field, val) => {
        try {
            await apiClient.put('/products/', { ...product, [field]: val });
            const res = await apiClient.get(`/products/?id=${id}`);
            setProduct(res.data);
            if (field === 'image_url' && val) {
                const gallery = (val.startsWith('data:')) ? [val] : val.split(',');
                setActiveImg(gallery[0]);
            }
        } catch (err) { alert("Field update failed."); }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontWeight: '900', color: '#b62d2d' }}>LOADING CLINICAL SPECS...</div>;
    if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Medicine not found.</div>;

    const mrp = Math.round((product.wholesale_price || 0) * 1.8);
    const imageUrls = (product.image_url && product.image_url.startsWith('data:')) ? [product.image_url] : (product.image_url ? product.image_url.split(',') : []);

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
                .detail-header { background: white; border-bottom: 2px solid #f1f5f9; position: sticky; top: 0; z-index: 2000; padding: 0 8%; height: 90px; display: flex; align-items: center; justify-content: space-between; }
                .breadcrumb-item { cursor: pointer; color: #475569; display: flex; align-items: center; gap: 5px; }
                .breadcrumb-item:hover { color: #b62d2d; }
                .spec-box { background: #f8fafc; border-radius: 30px; border: 1px solid #f1f5f9; padding: 40px; }
                .img-container { background: white; border-radius: 40px; border: 2px solid #f1f5f9; display: flex; align-items: center; justify-content: center; height: 550px; padding: 40px; overflow: hidden; }
                .btn-order-brick { width: 100%; padding: 22px; background: #b62d2d; color: white; border: none; borderRadius: 20px; font-weight: 900; fontSize: 18px; cursor: pointer; transition: 0.3s; display: flex; alignItems: center; justifyContent: center; gap: 15px; }
                .btn-order-brick:hover { background: #922424; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(182, 45, 45, 0.2); }
            `}</style>

            <div className="detail-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}><Logo size={42} /></div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <span onClick={() => navigate('/home')} style={{ fontWeight: '900', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>BACK TO HUB</span>
                    <button onClick={() => navigate('/login')} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '50px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>ACCOUNT ACCESS</button>
                </div>
            </div>

            <div style={{ padding: '20px 5% 60px 5%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '11px', fontWeight: '800', marginBottom: '35px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px' }}>
                    <div className="breadcrumb-item" onClick={() => navigate('/home')}><Home size={14} /> Home</div>
                    <ChevronRight size={12} /> 
                    <div className="breadcrumb-item" onClick={() => navigate('/app/products')}>Registry</div>
                    <ChevronRight size={12} /> 
                    <div className="breadcrumb-item" style={{ color: '#b62d2d' }}>{product.category || 'PHARMA'}</div>
                    <ChevronRight size={12} /> 
                    <div style={{ color: '#0f172a' }}>{product.name}</div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                    gap: 'clamp(30px, 5vw, 60px)' 
                }}>
                    <div className="img-container" style={{ height: 'auto', minHeight: '400px', alignSelf: 'start' }}>
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeImg && !activeImg.includes('default') && !imgError ? (
                                <img src={activeImg} alt={product.name} onError={() => setImgError(true)} style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Logo size={80} type="icon" />
                                    <div style={{ marginTop: '25px', fontWeight: '900', color: '#cbd5e1', fontSize: '10px', letterSpacing: '3px' }}>VERIFIED PHARMACEUTICAL</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#b62d2d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{product.category || 'Clinical Node'}</div>
                            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', marginBottom: '15px', letterSpacing: '-1.5px' }}>{product.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '15px', fontWeight: '700' }}>
                                <ShieldCheck size={18} color="#10b981" /> By {product.manufacturer || 'Authorized Laboratory'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ background: '#f8fafc', padding: '12px 15px', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '3px' }}>RETAIL MRP</div>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: '#94a3b8', textDecoration: 'line-through' }}>₹{Number(product.retail_price || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ background: 'white', padding: '12px 15px', borderRadius: '15px', border: '2px solid #ecfdf5' }}>
                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#10b981', letterSpacing: '0.5px', marginBottom: '3px' }}>YOUR PRICE</div>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>₹{Number(product.selling_price || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ background: '#fff1f2', padding: '12px 15px', borderRadius: '15px', border: '1px solid #ffe4e6' }}>
                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#b62d2d', letterSpacing: '0.5px', marginBottom: '3px' }}>BULK RATE</div>
                                <span style={{ fontSize: '18px', fontWeight: '900', color: '#b62d2d' }}>₹{Number(product.wholesale_price || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ padding: '15px 20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '30px' }}>
                            <div>
                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', letterSpacing: '1px', marginBottom: '5px' }}>RETAIL MINIMUM</div>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{product.min_order_qty || 10} Units</div>
                            </div>
                            <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                            <div>
                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', letterSpacing: '1px', marginBottom: '5px' }}>WHOLESALE START</div>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{product.min_wholesale_qty || 100} Units</div>
                            </div>
                        </div>

                        <div className="spec-box" style={{ padding: '30px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '10px', color: '#0f172a' }}>Medicine Description</h3>
                            <p style={{ color: '#64748b', fontWeight: '600', lineHeight: '1.7', fontSize: '15px' }}>{product.description || "Verified clinical stock node. This medical specification hub provides real-time access to laboratory-grade medicines, ensuring logistics transparency and procurement safety within the CareCart ecosystem."}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {user.role === 'SELLER' && (String(product.seller_id).toLowerCase() === String(user.profile_id).toLowerCase() || String(product.seller_id).toLowerCase() === String(user.user_id).toLowerCase()) ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <button onClick={() => navigate(`/app/add-product`, { state: { product } })} className="btn-order-brick" style={{ background: '#0f172a', padding: '18px', fontSize: '15px' }}>
                                        <Edit3 size={20} /> EDIT SPECS
                                    </button>
                                    <button onClick={handleDelete} className="btn-order-brick" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '18px', fontSize: '15px' }}>
                                        <Trash2 size={20} /> DELETE
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr', gap: '15px', flexWrap: 'wrap' }}>
                                    {user.role !== 'SELLER' && (
                                        <button onClick={handleAddToCart} className="btn-order-brick" style={{ padding: '20px', fontSize: '16px' }}>
                                           <ShoppingCart size={22} /> ADD TO BAG
                                        </button>
                                    )}
                                    <button onClick={() => toggleWishlist(product)} className="btn-order-brick" style={{ background: isLiked ? '#0f172a' : 'white', color: isLiked ? 'white' : '#0f172a', border: '2px solid #0f172a', padding: '20px', fontSize: '16px', gridColumn: user.role === 'SELLER' ? 'span 2' : 'auto' }}>
                                       <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} /> SAVE TO LIST
                                    </button>
                                </div>
                            )}
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' }}>
                                    <Database size={18} color="#b62d2d" />
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a' }}>Wholesale Batch</div>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b' }}>Min: {product.min_wholesale_qty || 0} units</div>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' }}>
                                    <Package size={18} color="#10b981" />
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a' }}>Retail Minimum</div>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b' }}>{product.min_order_qty || 0} unit(s)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
