import React, { useState } from 'react';
import { 
    PackagePlus, Save, ArrowLeft, Image as ImageIcon, 
    FileText, Tag, DollarSign, Database, AlertCircle, 
    CheckCircle, ClipboardList, Info, Plus, ChevronRight, X,
    Layers, Truck, ShieldCheck, Zap, Upload
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/axiosConfig';
import Logo from '../components/Logo';

export default function AddProduct() {
    const navigate = useNavigate();
    const location = useLocation();
    const editProduct = location.state?.product;
    const isEditMode = !!editProduct;

    const [formData, setFormData] = useState({
        name: editProduct?.name || '',
        manufacturer: editProduct?.manufacturer || '',
        composition: editProduct?.composition || '',
        retail_price: editProduct?.retail_price || '',
        selling_price: editProduct?.selling_price || '',
        wholesale_price: editProduct?.wholesale_price || '',
        quantity: editProduct?.quantity || '',
        min_quantity: editProduct?.min_quantity || '10',
        min_wholesale_qty: editProduct?.min_wholesale_qty || '100', // Bulk threshold
        min_order_qty: editProduct?.min_order_qty || '10', // Retail minimum
        description: editProduct?.description || '',
        category: editProduct?.category || location.state?.category || 'Pharmaceuticals',
        images: editProduct?.image_url ? (editProduct.image_url.startsWith('data:') ? [editProduct.image_url] : editProduct.image_url.split(',')) : [''] 
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState({});

    const categories = [
        "Pharmaceuticals", "OTC & Health Needs", "Personal Care", 
        "Baby Care", "Vitamins & Supplements", "Diabetic Needs", 
        "Household Needs", "Oral Care", "Sanitary & Hygiene"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (touched[e.target.name]) {
            setTouched({ ...touched, [e.target.name]: false });
        }
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    const handleFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...formData.images];
                newImages[index] = reader.result; 
                setFormData({ ...formData, images: newImages });
            };
            reader.readAsDataURL(file);
        }
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages.length ? newImages : [''] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.retail_price || !formData.selling_price || !formData.wholesale_price) {
            alert("Please fill in all required price and medicine details.");
            return;
        }

        try {
            setLoading(true);
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            
            if (!user.profile_id) {
                alert("Session Expired: Please log in again to add stock.");
                navigate('/login');
                return;
            }

            const activeImages = formData.images.filter(img => img.trim() !== '');
            const payload = {
                ...formData,
                product_id: editProduct?.product_id, // Essential for update sequence
                seller_id: editProduct?.seller_id || user.profile_id,
                image_url: activeImages.length > 0 ? activeImages.join(',') : 'default_medicine.png' 
            };

            const res = isEditMode 
                ? await apiClient.put('/products/', payload)
                : await apiClient.post('/products/', payload);
            
            if (res.data.status === 'success') {
                setSuccess(true);
                setTimeout(() => navigate('/app/products'), 2000);
            } else {
                alert("Stock Error: " + res.data.message);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save medicine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} className="page-transition">
                <div style={{ width: '120px', height: '120px', background: '#ecfdf5', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '40px', boxShadow: '0 30px 60px rgba(16, 185, 129, 0.2)', transform: 'rotate(-5deg)' }}>
                    <CheckCircle size={60} />
                </div>
                <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', marginBottom: '15px', letterSpacing: '-2px' }}>
                    {isEditMode ? 'Specs Updated!' : 'Medicine Added!'}
                </h2>
                <p style={{ color: '#64748b', fontWeight: '600', fontSize: '18px' }}>
                    {isEditMode ? 'Medicine specifications have been successfully modified.' : 'Your new stock is now live in the store.'}
                </p>
            </div>
        );
    }

    const isFieldInvalid = (name) => touched[name] && !formData[name];

    return (
        <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={{ background: 'white', border: '2px solid #f1f5f9', padding: '15px', borderRadius: '20px', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}
                        className="hover-up"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px' }}>
                            {isEditMode ? 'Update Medicine Specs' : 'Add New Medicine'}
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: '700', fontSize: '16px' }}>
                            {isEditMode ? 'Modify pharmaceutical details and procurement parameters.' : 'List your medicines in the professional stock catalog.'}
                        </p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px 25px', borderRadius: '20px', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheck size={20} color="#10b981" />
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#475569' }}>SECURE LISTING</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '50px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'sticky', top: '120px' }}>
                    <div className="card" style={{ padding: '0', background: 'white', borderRadius: '35px', border: '2px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.03)' }}>
                        <div style={{ height: '220px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #f1f5f9' }}>
                            {formData.images[0] && !formData.images[0].startsWith('file://') ? (
                                <img src={formData.images[0]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }} />
                            ) : (
                                <ImageIcon size={64} color="#cbd5e1" />
                            )}
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ color: '#b62d2d', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>LIVE PREVIEW</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>{formData.name || 'Untitled Medicine'}</h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>₹{formData.wholesale_price || '0'}</span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>/ unit wholesale</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '35px', background: '#0f172a', color: 'white', borderRadius: '35px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                                <Zap size={22} color="#facc15" />
                                <h3 style={{ fontSize: '20px', fontWeight: '900' }}>Quick Tips</h3>
                            </div>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {[
                                    "Ensure name matches packaging.",
                                    "Use clear images for buyers.",
                                    "Double check expiry dates.",
                                    "Set realistic wholesale prices."
                                ].map((tip, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', opacity: 0.85 }}>
                                        <div style={{ width: '6px', height: '6px', background: '#facc15', borderRadius: '50%' }} /> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                        
                        <div className="card" style={{ padding: '50px', background: 'white', borderRadius: '45px', border: '2px solid #f8fafc', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                                <div style={{ background: 'rgba(182, 45, 45, 0.1)', padding: '12px', borderRadius: '15px', color: '#b62d2d' }}>
                                    <ClipboardList size={22} />
                                </div>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Medicine Information</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div className="form-group">
                                    <label className={`form-label ${isFieldInvalid('name') ? 'invalid' : ''}`}>MEDICINE NAME <span style={{ color: '#dc2626' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <Tag size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                        <input 
                                            name="name" required value={formData.name} onChange={handleChange} onBlur={handleBlur}
                                            placeholder="e.g. Paracetamol 500mg" 
                                            className={`lux-input ${isFieldInvalid('name') ? 'error' : ''}`}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">MANUFACTURER <span style={{ color: '#dc2626' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <Layers size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                        <input 
                                            name="manufacturer" required value={formData.manufacturer} onChange={handleChange}
                                            placeholder="e.g. Cipla / Sun Pharma" 
                                            className="lux-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                                <div className="form-group">
                                    <label className="form-label">COMPOSITION & SALTS</label>
                                    <input 
                                        name="composition" value={formData.composition} onChange={handleChange}
                                        placeholder="e.g. Paracetamol BP" 
                                        className="lux-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SELECT CATEGORY</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="lux-input" style={{ appearance: 'none', background: '#f8fafc' }}>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '50px', background: 'white', borderRadius: '45px', border: '2px solid #f8fafc', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                                <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '15px', color: '#ca8a04' }}>
                                    <Database size={22} />
                                </div>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Pricing & Stock</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                                <div className="form-group">
                                    <label className="form-label">MRP (₹) <span style={{ color: '#dc2626' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: '#cbd5e1' }}>₹</div>
                                        <input type="number" name="retail_price" required value={formData.retail_price} onChange={handleChange} className="lux-input" placeholder="0.00" style={{ paddingLeft: '40px' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SELLING PRICE (₹) <span style={{ color: '#dc2626' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: '#10b981' }}>₹</div>
                                        <input type="number" name="selling_price" required value={formData.selling_price} onChange={handleChange} className="lux-input" placeholder="0.00" style={{ paddingLeft: '40px' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WHOLESALE PRICE (₹) <span style={{ color: '#dc2626' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: '#b62d2d' }}>₹</div>
                                        <input type="number" name="wholesale_price" required value={formData.wholesale_price} onChange={handleChange} className="lux-input" style={{ paddingLeft: '40px' }} placeholder="0.00" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">TOTAL STOCK <span style={{ color: '#dc2626' }}>*</span></label>
                                    <input type="number" name="quantity" required value={formData.quantity} onChange={handleChange} className="lux-input" placeholder="Units" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">RETAIL MIN ORDER <span style={{ color: '#dc2626' }}>*</span></label>
                                    <input type="number" name="min_order_qty" required value={formData.min_order_qty} onChange={handleChange} className="lux-input" placeholder="Units" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WHOLESALE MIN <span style={{ color: '#dc2626' }}>*</span></label>
                                    <input type="number" name="min_wholesale_qty" required value={formData.min_wholesale_qty} onChange={handleChange} className="lux-input" placeholder="Units" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">LOW STOCK ALERT</label>
                                    <input type="number" name="min_quantity" required value={formData.min_quantity} onChange={handleChange} className="lux-input" />
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '50px', background: '#f8fafc', borderRadius: '45px', border: '2px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '15px', color: '#64748b', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                        <ImageIcon size={22} />
                                    </div>
                                    <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Medicine Images</h3>
                                </div>
                                <button type="button" onClick={addImageField} style={{ padding: '12px 25px', borderRadius: '15px', background: '#0f172a', color: 'white', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover-up">
                                    <Plus size={18} /> ADD MORE PHOTOS
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} style={{ background: 'white', padding: '15px', borderRadius: '30px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '100px 1fr 120px', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {img && !img.startsWith('file://') ? (
                                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Logo size={32} type="icon" />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px' }}>PHOTO SLOT {idx + 1}</div>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type="file" 
                                                    id={`file-${idx}`}
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(idx, e)} 
                                                    style={{ display: 'none' }}
                                                />
                                                <label 
                                                    htmlFor={`file-${idx}`}
                                                    style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                                        padding: '10px 20px', background: '#f1f5f9', color: '#0f172a', 
                                                        borderRadius: '12px', fontSize: '12px', fontWeight: '900', 
                                                        cursor: 'pointer', border: 'none'
                                                    }}
                                                >
                                                    <Upload size={14} /> {img ? 'CHANGE PHOTO' : 'SELECT FROM DEVICE'}
                                                </label>
                                                {img && <span style={{ marginLeft: '12px', fontSize: '11px', fontWeight: '700', color: '#10b981' }}>FILE READY</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button type="button" onClick={() => removeImageField(idx)} style={{ padding: '10px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '50px', background: 'white', borderRadius: '45px', border: '2px solid #f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <FileText size={22} color="#64748b" />
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Medicine Description</h3>
                            </div>
                            <textarea 
                                name="description" value={formData.description} onChange={handleChange} 
                                rows="6" placeholder="Describe clinical benefits, usage, and dosage..."
                                className="lux-input" style={{ resize: 'none', padding: '25px' }}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '40px' }}>
                            <button type="submit" disabled={loading} style={{ padding: '22px 70px', borderRadius: '25px', background: '#b62d2d', border: 'none', color: 'white', fontWeight: '900', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 20px 40px rgba(182, 45, 45, 0.25)' }}>
                                {loading ? 'PLEASE WAIT...' : (isEditMode ? 'SAVE CHANGES' : 'PUBLISH NOW')}
                                <Save size={22} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .lux-input { width: 100%; padding: 18px 20px; background: #f8fafc; border: 2px solid #f1f5f9; borderRadius: 18px; fontWeight: 700; fontSize: 16px; outline: none; transition: 0.3s; color: #0f172a; }
                .lux-input:focus { border-color: #cbd5e1; background: white; }
                .lux-input.error { border-color: #fee2e2; background: #fffcfc; }
                .form-label { font-size: 11px; font-weight: 900; color: #94a3b8; letter-spacing: 1.5px; margin-bottom: 12px; display: block; text-transform: uppercase; }
                .form-label.invalid { color: #dc2626; }
                .lux-input::placeholder { color: #cbd5e1; font-weight: 600; }
                .form-group { width: 100%; }
                .hover-up:hover { transform: translateY(-5px); }
            `}</style>
        </div>
    );
}
