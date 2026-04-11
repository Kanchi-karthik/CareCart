import React from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import BuyerDashboard from './dashboards/BuyerDashboard';
import SellerDashboard from './dashboards/SellerDashboard';

const Dashboard = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = user.role || 'BUYER';

  return (
    <div className="page-transition">
      {role === 'ADMIN' && <AdminDashboard />}
      {role === 'BUYER' && <BuyerDashboard />}
      {role === 'SELLER' && <SellerDashboard />}
    </div>
  );
};

export default Dashboard;
