import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Building2, Mail, Phone, MapPin, Globe, ShieldCheck, 
  Package, ShoppingCart, Activity, ArrowLeft, ExternalLink,
  ChevronRight, Calendar, CreditCard, CheckCircle2, Pill
} from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const ProfileView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [extraData, setExtraData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        bank_account_no: '',
        ifsc_code: '',
        bank_name: '',
        upi_id: ''
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            let endpoint = '';
            if (type === 'seller') endpoint = `/sellers/?id=${id}`;
            else if (type === 'buyer') endpoint = `/buyers/?id=${id}`;
            else endpoint = `/users/?id=${id}`;

            const res = await apiClient.get(endpoint);
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setProfile(data);

            if (data) {
                setEditFormData({
                    bank_account_no: data.bank_account_no || '',
                    ifsc_code: data.ifsc_code || '',
                    bank_name: data.bank_name || '',
                    upi_id: data.upi_id || ''
                });
            }

            // Fetch extra data — use the SELLER_ID from profile (not the URL USER_ID)
            if (type === 'seller') {
                const prodRes = await apiClient.get('/products/');
                // profile.seller_id = SEL_001, profile.user_id = USR_SELLER1
                // URL param id could be either — match both
                const sellerId = data?.seller_id;
                const sellerProds = (prodRes.data || []).filter(p =>
                    p.seller_id === sellerId || p.seller_id === id || p.user_id === id
                );
                setExtraData(sellerProds);
            } else if (type === 'buyer') {
                const orderRes = await apiClient.get('/orders/');
                const buyerOrders = (orderRes.data || []).filter(o => o.buyer_id === id);
                setExtraData(buyerOrders);
            }
        } catch (err) {
            console.error("Profile fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [type, id]);

    const handleUpdateBank = async () => {
        try {
            const payload = { ...profile, ...editFormData };
            const res = await apiClient.put('/sellers/', payload);
            if (res.data.status === 'success') {
                alert("Financial settlement profile updated.");
                setShowEditModal(false);
                fetchProfile();
            } else {
                alert(res.data.message || "Update failed.");
            }
        } catch (err) {
            alert("Settlement link unreachable.");
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontWeight: '900', color: '#b62d2d' }}>LOADING PROFILE...</div>;
    if (!profile) return <div style={{ padding: '100px', textAlign: 'center' }}>Entity not found.</div>;

    const isSeller = type === 'seller';
    const isBuyer = type === 'buyer';

    return (
        <div className="page-transition" style={{ padding: '40px 0' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer', marginBottom: '30px' }}>
                <ArrowLeft size={20} /> BACK TO LIST
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px', alignItems: 'start' }}>
                {/* Left Column: Core Info */}
                <div style={{ background: 'white', borderRadius: '40px', padding: '40px', border: '2px solid #f1f5f9', position: 'sticky', top: '20px' }}>
                    <div style={{ width: '120px', height: '120px', background: isSeller ? '#0f172a' : '#b62d2d', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                        {isSeller ? <Building2 size={60} /> : <User size={60} />}
                    </div>

                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '10px', lineHeight: '1.1' }}>
                        {isSeller ? profile.company_name : (isBuyer ? profile.organization_name : profile.username)}
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '35px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', background: '#f8fafc', padding: '6px 12px', borderRadius: '30px', color: '#64748b', letterSpacing: '1px' }}>ID: {id}</span>
                        {profile.verification_status === 'VERIFIED' ? (
                            <span style={{ fontSize: '11px', fontWeight: '900', background: '#ecfdf5', padding: '6px 12px', borderRadius: '30px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ShieldCheck size={14} /> VERIFIED
                            </span>
                        ) : (
                            <span style={{ fontSize: '11px', fontWeight: '900', background: '#fff1f2', padding: '6px 12px', borderRadius: '30px', color: '#b62d2d' }}>PENDING</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                        <div className="info-node">
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>EMAIL CONTACT</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', color: '#1e293b' }}><Mail size={16} color="#64748b" /> {profile.email}</div>
                        </div>
                        <div className="info-node">
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>PHONE NUMBER</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', color: '#1e293b' }}><Phone size={16} color="#64748b" /> {profile.phone}</div>
                        </div>
                        <div className="info-node">
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>HUB LOCATION</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', color: '#1e293b' }}><MapPin size={16} color="#64748b" /> {profile.city}, {profile.country}</div>
                        </div>
                        {isSeller && (
                            <div className="info-node">
                                <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>REGISTRATION NO</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', color: '#1e293b' }}><Globe size={16} color="#64748b" /> {profile.business_reg_no}</div>
                            </div>
                        )}
                    </div>

                    {isSeller && (
                        <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CreditCard size={18} color="#b62d2d" /> Bank Details
                                </h4>
                                <button onClick={() => setShowEditModal(true)} style={{ background: 'none', border: 'none', color: '#b62d2d', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>EDIT</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', display: 'block' }}>ACCOUNT NO</label>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{profile.bank_account_no || 'Not Set'}</span>
                                </div>
                                <div>
                                    <label style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', display: 'block' }}>IFSC / BANK</label>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{profile.ifsc_code ? `${profile.ifsc_code} (${profile.bank_name})` : 'Not Set'}</span>
                                </div>
                                <div>
                                    <label style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', display: 'block' }}>UPI ID</label>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981' }}>{profile.upi_id || 'Not Set'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Activity / Products */}
                <div>
                    <div style={{ background: 'white', borderRadius: '40px', padding: '50px', border: '2px solid #f1f5f9', minHeight: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>
                                {isSeller ? 'Product Inventory' : (isBuyer ? 'Recent Procurement' : 'User Activity')}
                            </h3>
                            <div style={{ background: '#f8fafc', padding: '10px 25px', borderRadius: '50px', fontWeight: '900', fontSize: '13px', color: '#64748b' }}>
                                {extraData.length} TOTAL ENTRIES
                            </div>
                        </div>

                        {isSeller ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                {extraData.map(p => (
                                    <div key={p.product_id} onClick={() => navigate(`/app/products/${p.product_id}`)} style={{ padding: '25px', background: '#f8fafc', borderRadius: '25px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.3s' }} className="row-hover">
                                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#b62d2d', marginBottom: '5px' }}>{p.category}</div>
                                        <h4 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '10px' }}>{p.name}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>₹{(p.selling_price || p.wholesale_price || 0).toLocaleString()}</span>
                                            <span style={{ fontSize: '12px', fontWeight: '900', color: '#64748b' }}>STOCK: {p.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                                {extraData.length === 0 && <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '700' }}>No products listed yet.</div>}
                            </div>
                        ) : isBuyer ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {extraData.map(o => (
                                    <div key={o.order_id} style={{ padding: '25px', background: '#f8fafc', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ padding: '15px', background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                                                <Package size={24} color="#b62d2d" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8' }}>ORDER #{o.order_id}</div>
                                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{o.product_name} x {o.quantity}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>₹{(o.total_amount || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', background: '#ecfdf5', padding: '4px 12px', borderRadius: '30px', marginTop: '5px' }}>{o.status}</div>
                                        </div>
                                    </div>
                                ))}
                                {extraData.length === 0 && <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '700' }}>No procurement history.</div>}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '700' }}>Basic user profiles do not have extended trade activity.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Bank Details Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '40px', padding: '50px' }}>
                        <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>Settlement Node</h3>
                        <div style={{ display: 'grid', gap: '20px', marginBottom: '35px' }}>
                            <div className="input-group">
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>BANK ACCOUNT NUMBER</label>
                                <input className="lux-input" value={editFormData.bank_account_no} onChange={(e) => setEditFormData({...editFormData, bank_account_no: e.target.value})} placeholder="0000000000000" />
                            </div>
                            <div className="input-group">
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>IFSC CODE</label>
                                <input className="lux-input" value={editFormData.ifsc_code} onChange={(e) => setEditFormData({...editFormData, ifsc_code: e.target.value.toUpperCase()})} placeholder="HDFC0001234" />
                            </div>
                            <div className="input-group">
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>BANK NAME</label>
                                <input className="lux-input" value={editFormData.bank_name} onChange={(e) => setEditFormData({...editFormData, bank_name: e.target.value})} placeholder="e.g. HDFC Bank" />
                            </div>
                            <div className="input-group">
                                <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>UPI ID (FOR FAST SETTLEMENT)</label>
                                <input className="lux-input" value={editFormData.upi_id} onChange={(e) => setEditFormData({...editFormData, upi_id: e.target.value})} placeholder="pharmacy@upi" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '900', cursor: 'pointer' }}>CANCEL</button>
                            <button onClick={handleUpdateBank} style={{ flex: 2, padding: '15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>SAVE CHANGES</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .info-node { border-bottom: 1px solid #f1f5f9; padding-bottom: 25px; }
                .info-node:last-child { border: none; }
                .row-hover { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .row-hover:hover { transform: translateY(-8px); border-color: #b62d2d; box-shadow: 0 30px 60px rgba(182,45,45,0.08); background: white; }
                .lux-input { width: 100%; padding: 18px 25px; border-radius: 20px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: 800; outline: none; transition: 0.3s; }
                .lux-input:focus { border-color: #b62d2d; background: white; box-shadow: 0 10px 30px rgba(182, 45, 45, 0.05); }
                .page-transition { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ProfileView;
