import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertCircle, Info, Percent, Truck } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

export default function AdminSettings() {
    const DEFAULT_SETTINGS = { HANDLING_FEE: '50.00', SERVICE_GST: '0.2' };
    const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/settings');
            if (response.data) {
                // Merge with defaults so inputs are never undefined
                setSettings({ ...DEFAULT_SETTINGS, ...response.data });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Failed to load system configurations.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            const response = await apiClient.post('/admin/settings', settings);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', text: 'System logistics parameters synchronized successfully.' });
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Synchronization failed.' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Network fault during parameter synchronization.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <RefreshCw className="spin" size={48} color="var(--velvet-brick)" />
            <p style={{ marginTop: '20px', fontWeight: '800', color: 'var(--text-muted)' }}>SYNCHRONIZING GLOBAL PARAMETERS...</p>
        </div>
    );

    return (
        <div className="page-transition">
            <div style={{ marginBottom: '50px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2.5px', marginBottom: '10px' }}>Control Center</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Manage global <span style={{ color: 'var(--velvet-brick)' }}>logistics fees</span> and tax compliance rates.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                <div className="card" style={{ padding: '50px', borderRadius: '40px', background: 'white' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gap: '40px' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <Truck size={20} color="var(--velvet-brick)" />
                                    <span style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>GLOBAL HANDLING FEE (INR)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settings.HANDLING_FEE ?? ''}
                                    onChange={(e) => setSettings({ ...settings, HANDLING_FEE: e.target.value })}
                                    style={{ padding: '20px', fontSize: '24px', fontWeight: '900', borderRadius: '20px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontWeight: '600' }}>Flat rate applied to every institutional procurement bundle for logistics and sanitation.</p>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <Percent size={20} color="var(--velvet-brick)" />
                                    <span style={{ fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>SERVICE GST RATE (%)</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={settings.SERVICE_GST ?? ''}
                                    onChange={(e) => setSettings({ ...settings, SERVICE_GST: e.target.value })}
                                    style={{ padding: '20px', fontSize: '24px', fontWeight: '900', borderRadius: '20px', border: '2px solid #f1f5f9', background: '#f8fafc', width: '100%' }}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontWeight: '600' }}>Percentage applied on the medicine base value for platform service management.</p>
                            </div>

                            {message.text && (
                                <div style={{ 
                                    padding: '20px 30px', 
                                    borderRadius: '20px', 
                                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', 
                                    color: message.type === 'success' ? '#059669' : '#dc2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    fontWeight: '800',
                                    fontSize: '14px',
                                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
                                }}>
                                    {message.type === 'success' ? <Settings size={20} /> : <AlertCircle size={20} />}
                                    {message.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="btn btn-brick hover-up" 
                                style={{ padding: '20px', fontSize: '16px', fontWeight: '900', borderRadius: '20px', width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {saving ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                                {saving ? 'SYNCHRONIZING...' : 'AUTHORIZE & UPDATE PARAMETERS'}
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="card" style={{ padding: '40px', borderRadius: '35px', background: 'var(--velvet-dark)', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Info size={20} color="var(--vibrant-gold)" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Clinical Impact</h3>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                            Updates to these parameters take effect immediately for all <span style={{ color: 'white' }}>new procurement orders</span>. Existing invoices will remain archived with their original valuations to maintain audit integrity.
                        </p>
                    </div>

                    <div className="card" style={{ padding: '40px', borderRadius: '35px', background: 'white', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Audit Trail Integration</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { label: 'Oracle Financial Node', status: 'SYNCED', color: '#10b981' },
                                { label: 'MongoDB Audit Hive', status: 'ACTIVE', color: '#10b981' },
                                { label: 'MySQL Ledger Hub', status: 'CONNECTED', color: '#10b981' }
                            ].map((node, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8fafc', borderRadius: '15px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b' }}>{node.label}</span>
                                    <span style={{ fontSize: '10px', fontWeight: '900', color: node.color }}>{node.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
