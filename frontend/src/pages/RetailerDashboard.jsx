import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

export default function RetailerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get retailer info
      const retailersRes = await apiClient.get('/retailers');
      const retailer = retailersRes.data.find(r => r.user_id === user.user_id);

      if (!retailer) {
        if (user.role?.toUpperCase() === 'RETAILER') {
          alert('Retailer profile not found for user: ' + user.username);
        }
        setLoading(false);
        return;
      }

      // Fetch products
      const productsRes = await apiClient.get('/products');
      const allProducts = productsRes.data || [];
      const myProducts = allProducts.filter(p => p.retailer_id === retailer.retailer_id);
      setProducts(myProducts);

      // Fetch stock alerts
      const alertsRes = await apiClient.get('/stock-alerts');
      const alerts = alertsRes.data || [];
      const myAlerts = alerts.filter(alert =>
        myProducts.some(p => p.product_id === alert.product_id) && alert.is_active
      );
      setStockAlerts(myAlerts);

      // Calculate stats
      const totalStock = myProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
      const lowStockItems = myProducts.filter(p => p.quantity <= p.min_quantity).length;

      setStats({
        totalProducts: myProducts.length,
        totalStock: totalStock,
        lowStockItems: lowStockItems,
        totalRevenue: 0 // Would calculate from sales
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Retailer Dashboard</h1>
          <p className="dashboard-subtitle">Manage your products and inventory</p>
        </div>
        <div className="header-time">
          <Package size={20} />
          <span>Inventory Control</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mt-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <Package size={20} className="stat-icon" />
            <span className="stat-title">My Products</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <ShoppingBag size={20} className="stat-icon" />
            <span className="stat-title">Total Stock</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.totalStock}</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-card-header">
            <AlertTriangle size={20} className="stat-icon" />
            <span className="stat-title">Low Stock Items</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.lowStockItems}</p>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-header">
            <TrendingUp size={20} className="stat-icon" />
            <span className="stat-title">Revenue</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section mt-6">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <button onClick={() => navigate('/app/products')} className="quick-action-btn">
            <Plus size={24} />
            <span>Add Product</span>
          </button>
          <button onClick={() => navigate('/app/goods-receipts')} className="quick-action-btn">
            <ShoppingBag size={24} />
            <span>Goods Receipt</span>
          </button>
          <button onClick={() => navigate('/app/stock-alerts')} className="quick-action-btn">
            <AlertTriangle size={24} />
            <span>View Alerts</span>
          </button>
        </div>
      </div>

      {/* My Products Table */}
      <div className="dashboard-section p-0 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Products</h2>
            <p className="text-sm text-gray-500 mt-1">Recently updated inventory</p>
          </div>
          <button onClick={() => navigate('/app/products')} className="btn btn-secondary py-1 text-sm">Manage All</button>
        </div>

        <div className="table-container">
          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-3 opacity-20" />
              <p>No products added yet</p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Valuation</th>
                  <th>Stock Levels</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(product => (
                  <tr key={product.product_id}>
                    <td>
                      <div>
                        <div className="font-bold text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">{product.description}</div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-red-700">${product.price}</span>
                    </td>
                    <td>
                      <span className={`font-bold ${product.quantity > (product.min_quantity || 10) ? 'text-green-600' : 'text-red-600'}`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td>
                      <span className={`status ${product.quantity > (product.min_quantity || 10) ? 'completed' : product.quantity > 0 ? 'pending' : 'cancelled'}`}>
                        {product.quantity > (product.min_quantity || 10) ? 'In Stock' : product.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="dashboard-section mt-6" style={{ borderColor: '#dc3545', background: '#fff5f5' }}>
          <div className="flex items-start gap-4 p-2">
            <AlertTriangle size={32} className="text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">Critical Stock Alerts ({stockAlerts.length})</h3>
              <div className="space-y-3">
                {stockAlerts.slice(0, 3).map(alert => (
                  <div key={alert.alert_id} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{alert.alert_type}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <button onClick={() => navigate('/app/goods-receipt')} className="text-red-600 font-bold text-sm hover:underline">Restock Now</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
