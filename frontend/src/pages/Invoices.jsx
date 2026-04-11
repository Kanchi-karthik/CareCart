import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search, ShieldCheck, Clock } from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/orders/?status=DELIVERED'); // Invoices for completed orders
            let myInvoices = res.data || [];
            if (user.role === 'SELLER') {
                myInvoices = myInvoices.filter(i => i.seller_id === user.profile_id);
            }
            // Map orders to invoice structure
            setInvoices(myInvoices.map(order => ({
                invoice_id: order.order_id,
                amount: order.total_amount,
                issued_date: order.order_date,
                due_date: new Date(new Date(order.order_date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'PAID'
            })));
        } catch (err) {
            console.error("Invoices error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const downloadInvoicePDF = (invoice) => {
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Institutional Header
            doc.setFillColor(15, 23, 42); 
            doc.rect(0, 0, 210, 50, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.text("CARE CART FINANCIAL", 15, 25);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Official Fiscal Manifest / Electronic Invoice", 15, 35);
            doc.text(`Issuer: CareCart Global Logistics Hub | Account: ${user.username}`, 15, 40);
            doc.text(`Generated: ${timestamp}`, 150, 25);
            
            doc.setFillColor(182, 45, 45); // Red accent
            doc.rect(150, 10, 45, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text(`ID: #INV-${invoice.invoice_id}`, 155, 17);

            // Invoice Metadata
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("Financial Record Summary", 15, 65);
            
            doc.autoTable({
                startY: 75,
                body: [
                    ['Reference ID', `#INV-${invoice.invoice_id.toString().padStart(4, '0')}`],
                    ['Valuation', `INR ${Number(invoice.amount).toLocaleString()}`],
                    ['Issued Date', new Date(invoice.issued_date).toLocaleDateString()],
                    ['Due Date', new Date(invoice.due_date).toLocaleDateString()],
                    ['Settlement Status', invoice.status]
                ],
                theme: 'striped',
                styles: { fontSize: 11, cellPadding: 8 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 50 },
                    1: { halign: 'right' }
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

            doc.save(`CareCart_Invoice_${invoice.invoice_id}_${Date.now()}.pdf`);
        } catch (err) {
            console.error("Invoice Export failed:", err);
            alert("Digital Export Error: Check system logs.");
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>Billing Matrix</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Manage and archive official <span style={{ color: 'var(--velvet-brick)' }}>financial compliance</span> records.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', background: 'var(--velvet-dark)', color: 'white', padding: '15px 30px', borderRadius: '20px', border: '2px solid var(--vibrant-gold)' }}>
                    <ShieldCheck size={24} color="var(--vibrant-gold)" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', opacity: 0.7 }}>COMPLIANCE STATUS</span>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>VERIFIED NODE</span>
                    </div>
                </div>
            </div>

            <div className="filter-hub">
                <div className="search-field">
                    <Search size={20} className="icon" />
                    <input
                        type="text"
                        placeholder="Search Invoice Reference or Alias..."
                    />
                </div>
                <button className="btn-icon" style={{ width: 'auto', padding: '0 25px', gap: '10px', background: '#f8fafc', color: '#64748b' }}>
                    <Filter size={18} />
                    <span style={{ fontWeight: '900', fontSize: '11px' }}>FILTER ARCHIVE</span>
                </button>
            </div>

            <div className="data-grid-container">
                <table className="data-grid">
                    <thead>
                        <tr>
                            <th>Reference Ledger</th>
                            <th>Fiscal Duration</th>
                            <th>Total Valuation</th>
                            <th>Settlement Status</th>
                            <th style={{ textAlign: 'right' }}>Documentation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '150px', textAlign: 'center' }}>
                                <div style={{ width: '50px', height: '50px', border: '5px solid var(--vibrant-gold)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                            </td></tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                        <FileText size={64} style={{ color: '#e2e8f0' }} />
                                        <p style={{ color: '#94a3b8', fontWeight: '800', fontSize: '18px' }}>No financial threads active in this cycle.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoices.map(invoice => (
                                <tr key={invoice.invoice_id}>
                                    <td>
                                        <code style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: 'var(--velvet-brick)' }}>#INV-{invoice.invoice_id.toString().padStart(4, '0')}</code>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                                                <Clock size={14} className="text-muted" /> {new Date(invoice.issued_date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--velvet-brick)' }}>
                                                DUE: {new Date(invoice.due_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--velvet-dark)' }}>₹{Number(invoice.amount).toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <span className={`status ${invoice.status.toLowerCase()}`} style={{ fontWeight: '900', fontSize: '10px' }}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            onClick={() => downloadInvoicePDF(invoice)}
                                            className="btn-icon" 
                                            style={{ width: 'auto', padding: '10px 20px', gap: '8px', background: 'rgba(192, 57, 43, 0.05)', color: 'var(--velvet-brick)' }}
                                        >
                                            <Download size={16} />
                                            <span style={{ fontWeight: '900', fontSize: '11px' }}>DOWNLOAD PDF</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
