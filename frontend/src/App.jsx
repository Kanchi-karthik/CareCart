import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import PlaceBulkOrder from './pages/PlaceBulkOrder';
import LandingPage from './pages/LandingPage';
import HomeHub from './pages/HomeHub';
import AdminUsers from './pages/AdminUsers';
import AdminSellers from './pages/AdminSellers';
import AdminBuyers from './pages/AdminBuyers';
import AdminOrders from './pages/AdminOrders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HowItWorks from './pages/HowItWorks';
import Franchise from './pages/Franchise';
import Analysis from './pages/Analysis';
import Logistics from './pages/Logistics';
import Issues from './pages/Issues';
import Orders from './pages/Orders';
import SellerOrders from './pages/SellerOrders';
import BuyerOrders from './pages/BuyerOrders';
import B2BOrders from './pages/B2BOrders';
import AddProduct from './pages/AddProduct';
import AdminSettings from './pages/AdminSettings';
import ProfileView from './pages/ProfileView';
import SellerOnboarding from './pages/SellerOnboarding';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import WishlistPage from './pages/WishlistPage';
import SellerBankSettings from './pages/SellerBankSettings';
import Wallet from './pages/Wallet';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomeHub />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products" element={<Products />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="place-bulk-order" element={<PlaceBulkOrder />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="issues" element={<Issues />} />
            <Route path="orders" element={<Orders />} />
            <Route path="seller-orders" element={<SellerOrders />} />
            <Route path="buyer-orders" element={<BuyerOrders />} />
            <Route path="b2b-orders" element={<B2BOrders />} />
            <Route path="admin" element={<Dashboard />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/sellers" element={<AdminSellers />} />
            <Route path="admin/buyers" element={<AdminBuyers />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/products" element={<Products />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            <Route path="admin/profile/:type/:id" element={<ProfileView />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="onboarding" element={<SellerOnboarding />} />
            <Route path="seller/finances" element={<SellerBankSettings />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="orders/tracking/:type/:id" element={<OrderTracking />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
