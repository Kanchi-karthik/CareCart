import React, { useState, useEffect } from 'react';
import { UserCircle, Calendar, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';

export default function ConsultantDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEngagements: 0,
    activeEngagements: 0,
    completedEngagements: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get consultant profile
      const consultantsRes = await apiClient.get('/consultants');
      const consultant = consultantsRes.data.find(c => c.user_id === user.user_id);
      if (!consultant) {
        if (user.role?.toUpperCase() === 'CONSULTANT') {
          alert('Consultant profile not found for user: ' + user.username);
        }
        setLoading(false);
        return;
      }
      // Fetch engagements
      const engagementsRes = await apiClient.get('/engagements');
      const myEngagements = (engagementsRes.data || []).filter(e => String(e.consultant_id) === String(consultant.consultant_id));

      setStats({
        totalEngagements: myEngagements.length,
        activeEngagements: myEngagements.filter(e => e.status === 'ONGOING' || e.status === 'SCHEDULED' || e.status === 'ACTIVE').length,
        completedEngagements: myEngagements.filter(e => e.status === 'COMPLETED').length,
        totalEarnings: 0 // Would calculate from completed engagements/invoices
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Consultant Dashboard</h1>
          <p className="dashboard-subtitle">Manage your medical consultancy engagements</p>
        </div>
        <div className="header-time">
          <Calendar size={20} />
          <span>Professional Portal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mt-6">
        <div className="stat-card">
          <div className="stat-card-header">
            <Calendar size={20} className="stat-icon" />
            <span className="stat-title">Total Engagements</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.totalEngagements}</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-header">
            <UserCircle size={20} className="stat-icon" />
            <span className="stat-title">Active</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.activeEngagements}</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-card-header">
            <FileText size={20} className="stat-icon" />
            <span className="stat-title">Completed</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">{stats.completedEngagements}</p>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-header">
            <TrendingUp size={20} className="stat-icon" />
            <span className="stat-title">Earnings</span>
          </div>
          <div className="stat-value-wrapper">
            <p className="stat-number">${stats.totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section mt-6">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <button onClick={() => navigate('/app/engagements')} className="quick-action-btn">
            <Calendar size={24} />
            My Engagements
          </button>
          <button onClick={() => navigate('/app/consultant-services')} className="quick-action-btn">
            <DollarSign size={24} />
            Manage Fees
          </button>
          <button onClick={() => navigate('/app/profile')} className="quick-action-btn">
            <UserCircle size={24} />
            Update Profile
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="dashboard-section mt-6">
        <div className="section-header">
          <h2>Professional Services</h2>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-2 text-red-700">Medical Expert Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">1</div>
              <p className="text-sm text-gray-600">Maintain an accurate professional profile with certifications and specialty documentation.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">2</div>
              <p className="text-sm text-gray-600">Review and accept/reject consultancy requests promptly to ensure client satisfaction.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">3</div>
              <p className="text-sm text-gray-600">Upload session notes and recommendations securely for institutional clients after each visit.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">4</div>
              <p className="text-sm text-gray-600">Track your consultation hours and verify payment status for completed engagements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
