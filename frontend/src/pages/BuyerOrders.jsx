import React, { useState, useEffect } from 'react';
import {
    ShoppingBag, Box, CheckCircle, Clock, Printer, Search, ArrowRight,
    X, FileText, Download, ShieldCheck, Mail, Phone, MapPin, Trash2, AlertTriangle,
    ChevronRight
} from 'lucide-react';
import Logo from '../components/Logo';
import apiClient from '../utils/axiosConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const InvoiceModal = ({ ordersInBundle, onClose }) => {
    if (!ordersInBundle || ordersInBundle.length === 0) return null;
    const order = ordersInBundle[0]; // Reference for header info
    const totalMedicinesValue = ordersInBundle.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalTax = ordersInBundle.reduce((sum, o) => sum + Number(o.tax_amount || 0), 0);
    const totalShipping = ordersInBundle.reduce((sum, o) => sum + Number(o.delivery_charge || 0), 0);
    const totalGrand = ordersInBundle.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);

    const handlePrint = () => { window.print(); };

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Institutional Header
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 50, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.text("CARE CART PROCUREMENT", 15, 25);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Institutional Fiscal Manifest / Combined Invoice", 15, 35);
            doc.text(`Transaction Reference: #${order.bundle_id || order.order_id}`, 15, 40);
            doc.text(`Generated: ${timestamp}`, 150, 25);

            // Client & Status Section
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("ISSUED TO:", 15, 65);
            doc.setFont("helvetica", "normal");
            doc.text(JSON.parse(sessionStorage.getItem('user'))?.username || 'Institutional Buyer', 15, 72);
            doc.setFontSize(9);
            doc.text("Registered Healthcare Partner Node", 15, 77);

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("SETTLEMENT STATUS:", 140, 65);
            doc.setTextColor(order.status === 'CANCELLED' ? [239, 68, 68] : [16, 185, 129]);
            doc.text(order.status === 'CANCELLED' ? 'VOIDED' : 'AUTHORIZED & VERIFIED', 140, 72);

            const tableData = ordersInBundle.map(o => [
                o.product_name,
                o.quantity,
                `INR ${(Number(o.total_amount) / (o.quantity || 1)).toLocaleString()}`,
                `INR ${Number(o.total_amount).toLocaleString()}`
            ]);

            doc.autoTable({
                startY: 85,
                head: [['Pharmaceutical Item', 'Quantity', 'Unit Price', 'Total']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [182, 45, 45], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 5 },
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right', fontStyle: 'bold' }
                }
            });

            const finalY = doc.lastAutoTable.finalY || 150;

            // Totals Section
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(10);
            doc.text("Medicines Subtotal:", 140, finalY + 15);
            doc.text("Logistics & Handling Fee:", 140, finalY + 22);
            doc.text("Service GST (0.2%):", 140, finalY + 29);

            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.text(`INR ${totalMedicinesValue.toLocaleString()}`, 190, finalY + 15, { align: 'right' });
            doc.text(`INR ${totalShipping.toLocaleString()}`, 190, finalY + 22, { align: 'right' });
            doc.text(`INR ${totalTax.toLocaleString()}`, 190, finalY + 29, { align: 'right' });

            doc.setDrawColor(226, 232, 240);
            doc.line(140, finalY + 34, 195, finalY + 34);

            doc.setFontSize(14);
            doc.setTextColor(182, 45, 45);
            doc.text("TOTAL PAID BILL:", 140, finalY + 42);
            doc.text(`INR ${totalGrand.toLocaleString()}`, 195, finalY + 42, { align: 'right' });

            // Compliance Footer
            doc.setFillColor(248, 250, 252);
            doc.rect(15, finalY + 55, 180, 25, 'F');
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("CONFIDENTIAL: This document is a legally binding record of procurement.", 20, finalY + 65);
            doc.text("Generated via the CareCart Secure Hub. All transactions are logged for clinical compliance.", 20, finalY + 70);

            doc.save(`CareCart_Invoice_${order.bundle_id || order.order_id}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("Digital Export Error: Check system logs.");
        }
    };

    return (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div className="modal-content page-transition" id="invoice-modal" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', padding: '0', borderRadius: '40px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', background: 'white' }}>
                <div style={{ background: '#0f172a', padding: '50px 60px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <Logo size={40} inverse />
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginTop: '30px', letterSpacing: '-1.5px' }}>Combined Institutional Invoice</h2>
                        <div style={{ display: 'flex', gap: '25px', marginTop: '20px' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>TRANSACTION REF</div>
                                <div style={{ fontSize: '15px', fontWeight: '800' }}>#{order.bundle_id || order.order_id}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>ISSUE DATE</div>
                                <div style={{ fontSize: '15px', fontWeight: '800' }}>{new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '12px', borderRadius: '15px', cursor: 'pointer' }} className="hover-up">
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '60px', background: 'white' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>ISSUED TO</h3>
                            <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{JSON.parse(sessionStorage.getItem('user'))?.username || 'Institutional Buyer'}</p>
                            <p style={{ color: '#64748b', fontWeight: '700', marginTop: '5px', fontSize: '14px' }}>Registered Healthcare Partner</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>SETTLEMENT STATUS</h3>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: order.status === 'CANCELLED' ? '#fef2f2' : '#ecfdf5', color: order.status === 'CANCELLED' ? '#ef4444' : '#10b981', padding: '10px 20px', borderRadius: '20px', fontWeight: '900', fontSize: '13px' }}>
                                <ShieldCheck size={18} /> {order.status === 'CANCELLED' ? 'VOIDED' : 'AUTHORIZED & VERIFIED'}
                            </div>
                        </div>
                    </div>

                    <div style={{ border: '2px dashed #f1f5f9', borderRadius: '30px', padding: '40px', marginBottom: '30px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ textAlign: 'left', paddingBottom: '25px', color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>PHARMACEUTICAL ITEM</th>
                                    <th style={{ textAlign: 'center', paddingBottom: '25px', color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>QUANTITY</th>
                                    <th style={{ textAlign: 'right', paddingBottom: '25px', color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>UNIT PRICE</th>
                                    <th style={{ textAlign: 'right', paddingBottom: '25px', color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersInBundle.map(o => (
                                    <tr key={o.order_id}>
                                        <td style={{ paddingTop: '30px' }}>
                                            <div style={{ fontWeight: '900', fontSize: '18px', color: '#0f172a' }}>{o.product_name}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', marginTop: '5px' }}>Ref: {o.order_id}</div>
                                        </td>
                                        <td style={{ paddingTop: '30px', textAlign: 'center', fontWeight: '900', fontSize: '16px' }}>{o.quantity} Units</td>
                                        <td style={{ paddingTop: '30px', textAlign: 'right', fontWeight: '900', fontSize: '16px' }}>₹{(Number(o.total_amount) / (o.quantity || 1)).toLocaleString()}</td>
                                        <td style={{ paddingTop: '30px', textAlign: 'right', fontWeight: '900', fontSize: '18px' }}>₹{Number(o.total_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ background: '#fffbeb', padding: '20px 30px', borderRadius: '20px', border: '1px solid #fef3c7', maxWidth: '350px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <AlertTriangle size={20} color="#f59e0b" />
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400e' }}>CANCELLATION POLICY</div>
                                    <div style={{ fontSize: '10px', color: '#92400e', marginTop: '4px', fontWeight: '700', lineHeight: '1.4' }}>
                                        Upon cancellation, only the Medicine Base Value (₹{totalMedicinesValue.toLocaleString()}) will be credited back.
                                        Application usage GST and logistics fees are non-refundable.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '350px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '800' }}>Medicines Subtotal</span>
                                <span style={{ fontWeight: '900' }}>₹{totalMedicinesValue.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '800' }}>Logistics & Handling Fee</span>
                                <span style={{ fontWeight: '900' }}>₹{totalShipping.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '800' }}>Service GST (0.2%)</span>
                                <span style={{ fontWeight: '900' }}>₹{totalTax.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #f1f5f9' }}>
                                <span style={{ fontSize: '20px', fontWeight: '900' }}>TOTAL PAID BILL</span>
                                <span style={{ fontSize: '24px', fontWeight: '900', color: order.status === 'CANCELLED' ? '#ef4444' : 'var(--velvet-brick)' }}>₹{totalGrand.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    {/* ... (Footer buttons same as before) */}
                    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>CareCart Secure Procurement System</div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={handlePrint} className="btn" style={{ padding: '12px 25px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}><Printer size={18} /> PRINT</button>
                            <button onClick={downloadPDF} className="btn btn-brick" style={{ padding: '12px 25px', borderRadius: '12px' }}><Download size={18} /> DOWNLOAD</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BuyerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBundle, setSelectedBundle] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/orders/?buyer_id=${user.profile_id}`);
            setOrders(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    // 📦 Logic: Group individual orders into Bundles
    const bundledOrders = React.useMemo(() => {
        const groups = {};
        orders.forEach(o => {
            const id = o.bundle_id || `SINGLE_${o.order_id}`;
            if (!groups[id]) groups[id] = [];
            groups[id].push(o);
        });
        return Object.entries(groups).map(([bid, list]) => ({
            bundle_id: bid,
            items: list,
            main_order: list[0], // for date and status
            total_price: list.reduce((sum, item) => sum + Number(item.total_amount || 0), 0),
            item_count: list.length
        })).sort((a, b) => new Date(b.main_order.order_date) - new Date(a.main_order.order_date));
    }, [orders]);

    const handleCancel = async (bundleId, items) => {
        if (!window.confirm(`Are you sure you want to void this procurement bundle (#${bundleId})?`)) return;
        try {
            setIsProcessing(true);
            for (const item of items) {
                await apiClient.put('/orders/', { 
                    order_id: item.order_id, 
                    status: 'CANCELLED',
                    changed_by: user.username
                });
            }
            alert("Institutional Manifest Voided successfully.");
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("Void action failed. Contact Logistics Support.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DELIVERED': return { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' };
            case 'CANCELLED': return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
            default: return { color: '#f59e0b', bg: '#fff7ed', border: '#fed7aa' };
        }
    };

    return (
        <div className="page-transition" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-2.5px', color: '#0f172a' }}>Purchase History</h1>
                    <p style={{ color: '#64748b', fontWeight: '700' }}>Consolidated view of your pharmaceutical acquisitions.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>EXPENDITURE</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#b62d2d' }}>₹{bundledOrders.filter(b => b.main_order.status !== 'CANCELLED').reduce((acc, b) => acc + b.total_price, 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', fontWeight: '900', color: '#b62d2d' }}>LOADING PROCUREMENT RECORDS...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {bundledOrders.map(bundle => {
                        const { bundle_id, items, main_order, total_price, item_count } = bundle;
                        const style = getStatusStyle(main_order.status);
                        return (
                            <div key={bundle_id} className="card hover-up" style={{ padding: '35px', borderRadius: '40px', background: 'white', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }} onClick={() => setSelectedBundle(items)}>
                                    <div style={{ width: '85px', height: '85px', borderRadius: '25px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b62d2d', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)' }}>
                                        <FileText size={40} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>
                                            {bundle_id.startsWith('BNDL') ? 'BULK PURCHASE' : 'SINGLE ORDER'} #{main_order.order_id}
                                        </div>
                                        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                                            {item_count > 1 ? `${main_order.product_name} & ${item_count - 1} more...` : main_order.product_name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>{new Date(main_order.order_date).toLocaleDateString()}</div>
                                            <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                                            <div style={{ fontWeight: '900', color: '#b62d2d', fontSize: '16px' }}>₹{total_price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                                    {main_order.status === 'PENDING' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleCancel(bundle_id, items); }}
                                            className="btn"
                                            disabled={isProcessing}
                                            style={{ padding: '10px 20px', borderRadius: '20px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecaca', fontWeight: '900', fontSize: '12px' }}
                                        >
                                            CANCEL ORDER
                                        </button>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: style.bg, padding: '10px 20px', borderRadius: '30px', color: style.color, border: `1px solid ${style.border}` }}>
                                        <div style={{ width: '8px', height: '8px', background: 'currentColor', borderRadius: '50%' }}></div>
                                        <span style={{ fontWeight: '900', fontSize: '13px' }}>{main_order.status}</span>
                                    </div>
                                    <div onClick={() => setSelectedBundle(items)} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {bundledOrders.length === 0 && (
                        <div className="card" style={{ padding: '100px', textAlign: 'center', borderRadius: '50px', background: 'white' }}>
                            <ShoppingBag size={60} color="#e2e8f0" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#94a3b8' }}>No Orders Recorded</h3>
                        </div>
                    )}
                </div>
            )}
            {selectedBundle && <InvoiceModal ordersInBundle={selectedBundle} onClose={() => setSelectedBundle(null)} />}
        </div>
    );
};

export default BuyerOrders;
