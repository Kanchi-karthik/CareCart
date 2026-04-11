import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
  Package, Plus, Upload, Search, Table, Grid, ShoppingCart, Trash2, Edit3,
  ShieldCheck, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle,
  FileText, Smartphone, Printer, X, Info, Home, Users, Truck, ClipboardList,
  BarChart3, User, ShoppingBag, LogOut, Bell, Menu, Settings, Activity, Briefcase, DollarSign, Mail, Filter, Globe, Layout as LayoutIcon, Heart, ArrowLeft
} from 'lucide-react';
import Logo from './Logo';

const Loader = () => {
  // Auto-hide loader after 5 seconds as a safety fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force remove loader from DOM if it's stuck
      const loaderElement = document.querySelector('.loader-wrapper');
      if (loaderElement) {
        loaderElement.style.display = 'none';
      }
    }, 5000); // 5 second safety timeout
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="loader-wrapper">
      <Logo size={100} />
      <p style={{ marginTop: '30px', color: '#b62d2d', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '14px' }}>
        OPENING SHOP...
      </p>
    </div>
  );
};

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('user');
      if (!savedUser) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(JSON.parse(savedUser));
      // Always hide loader after delay, even if there's an error
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error in Layout:', err);
      setError(err.message);
      // Still hide loader on error so user can see the screen
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [navigate]);

  const getNavItems = () => {
    const role = user?.role || 'BUYER';
    const categories = {
      ADMIN: [
        {
          group: 'Management',
          items: [
            { path: '/app/admin', label: 'Admin Hub', icon: LayoutIcon },
            { path: '/app/admin/users', label: 'User List', icon: Users },
            { path: '/app/admin/sellers', label: 'Sellers', icon: Truck },
            { path: '/app/admin/buyers', label: 'Buyers', icon: Users },
            { path: '/app/admin/settings', label: 'System Settings', icon: Settings },
          ]
        },
        {
          group: 'Records',
          items: [
            { path: '/app/admin/products', label: 'Stock List', icon: Package },
          ]
        }
      ],
      SELLER: [
        {
          group: 'Business Hub',
          items: [
            { path: '/app/dashboard', label: 'My Control Center', icon: LayoutIcon },
            { path: '/app/products', label: 'My Stock List', icon: Package },
            { path: '/app/seller-orders', label: 'Incoming Orders', icon: ClipboardList },
            { path: '/app/analysis', label: 'Sales Reports', icon: BarChart3 },
            { path: '/app/wishlist', label: 'My Favorites', icon: Heart },
          ]
        },
        {
          group: 'Account',
          items: [
            { path: '/app/profile', label: 'My Details', icon: User },
          ]
        }
      ],
      BUYER: [
        {
          group: 'Shopping Bag',
          items: [
            { path: '/app/dashboard', label: 'My Hub', icon: LayoutIcon },
            { path: '/app/products', label: 'Medicines List', icon: Package },
            { path: '/app/buyer-orders', label: 'Order Status', icon: ShoppingBag },
            { path: '/app/cart', label: 'Medicine Bag', icon: ShoppingCart },
            { path: '/app/wishlist', label: 'My Favorites', icon: Heart },
          ]
        },
        {
          group: 'Account',
          items: [
            { path: '/app/profile', label: 'My Details', icon: User },
          ]
        }
      ]
    };
    return categories[role] || categories['BUYER'];
  };

  const navItems = getNavItems();

  const confirmExit = () => {
    sessionStorage.clear();
    window.location.href = '/login?logout=true';
  };

  if (loading) return <Loader />;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#f8fafc', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <aside style={{
          width: '280px', background: '#0f172a', color: 'white', position: 'fixed', left: 0, top: 0, bottom: 0,
          zIndex: 50, display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}><Logo size={40} inverse /></div>
          <button onClick={() => navigate('/')} title="Back to Home" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
             <Globe size={18} />
          </button>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((group) => (
             <div key={group.group} style={{ marginBottom: '20px' }}>
                 <p style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '15px' }}>
                    {group.group}
                 </p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {group.items.map((item) => (
                        <Link key={item.path} to={item.path} style={{
                            display: 'flex', alignItems: 'center', gap: '15px', color: location.pathname === item.path ? 'white' : '#94a3b8',
                            background: location.pathname === item.path ? '#1e293b' : 'transparent',
                            textDecoration: 'none', padding: '12px 15px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
                            transition: 'all 0.2s'
                        }}>
                            <item.icon size={20} color={location.pathname === item.path ? '#b62d2d' : 'currentColor'} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                 </div>
             </div>
          ))}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setShowExitModal(true)} style={{
                width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f87171',
                padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                fontWeight: '800', cursor: 'pointer'
            }}>
                <LogOut size={18} /> LOG OUT
            </button>
        </div>
      </aside>

      <main style={{
          flex: 1, marginLeft: sidebarOpen ? '280px' : '0', transition: 'margin 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '40px 6%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
             <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '10px', borderRadius: '10px' }}>
                {sidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
             </button>
             <button 
                onClick={() => {
                   if (location.pathname.startsWith('/app/products/')) {
                       navigate('/app/products');
                   } else if (location.pathname === '/app/products') {
                       navigate('/home');
                   } else {
                       navigate(-1);
                   }
                }} 
                style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 15px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}
             >
                <ArrowLeft size={16} /> BACK
             </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '8px 16px', borderRadius: '20px', border: '1px solid #10b981' }}>
              <ShieldCheck size={18} color="#059669" />
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#047857' }}>SECURE CONNECTION</span>
            </div>
          </div>
        </div>
        <div className="page-wrapper"><Outlet /></div>
      </main>

      {showExitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '50px', borderRadius: '40px', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
             <ShieldCheck size={40} color="#b62d2d" style={{ marginBottom: '30px', display: 'inline' }} />
             <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>Ready to Leave?</h2>
             <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '40px' }}>Your current session will be safely closed.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={confirmExit} style={{ background: '#b62d2d', color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>LOG OUT NOW</button>
                <button onClick={() => setShowExitModal(false)} style={{ background: 'none', border: 'none', fontWeight: '800', color: '#94a3b8', cursor: 'pointer' }}>STAY HERE</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
