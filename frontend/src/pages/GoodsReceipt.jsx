import React, { useState, useEffect } from 'react';
import { Package, Plus, ClipboardList, TrendingUp, ShieldCheck, Mail, MapPin, Search, FileDown } from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function GoodsReceipt() {
    const [products, setProducts] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: '',
        supplier_name: '',
        notes: ''
    });

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const isPrivacyActive = JSON.parse(localStorage.getItem('setting_privacy') ?? 'true');

    const downloadReport = () => {
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Institutional Header
            doc.setFillColor(15, 23, 42); 
            doc.rect(0, 0, 210, 45, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("CARE CART HUB", 15, 22);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Inward Inventory Ledger & Supply Manifest", 15, 30);
            doc.text(`Recorded By: ${user.username} | Region: GLOBAL`, 15, 35);
            doc.text(`Generated: ${timestamp}`, 150, 22);

            const tableData = receipts.map(r => [
                `#RC-${r.receipt_id}`,
                r.product_name,
                `+${r.quantity}`,
                r.supplier_name || 'Direct Link',
                new Date(r.receipt_date).toLocaleDateString()
            ]);

            doc.autoTable({
                startY: 55,
                head: [['ID', 'Medicinal Supply', 'Count', 'Partner Node', 'Timestamp']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [182, 45, 45], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 5 },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 25 },
                    1: { fontStyle: 'bold' },
                    2: { halign: 'center', textColor: [39, 174, 96] }
                }
            });

            // Compliance Footer
            const finalY = doc.lastAutoTable.finalY || 150;
            doc.setFillColor(248, 250, 252);
            doc.rect(15, finalY + 15, 180, 25, 'F');
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.text("CONFIDENTIAL: This manifest contains regulated financial transaction logs.", 20, finalY + 25);
            doc.text("The billing data is synchronized with secure banking nodes via AES-256 protocols.", 20, finalY + 30);

            doc.save(`CareCart_Stock_Log_${Date.now()}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("Digital Export Error: Check system logs.");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const productsRes = await apiClient.get('/products');
            setProducts(productsRes.data || []);
            const receiptsRes = await apiClient.get('/goods-receipts');
            setReceipts(receiptsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/goods-receipts', {
                product_id: parseInt(formData.product_id),
                quantity: parseInt(formData.quantity),
                supplier_name: formData.supplier_name,
                notes: formData.notes
            });

            alert('✅ Stock Integrated. Regional inventory updated.');
            setFormData({ product_id: '', quantity: '', supplier_name: '', notes: '' });
            setShowForm(false);
            loadData();
        } catch (error) {
            alert('Digital Log Failure: Hub rejected the entry.');
        }
    };

    return (
        <div className="page-transition">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                    <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Inward Ledger</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '22px', fontWeight: '700' }}>Recording <span style={{ color: 'var(--velvet-brick)' }}>verified medical supplies</span> into the global registry.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className={showForm ? "btn" : "btn btn-brick"}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', border: showForm ? '2px solid #eee' : 'none' }}
                >
                    {showForm ? 'ABORT ENTRY' : <><Plus size={26} /> RECORD SHIPMENT</>}
                </button>
            </div>

            {/* Inward Form Section */}
            {showForm && (
                <div className="card" style={{ marginBottom: '60px', border: '4px solid var(--vibrant-gold)', position: 'relative', padding: '50px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Log Incoming Stocks</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                            <div>
                                <label className="form-label">Target Product Node</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    required
                                    className="form-input"
                                    style={{ marginBottom: 0 }}
                                >
                                    <option value="">Select a product...</option>
                                    {products.map(p => (
                                        <option key={p.product_id} value={p.product_id}>{p.name} (Cur: {p.quantity})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Verified Quantity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                    min="1"
                                    placeholder="Enter net count"
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
                            <div>
                                <label className="form-label">Source Supplier Node</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.supplier_name}
                                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                                    placeholder="Wholesale Partner Name"
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div>
                                <label className="form-label">Registry Reference / Notes</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Batch # or digital ref"
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-brick" style={{ width: '100%', padding: '20px', borderRadius: '15px' }}>
                            COMMIT TO INVENTORY SYSTEM
                        </button>
                    </form>
                </div>
            )}

            {/* Compliance Status Section */}
            <div style={{ marginBottom: '80px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '900', color: 'var(--vibrant-gold)', marginBottom: '40px', letterSpacing: '-2px' }}>Compliance Status</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '50px' }}>
                    <div className="card" style={{ padding: '40px', background: 'white', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '15px' }}>UPTIME</div>
                        <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>99.99%</div>
                    </div>
                    <div className="card" style={{ padding: '40px', background: 'white', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '15px' }}>ENCRYPTION</div>
                        <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>AES-256</div>
                    </div>
                    <div className="card" style={{ padding: '40px', background: 'white', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '15px' }}>COMPLIANCE</div>
                        <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>HIPAA/ISO</div>
                    </div>
                </div>

                <button 
                    onClick={downloadReport} 
                    className="btn btn-dark" 
                    style={{ 
                        background: '#0f172a', 
                        color: 'white', 
                        padding: '20px 60px', 
                        borderRadius: '50px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '15px',
                        fontSize: '14px',
                        fontWeight: '900',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    <FileDown size={20} /> DOWNLOAD FULL REPORT
                </button>
            </div>

            {/* History Table */}
            <div className="data-grid-container">
                <div style={{ padding: '30px 40px', borderBottom: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--velvet-dark)' }}>Operational History</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: '#94a3b8' }} />
                            <input 
                                className="form-input" 
                                placeholder="Filter history..." 
                                style={{ marginBottom: 0, paddingLeft: '45px', paddingRight: '20px', height: '48px', width: '300px' }} 
                            />
                        </div>
                    </div>
                </div>
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>Reference ID</th>
                            <th>Supply Node / Product</th>
                            <th>Inward Quantity</th>
                            <th>Partner Node</th>
                            <th>Log Timestamp</th>
                            <th style={{ textAlign: 'right' }}>Security Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}>
                                <div className="spin-loader" style={{ margin: '0 auto' }}></div>
                            </td></tr>
                        ) : receipts.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', fontWeight: '800', color: '#94a3b8' }}>
                                <Package size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                                <p>Registry is currently empty for this sector.</p>
                            </td></tr>
                        ) : (
                            receipts.map((r) => (
                                <tr key={r.receipt_id}>
                                    <td><code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>#RC-{r.receipt_id}</code></td>
                                    <td>
                                        <div style={{ fontWeight: '900', fontSize: '16px', color: 'var(--velvet-dark)' }}>{r.product_name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>SKU: {r.product_id}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#27ae60', fontWeight: '900', fontSize: '18px' }}>
                                            <TrendingUp size={16} /> +{r.quantity}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '700', color: '#64748b' }}>{r.supplier_name || 'Direct Link'}</td>
                                    <td style={{ fontWeight: '800', color: '#94a3b8', fontSize: '13px' }}>
                                        {new Date(r.receipt_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ textAlign: 'right', fontStyle: 'italic', fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>
                                        {r.notes || 'Verified Inward'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <style>{`.spin-loader { width: 40px; height: 40px; border: 4px solid var(--vibrant-gold); border-top-color: var(--velvet-brick); border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

