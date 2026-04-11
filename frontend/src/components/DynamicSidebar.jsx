import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Building2,
    Truck,
    LogOut,
    CheckCircle2,
    RefreshCw,
    BarChart3,
    FileText,
    Users
} from 'lucide-react';

const DynamicSidebar = () => {
    const rawUser = sessionStorage.getItem('user');
    const user = rawUser ? JSON.parse(rawUser) : { role: 'BUYER', username: 'Guest' };

    let menuItems = [];

    if (user.role === 'SELLER') {
        menuItems = [
            { name: 'My Store', category: true },
            { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
            { name: 'My Medicines', path: '/app/products', icon: Package },
            { name: 'Orders', category: true },
            { name: 'Incoming Orders', path: '/app/seller-orders', icon: ClipboardList },
            { name: 'Delivery Tracking', path: '/app/logistics', icon: Truck },
            { name: 'Store Management', category: true },
            { name: 'Stock Analysis', path: '/app/analysis', icon: BarChart3 },
            { name: 'Returns & Refunds', path: '/app/issues', icon: RefreshCw },
        ];
    } else if (user.role === 'BUYER') {
        menuItems = [
            { name: 'Shopping', category: true },
            { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
            { name: 'Medicine Shop', path: '/app/products', icon: Package },
            { name: 'Place Order', path: '/app/place-bulk-order', icon: CheckCircle2 },
            { name: 'Account', category: true },
            { name: 'Order Status', path: '/app/buyer-orders', icon: ShoppingBag },
            { name: 'Track Shipments', path: '/app/logistics', icon: Truck },
            { name: 'Issues & Returns', path: '/app/issues', icon: RefreshCw },
        ];
    } else {
        // ADMIN
        menuItems = [
            { name: 'Administration', category: true },
            { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
            { name: 'Member Network', category: true },
            { name: 'Manage Users', path: '/app/admin/users', icon: Users },
            { name: 'System Pharmacy', path: '/app/admin/products', icon: Package },
            { name: 'Shipping Hub', path: '/app/logistics', icon: Truck },
            { name: 'Support Tickets', path: '/app/issues', icon: RefreshCw },
        ];
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Building2 size={32} color="#3b82f6" />
                <span>CareCart</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    item.category ? (
                        <div key={index} style={{ padding: '24px 16px 8px', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {item.name}
                        </div>
                    ) : (
                        <div key={index} className="sidebar-nav-item">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={20} />
                                <span style={{ flex: 1 }}>{item.name}</span>
                            </NavLink>
                        </div>
                    )
                ))}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
                <button
                    onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }}
                    className="sidebar-link"
                    style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                    <LogOut size={20} />
                    <span>Logout Securely</span>
                </button>
            </div>
        </aside>
    );
};

export default DynamicSidebar;
