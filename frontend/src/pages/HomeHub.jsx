import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Truck, Users, Zap, Search, ShoppingCart, 
  MapPin, PhoneCall, Bell, User, Menu, ChevronRight, 
  ArrowRight, Heart, Star, Activity, Package, Mail, 
  Facebook, Twitter, Youtube, Linkedin, Info, HelpCircle,
  Smartphone, Database, Globe, CheckCircle2, MessageSquare, ExternalLink, Phone, X, Plus, Sprout,
  Stethoscope, Pill, Thermometer, FlaskConical, Bandage, Syringe, ClipboardList, ChevronDown, ChevronLeft, Navigation
} from 'lucide-react';
import Logo from '../components/Logo';
import apiClient from '../utils/axiosConfig';

import { useCart } from '../context/CartContext';

const HomeHub = () => {
    const navigate = useNavigate();
    const { cart } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(localStorage.getItem('userLocation') || "Dehli, NCR");
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchCity, setSearchCity] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const bannerDeals = [
        {
            title: "Premium Cardiology Care",
            med: "Atorvastatin 20mg",
            desc: "Certified life-saving cardiac agents for hospitals.",
            color: "#b62d2d",
            tag: "NEW ARRIVAL"
        },
        {
            title: "Advanced Antibiotic Range",
            med: "Amoxicillin Premium",
            desc: "High-efficacy bacterial infection control.",
            color: "#0f172a",
            tag: "BEST SELLER"
        },
        {
            title: "Emergency First Aid",
            med: "Surgical Kit Pro",
            desc: "Complete surgical essentials for clinical use.",
            color: "#1e293b",
            tag: "FLAT 20% OFF"
        }
    ];

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const res = await apiClient.get('/products/');
                if (res.data) {
                    setProducts(res.data);
                    setFilteredProducts(res.data.slice(0, 25)); // Display more items on home
                }
            } catch (err) {
                console.error("Home Prod Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopProducts();
        
        const sliderTimer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % bannerDeals.length);
        }, 5000);

        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        window.scrollTo(0, 0);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(sliderTimer);
        };
    }, []);

    // Search Logic
    useEffect(() => {
        if (!searchQuery) {
            setFilteredProducts(products.slice(0, 15));
            return;
        }
        const lower = searchQuery.toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            p.manufacturer.toLowerCase().includes(lower) || 
            p.category.toLowerCase().includes(lower)
        );
        setFilteredProducts(filtered.slice(0, 15));
    }, [searchQuery, products]);

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery) {
            navigate('/products', { state: { initialSearch: searchQuery } });
        }
    };

    // Intelligent Indian Location Search (OSM Nominatim)
    useEffect(() => {
        if (searchCity.length < 3) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setFetchingSuggestions(true);
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchCity}&countrycodes=in&addressdetails=1&limit=8`)
                .then(res => res.json())
                .then(data => {
                    const filtered = data.map(item => ({
                        display: item.display_name,
                        city: item.address.city || item.address.town || item.address.village || item.address.suburb || item.address.state_district || item.name,
                        state: item.address.state
                    }));
                    setSuggestions(filtered);
                })
                .catch(err => console.error("Loc search error:", err))
                .finally(() => setFetchingSuggestions(false));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchCity]);

    const handleLocationSelect = (item) => {
        const formatted = `${item.city || item.display.split(',')[0]}${item.state ? ', ' + item.state : ''}`;
        setLocation(formatted);
        localStorage.setItem('userLocation', formatted);
        setShowLocationModal(false);
        setSearchCity("");
        setSuggestions([]);
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return;
        setFetchingSuggestions(true);
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                .then(res => res.json())
                .then(data => {
                    const loc = data.address.city || data.address.town || data.address.village || data.address.suburb || data.display_name.split(',')[0];
                    const st = data.address.state;
                    const final = `${loc}${st ? ', ' + st : ''}`;
                    setLocation(final);
                    localStorage.setItem('userLocation', final);
                    setShowLocationModal(false);
                })
                .finally(() => setFetchingSuggestions(false));
        });
    };

    const handleAddToCart = (e, prod) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login?role=BUYER', { state: { redirectTo: '/home', product: prod } });
        } else {
            navigate('/app/products', { state: { activeProduct: prod } });
        }
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
                
                .main-header { background: white; border-bottom: 2px solid #f1f5f9; position: sticky; top: 0; z-index: 2000; padding: 0 8%; height: 90px; display: flex; align-items: center; }
                .red-nav { background: #b62d2d; color: white; padding: 12px 8%; display: flex; gap: 40px; font-weight: 800; font-size: 13px; }
                .red-nav span { cursor: pointer; display: flex; align-items: center; gap: 8px; opacity: 0.9; transition: 0.3s; }
                .red-nav span:hover { opacity: 1; transform: scale(1.02); }
                .badge-active { background: #fee2e2; color: #b62d2d; padding: 2px 10px; border-radius: 30px; font-size: 9px; font-weight: 900; }
                .search-bar-hub { flex: 1; max-width: 500px; display: flex; align-items: center; background: #f8fafc; padding: 12px 25px; border-radius: 50px; gap: 15px; border: 1px solid #e2e8f0; transition: 0.3s; }
                .search-bar-hub:focus-within { border-color: #b62d2d; background: white; box-shadow: 0 10px 30px rgba(182, 45, 45, 0.08); }
                .search-bar-hub input { border: none; background: transparent; width: 100%; outline: none; font-weight: 700; font-size: 15px; color: #0f172a; }
                .location-trigger { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 18px; border-radius: 50px; background: #f8fafc; border: 1px solid #e2e8f0; transition: 0.3s; margin: 0 30px; font-weight: 900; color: #0f172a; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 5000; }
                .suggestion-item { padding: 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; align-items: flex-start; gap: 15px; }
                .suggestion-item:hover { background: #f8fafc; }
                .suggestion-item:last-child { border: none; }
                .prod-card-clinical { background: white; border-radius: 30px; border: 1px solid #f1f5f9; padding: 25px; display: flex; flexDirection: column; gap: 15px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative; cursor: pointer; }
                .prod-card-clinical:hover { transform: translateY(-12px); box-shadow: 0 40px 80px rgba(15, 23, 42, 0.08); }
                .deal-slider { height: 480px; margin: 40px 8%; border-radius: 40px; position: relative; overflow: hidden; }
                .slide-item { position: absolute; inset: 0; opacity: 0; transition: 1s ease; display: flex; align-items: center; padding: 0 80px; }
                .slide-item.active { opacity: 1; z-index: 10; }
                @keyframes pulse-ws { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                .whatsapp-float { animation: pulse-ws 2s infinite ease-in-out; }
            `}</style>

            <div className="main-header">
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                    <div onClick={() => navigate('/')} style={{ cursor: 'pointer', paddingRight: '20px' }}>
                        <Logo size={42} />
                    </div>

                    <div className="location-trigger" onClick={() => setShowLocationModal(true)}>
                        <MapPin size={18} color="#b62d2d" />
                        <span style={{ fontSize: '14px' }}>{location.split(',')[0]}</span>
                        <ChevronDown size={14} color="#64748b" />
                    </div>

                    <div className="search-bar-hub">
                        <Search size={20} color="#64748b" />
                        <input 
                            placeholder="Search Medicines..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px', paddingLeft: '40px' }}>
                        <div style={{ display: 'flex', gap: '20px', color: '#64748b' }}>
                            <Bell size={24} style={{ cursor: 'pointer' }} />
                            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/app/cart')}>
                                <ShoppingCart size={24} />
                                {cart.length > 0 && (
                                    <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#b62d2d', color: 'white', minWidth: '18px', height: '18px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', border: '2px solid white' }}>
                                        {cart.length}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div onClick={() => user ? navigate('/app/dashboard') : navigate('/login?role=BUYER')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: '900', fontSize: '14px', background: '#b62d2d', padding: '12px 25px', borderRadius: '50px' }}>
                            {user ? (user.organization_name || user.company_name || 'MY DASHBOARD') : 'LOGIN / SIGNUP'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="red-nav">
                <span onClick={() => navigate('/products', { state: { category: 'All' }})}>CATAOLG <div className="badge-active">150+</div></span>
                <span onClick={() => navigate('/products', { state: { category: 'Diabetes Care' }})}>DIABETES</span>
                <span onClick={() => navigate('/products', { state: { category: 'Antibiotics' }})}>ANTIBIOTICS</span>
                <span onClick={() => navigate('/products', { state: { category: 'Pain Relief' }})}>PAIN RELIEF</span>
                <span onClick={() => navigate('/products', { state: { category: 'Surgical Items' }})}>SURGICALS</span>
                <span onClick={() => navigate('/products', { state: { category: 'Supplements' }})}>SUPPLEMENTS</span>
                <span onClick={() => navigate('/products', { state: { category: 'Digestion' }})}>DIGESTION</span>
            </div>

            {!searchQuery && (
                <header className="deal-slider">
                    {bannerDeals.map((deal, i) => (
                        <div key={i} className={`slide-item ${i === currentSlide ? 'active' : ''}`} style={{ background: `linear-gradient(135deg, ${deal.color} 0%, #000 100%)` }}>
                            <div style={{ color: 'white', maxWidth: '600px', zIndex: 10 }}>
                                <div style={{ display: 'inline-block', background: '#e21b1b', padding: '6px 20px', borderRadius: '50px', fontWeight: '900', fontSize: '10px', marginBottom: '25px', letterSpacing: '2px' }}>{deal.tag}</div>
                                <h4 style={{ fontSize: '20px', color: '#f59e0b', fontWeight: '800', marginBottom: '10px' }}>{deal.title}</h4>
                                <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px' }}>{deal.med}</h1>
                                <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '40px', fontWeight: '600' }}>{deal.desc}</p>
                                <button className="btn-primary-hub" style={{ width: 'auto', padding: '18px 50px', background: 'white', color: '#0f172a', fontWeight: '900', border: 'none', borderRadius: '15px', cursor: 'pointer' }} onClick={() => navigate('/products')}>ORDER NOW</button>
                            </div>
                        </div>
                    ))}
                </header>
            )}

            <section style={{ padding: searchQuery ? '40px 8% 100px' : '0 8% 100px', marginTop: searchQuery ? '20px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' }}>
                            {searchQuery ? `Search Results for "${searchQuery}"` : 'Top Medical Supplies'}
                        </h2>
                        <p style={{ color: '#64748b', fontWeight: '600', fontSize: '17px' }}>
                            {searchQuery ? `Showing ${filteredProducts.length} matching clinical medicines.` : `Genuine stock for your clinic in ${location.split(',')[0]}.`}
                        </p>
                    </div>
                    {!searchQuery && (
                        <div onClick={() => navigate('/products')} style={{ color: '#b62d2d', fontWeight: '900', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', background: '#fee2e2', borderRadius: '50px' }}>
                            SEE ALL PRODUCTS <ArrowRight size={20} />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', fontWeight: '900', color: '#b62d2d' }}>LOADING...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '30px' }}>
                        {filteredProducts.map(prod => (
                            <div key={prod.product_id} className="prod-card-clinical" onClick={() => navigate(`/products/${prod.product_id}`)}>
                                <div style={{ background: '#f8fafc', borderRadius: '20px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Pill size={80} color="#cbd5e1" strokeWidth={1} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#b62d2d', textTransform: 'uppercase', marginBottom: '8px' }}>{prod.category}</div>
                                    <h5 style={{ fontSize: '19px', fontWeight: '900', color: '#0f172a', margin: '0 0 10px', lineHeight: '1.2' }}>{prod.name}</h5>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>
                                        <ShieldCheck size={14} color="#10b981" /> {prod.manufacturer}
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>₹{(prod.selling_price || prod.wholesale_price || (prod.retail_price * 0.9)).toLocaleString()}</div>
                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textDecoration: 'line-through' }}>MRP: ₹{Number(prod.retail_price || 0).toLocaleString()}</div>
                                    </div>
                                    <div onClick={(e) => handleAddToCart(e, prod)} style={{ background: '#b62d2d', color: 'white', padding: '12px', borderRadius: '15px', boxShadow: '0 8px 15px rgba(182,45,45,0.2)' }}>
                                        <ShoppingCart size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && searchQuery && (
                            <div style={{ gridColumn: 'span 5', textAlign: 'center', padding: '80px', background: '#f8fafc', borderRadius: '40px' }}>
                                <Info size={50} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>No Matches Found</h3>
                                <p style={{ color: '#64748b', fontWeight: '600' }}>Try searching with a different medicine name or category.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {showLocationModal && (
                <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '650px', borderRadius: '40px', padding: '50px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                        <X size={24} style={{ position: 'absolute', top: '30px', right: '30px', cursor: 'pointer', color: '#64748b' }} onClick={() => setShowLocationModal(false)} />
                        <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>Select Any Location</h3>
                        <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '35px' }}>Type to find any city, town, or small village in India.</p>
                        <button onClick={detectLocation} style={{ width: '100%', padding: '18px', background: '#f1f5f9', border: '2px solid #e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontWeight: '900', color: '#0f172a', cursor: 'pointer', marginBottom: '25px', transition: '0.3s' }}>
                            <Navigation size={20} color="#b62d2d" /> USE MY CURRENT LOCATION
                        </button>
                        <div style={{ position: 'relative' }}>
                            <div style={{ background: '#ffffff', padding: '20px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', border: '2px solid #b62d2d', boxShadow: '0 10px 40px rgba(182, 45, 45, 0.1)' }}>
                                <Search size={24} color="#b62d2d" />
                                <input autoFocus style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontWeight: '900', fontSize: '18px', color: '#0f172a' }} placeholder="Type village or town name (e.g. Nellore)..." value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
                            </div>
                            {searchCity.length >= 3 && (
                                <div style={{ background: 'white', borderRadius: '30px', marginTop: '15px', border: '1px solid #f1f5f9', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '400px', overflowY: 'auto' }}>
                                    {fetchingSuggestions ? (
                                        <div style={{ padding: '30px', textAlign: 'center', color: '#b62d2d', fontWeight: '900', letterSpacing: '1px' }}>SEARCHING INDIAN REGISTRY...</div>
                                    ) : suggestions.length > 0 ? (
                                        suggestions.map((item, i) => (
                                            <div key={i} className="suggestion-item" onClick={() => handleLocationSelect(item)}>
                                                <MapPin size={22} color="#94a3b8" style={{ marginTop: '3px' }} />
                                                <div>
                                                    <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '16px' }}>{item.city || item.display.split(',')[0]}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', lineHeight: '1.4', marginTop: '3px' }}>{item.display}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No places found. Continue typing...</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <a href="https://wa.me/918885828678" target="_blank" rel="noreferrer" className="whatsapp-float" style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#25D366', color: 'white', padding: '20px', borderRadius: '50px', boxShadow: '0 20px 40px rgba(37, 211, 102, 0.4)', zIndex: 3000 }}>
                <MessageSquare size={30} />
            </a>

            <footer style={{ background: '#0f172a', padding: '100px 8% 60px', color: 'white' }}>
                <Logo size={45} inverse />
                <p style={{ marginTop: '25px', color: '#94a3b8', fontSize: '15px', fontWeight: '800' }}>© 2026 CARECART MEDICINES PVT LTD.</p>
            </footer>
        </div>
    );
};

export default HomeHub;
