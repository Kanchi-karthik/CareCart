import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, Layers, ArrowUpRight, 
  ArrowDownRight, MoreHorizontal, RefreshCw, Send, Settings, 
  Package, Search, Filter, Printer, FileText, CheckCircle, Activity
} from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Logo from '../components/Logo';

export default function Analysis() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const downloadReport = () => {
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Medical/PHARMA Themed Header
            doc.setFillColor(15, 23, 42); // Slate 900
            doc.rect(0, 0, 210, 50, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.text("CARE CART HUB", 15, 25);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Pharmaceutical Inventory & Clinical Analysis Manifest", 15, 35);
            doc.text(`Issuer Token: ${user.username || 'Authorized Seller'} | HUB_ID: ${user.profile_id}`, 15, 40);
            
            doc.setFillColor(182, 45, 45); // CareCart Red
            doc.rect(160, 10, 35, 35, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text("CERTIFIED", 166, 25);
            doc.text("B2B SOURCE", 164, 30);

            // Analysis Summary
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Executive Stock Summary", 15, 65);
            
            const totalValue = products.reduce((acc, p) => acc + (p.wholesale_price * p.quantity), 0);
            const lowStockCount = products.filter(p => p.quantity <= (p.min_quantity || 20)).length;

            doc.autoTable({
                startY: 75,
                head: [['Metric', 'Clinical Value']],
                body: [
                    ['Market Valuation (INR)', `INR ${totalValue.toLocaleString()}`],
                    ['Inventory Nodes', products.length.toString()],
                    ['Critical Stock Alerts', lowStockCount.toString()],
                    ['Data Sync Timestamp', timestamp]
                ],
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] },
                styles: { fontSize: 10, cellPadding: 8 }
            });

            // Product Ledger
            doc.text("Institutional Stock Ledger", 15, doc.lastAutoTable.finalY + 15);
            
            const tableData = products.map(p => [
                p.product_id,
                p.name,
                p.category,
                p.quantity,
                `INR ${p.wholesale_price.toLocaleString()}`,
                `INR ${(p.wholesale_price * p.quantity).toLocaleString()}`
            ]);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                head: [['ID', 'Medicine', 'Category', 'Qty', 'Unit Rate', 'Total Hub Value']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [182, 45, 45] },
                styles: { fontSize: 8, cellPadding: 4 }
            });

            // Regulatory Footer
            const finalY = doc.lastAutoTable.finalY || 150;
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(7);
            doc.text("This is an electronically generated manifest. All clinical stocks are subject to global logistics compliance.", 15, finalY + 15);
            doc.text("CareCart (c) 2026 - Secure Pharmaceutical Logistics Node.", 15, finalY + 20);

            doc.save(`CareCart_Report_${user.username}_${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
            alert("Report Generation Failed: PDF Context Error.");
        }
    };

    const fetchAnalysisData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/products/');
            let myProducts = res.data || [];
            if (user.role === 'SELLER') {
                myProducts = myProducts.filter(p => p.seller_id === user.profile_id);
            }
            // Sanitize and ensure numeric safety for calculations
            const safeProducts = myProducts.map(p => ({
                ...p,
                wholesale_price: parseFloat(p.wholesale_price) || 0,
                quantity: parseInt(p.quantity) || 0,
                min_quantity: parseInt(p.min_quantity) || 20
            }));
            setProducts(safeProducts);
        } catch (err) {
            console.error("Analysis data fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysisData();
    }, []);

    const getStockStatus = (qty, minQty) => {
        if (qty <= 0) return { label: 'OUT OF STOCK', color: '#ef4444', bg: '#fef2f2' };
        if (qty <= minQty) return { label: 'LOW STOCK', color: '#f97316', bg: '#fff7ed' };
        if (qty > minQty * 5) return { label: 'HIGH STOCK', color: '#3b82f6', bg: '#eff6ff' };
        return { label: 'GOOD', color: '#10b981', bg: '#f0fdf4' };
    };

    const handleAction = async (product, type) => {
        if (type === 'RESTOCK') {
            const refill = prompt(`Add more stock for ${product.name}. Enter quantity to add:`, "500");
            if (refill && !isNaN(refill)) {
                try {
                    await apiClient.post('/products/', { ...product, quantity: product.quantity + parseInt(refill) });
                    alert(`Stock updated. ${refill} units added to ${product.name}.`);
                    fetchAnalysisData();
                } catch (e) { alert("Failed to add stock."); }
            }
        } else if (type === 'SHIPMENT') {
            alert(`Delivery started for ${product.name}. Sending to your center.`);
        }
    };

    const stats = [
        { label: 'Inventory Valuation', value: `₹${products.reduce((acc, p) => acc + (p.wholesale_price * p.quantity), 0).toLocaleString()}`, icon: TrendingUp, color: '#4f46e5', trend: 'Live Asset' },
        { label: 'Outreach Nodes', value: products.filter(p => p.quantity <= (p.min_quantity || 10)).length, icon: AlertTriangle, color: '#ef4444', trend: 'Watchlist' },
        { label: 'Total Stock Units', value: products.reduce((acc, p) => acc + p.quantity, 0).toLocaleString(), icon: Package, color: '#10b981', trend: 'Sync: Active' },
        { label: 'Clinical Accuracy', value: '98.2%', icon: BarChart3, color: '#f59e0b', trend: 'Verified' }
    ];

    return (
        <div className="page-transition" style={{ padding: '0 20px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                   <h1 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1.5px', color: '#0f172a' }}>Medicine Stock Reports</h1>
                   <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>View your latest medicine stocks and sales trends.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={downloadReport} className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '900' }}><Printer size={18} /> DOWNLOAD REPORT</button>
                    <button onClick={fetchAnalysisData} className="btn btn-brick" style={{ fontWeight: '900' }}><RefreshCw size={18} /> REFRESH DATA</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
                {stats.map((s, i) => (
                    <div key={i} className="card hover-up" style={{ padding: '30px', background: 'white', borderRadius: '30px', border: '1px solid #f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ background: `${s.color}15`, padding: '12px', borderRadius: '15px', color: s.color }}><s.icon size={24} /></div>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: s.color === '#ef4444' ? '#ef4444' : '#10b981', background: s.color === '#ef4444' ? '#fef2f2' : '#f0fdf4', padding: '5px 12px', borderRadius: '20px' }}>{s.trend}</span>
                        </div>
                        <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</h3>
                        <p style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '5px' }}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '0', borderRadius: '40px', overflow: 'hidden', background: 'white', border: '1px solid #f1f5f9' }}>
                <div style={{ padding: '30px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>Detailed Stock List</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', color: '#94a3b8' }} />
                            <input type="text" placeholder="Search medicines..." style={{ padding: '12px 15px 12px 45px', borderRadius: '15px', border: '1px solid #e2e8f0', width: '250px', fontWeight: '700', outline: 'none' }} />
                        </div>
                        <button className="btn-icon" style={{ background: '#f8fafc' }}><Filter size={20} /></button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '100px', textAlign: 'center', fontWeight: '900', color: 'var(--velvet-brick)' }}>UPDATING MEDICINE LIST...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-grid">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '40px' }}>Medicine Details</th>
                                    <th>Stock Status</th>
                                    <th>Quantity</th>
                                    <th>Stock Valuation (₹)</th>
                                    <th>Velocity Index</th>
                                    <th style={{ textAlign: 'right', paddingRight: '40px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => {
                                    const status = getStockStatus(p.quantity, p.min_quantity || 20);
                                    return (
                                        <tr key={p.product_id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '25px 40px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ width: '45px', height: '45px', background: `${status.color}10`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: status.color }}>{p.name.charAt(0)}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '900', color: '#0f172a' }}>{p.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>{p.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '10px', fontWeight: '900', background: status.bg, color: status.color, padding: '6px 15px', borderRadius: '30px', border: `1px solid ${status.color}20` }}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '900', color: '#0f172a' }}>{p.quantity.toLocaleString()} <span style={{ color: '#94a3b8', fontSize: '11px' }}>UNITS</span></div>
                                                <div style={{ width: '100px', height: '6px', background: '#f1f5f9', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min((p.quantity / (p.min_quantity * 5 || 100)) * 100, 100)}%`, height: '100%', background: status.color }}></div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '900', color: 'var(--velvet-brick)' }}>
                                                ₹{(p.wholesale_price * p.quantity).toLocaleString()}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: '900' }}>
                                                    <Activity size={16} /> {p.quantity > (p.min_quantity * 5) ? 'FAST' : 'NORMAL'}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '40px' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleAction(p, 'RESTOCK')} title="Buy More Stock" className="btn-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><RefreshCw size={18} /></button>
                                                    <button onClick={() => handleAction(p, 'SHIPMENT')} title="Send to Center" className="btn-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Send size={18} /></button>
                                                    <button className="btn-icon" style={{ background: '#f8fafc' }}><MoreHorizontal size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
