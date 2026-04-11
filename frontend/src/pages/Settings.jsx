import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Globe, Shield, Moon, Eye, Smartphone, Zap } from 'lucide-react';

export default function Settings() {
    // Persistent state hub
    const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('setting_notifications') ?? 'true'));
    const [globalSync, setGlobalSync] = useState(() => JSON.parse(localStorage.getItem('setting_global_sync') ?? 'true'));
    const [smsAlerts, setSmsAlerts] = useState(() => JSON.parse(localStorage.getItem('setting_sms_alerts') ?? 'false'));
    const [twoFactor, setTwoFactor] = useState(() => JSON.parse(localStorage.getItem('setting_2fa') ?? 'true'));
    const [privacyCloak, setPrivacyCloak] = useState(() => JSON.parse(localStorage.getItem('setting_privacy') ?? 'true'));
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('setting_dark_mode') ?? 'false'));

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        if (!notifications && msg !== "Notifications Enabled") return; 
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // Sync settings to localStorage on change
    useEffect(() => {
        localStorage.setItem('setting_notifications', JSON.stringify(notifications));
        localStorage.setItem('setting_global_sync', JSON.stringify(globalSync));
        localStorage.setItem('setting_sms_alerts', JSON.stringify(smsAlerts));
        localStorage.setItem('setting_2fa', JSON.stringify(twoFactor));
        localStorage.setItem('setting_privacy', JSON.stringify(privacyCloak));
        localStorage.setItem('setting_dark_mode', JSON.stringify(darkMode));

        // Apply dark mode to document body if needed
        if (darkMode) {
            document.body.classList.add('dark-matrix');
        } else {
            document.body.classList.remove('dark-matrix');
        }
    }, [notifications, globalSync, smsAlerts, twoFactor, privacyCloak, darkMode]);

    const handleToggle = (setter, val, label) => {
        setter(!val);
        showToast(`${label} ${!val ? 'Enabled' : 'Disabled'}`);
    };

    const SettingToggle = ({ icon: Icon, title, desc, active, onToggle }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', background: '#f8fafc', borderRadius: '20px', border: '2px solid #f1f5f9', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--velvet-brick)' : '#94a3b8', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                    <Icon size={24} />
                </div>
                <div>
                    <div style={{ fontWeight: '900', fontSize: '16px', color: 'var(--velvet-dark)' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{desc}</div>
                </div>
            </div>
            <button 
                onClick={onToggle}
                style={{ 
                    width: '60px', height: '32px', borderRadius: '20px', 
                    background: active ? 'var(--velvet-brick)' : '#e2e8f0',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: '0.4s'
                }}
            >
                <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '4px', left: active ? '32px' : '4px',
                    transition: '0.4s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }} />
            </button>
        </div>
    );

    const handlePurge = () => {
        if (window.confirm("WARNING: This will clear all your settings and log you out. Continue?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="page-transition">
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '40px', right: '40px', 
                    background: 'var(--velvet-dark)', color: 'var(--vibrant-gold)', 
                    padding: '20px 40px', borderRadius: '20px', fontWeight: '900',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)', zIndex: 9999,
                    border: '2px solid var(--vibrant-gold)', animation: 'pageIn 0.3s ease'
                }}>
                    ALERT: {toast}
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-px' }}>App Settings</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Change your notification, security, and display settings.</p>
                </div>
                <div style={{ padding: '15px 30px', background: 'var(--velvet-dark)', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', border: '2px solid var(--vibrant-gold)' }}>
                    <Zap size={20} color="var(--vibrant-gold)" />
                    <span style={{ fontWeight: '900', fontSize: '13px' }}>SYSTEM ACTIVE</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div className="card" style={{ padding: '40px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={24} color="var(--velvet-brick)" /> Notifications
                    </h3>
                    <SettingToggle 
                        icon={Bell} 
                        title="App Notifications" 
                        desc="Get instant updates about your orders and money." 
                        active={notifications} 
                        onToggle={() => handleToggle(setNotifications, notifications, "Notifications")} 
                    />
                    <SettingToggle 
                        icon={Globe} 
                        title="Auto Updates" 
                        desc="Keep your medicine prices and stock always updated." 
                        active={globalSync} 
                        onToggle={() => handleToggle(setGlobalSync, globalSync, "Auto Updates")} 
                    />
                    <SettingToggle 
                        icon={Smartphone} 
                        title="SMS Message Alerts" 
                        desc="Get important alerts on your phone via SMS." 
                        active={smsAlerts} 
                        onToggle={() => handleToggle(setSmsAlerts, smsAlerts, "SMS Alerts")} 
                    />
                </div>

                <div className="card" style={{ padding: '40px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock size={24} color="var(--vibrant-gold)" /> Security & Privacy
                    </h3>
                    <SettingToggle 
                        icon={Shield} 
                        title="Two-Factor Login" 
                        desc="Use a code from your phone to login safely." 
                        active={twoFactor} 
                        onToggle={() => handleToggle(setTwoFactor, twoFactor, "2FA Login")} 
                    />
                    <SettingToggle 
                        icon={Eye} 
                        title="Private Mode" 
                        desc="Hide your details from other users." 
                        active={privacyCloak} 
                        onToggle={() => handleToggle(setPrivacyCloak, privacyCloak, "Private Mode")} 
                    />
                    <SettingToggle 
                        icon={Moon} 
                        title="Dark Mode" 
                        desc="Use a dark theme that is easy on the eyes." 
                        active={darkMode} 
                        onToggle={() => handleToggle(setDarkMode, darkMode, "Dark Mode")} 
                    />
                </div>
            </div>

            <div className="card" style={{ marginTop: '40px', padding: '40px', background: 'var(--velvet-dark)', color: 'white', border: 'none', backgroundImage: 'var(--velvet-texture)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px' }}>System Reset</h4>
                        <p style={{ opacity: 0.6, fontSize: '14px', fontWeight: '600' }}>This will clear all saved settings and data from this device.</p>
                    </div>
                    <button onClick={handlePurge} className="btn btn-brick" style={{ padding: '20px 40px', border: '2px solid rgba(255,255,255,0.2)' }}>RESET EVERYTHING</button>
                </div>
            </div>
        </div>
    );
}
