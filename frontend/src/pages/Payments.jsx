import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Search, Download, Star, DollarSign } from 'lucide-react';
import apiClient from '../utils/axiosConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/payments?role=${user.role}&userId=${user.user_id}`);
                const sorted = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setPayments(sorted);
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [user.role, user.user_id]);

    const downloadBillsPDF = () => {
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Institutional Header
            doc.setFillColor(15, 23, 42); 
            doc.rect(0, 0, 210, 50, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.text("CARE CART SETTLEMENTS", 15, 25);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Official Billing Audit / Transaction Log Manifest", 15, 35);
            doc.text(`Issuer: CareCart Global Logistics Hub | Account: ${user.username}`, 15, 40);
            doc.text(`Generated: ${timestamp}`, 150, 25);

            const tableData = payments.map(p => [
                p.id,
                p.order,
                `INR ${Number(p.amount).toLocaleString()}`,
                p.mode,
                p.date,
                p.status
            ]);

            doc.autoTable({
                startY: 60,
                head: [['Ref ID', 'Order Node', 'Amount', 'Method', 'Date', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [182, 45, 45], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 5 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 30 },
                    2: { halign: 'right', fontStyle: 'bold', textColor: [39, 174, 96] },
                    5: { halign: 'center' }
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

            doc.save(`CareCart_Billing_Audit_${Date.now()}.pdf`);
        } catch (err) {
            console.error("Billing Export failed:", err);
            alert("Digital Export Error: Check system logs.");
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                    <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Payments</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '22px', fontWeight: '700' }}>Unified billing and money transfer logs for the <span style={{ color: 'var(--vibrant-gold)', background: 'var(--velvet-dark)', padding: '2px 10px', borderRadius: '5px' }}>CareCart</span> Hub.</p>
                </div>
                <button 
                  onClick={downloadBillsPDF}
                  className="btn btn-gold" 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <Download size={24} /> DOWNLOAD BILLS
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '4px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--velvet-dark)', borderBottom: '4px solid var(--vibrant-gold)' }}>
                        <tr style={{ textAlign: 'left', color: 'white', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            <th style={{ padding: '30px' }}>Payment Reference</th>
                            <th>Order Link</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Transfer Date</th>
                            <th style={{ paddingRight: '30px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id} style={{ borderBottom: '2px solid #f8fafc' }}>
                                <td style={{ padding: '30px', fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '17px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <DollarSign size={20} color="var(--vibrant-gold)" /> {p.id}
                                    </div>
                                </td>
                                <td style={{ fontWeight: '800', color: '#64748b' }}>{p.order}</td>
                                <td style={{ fontWeight: '900', fontSize: '22px' }}>₹{Number(p.amount).toLocaleString()}</td>
                                <td>
                                    <span style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', border: '2px solid #eee' }}>
                                        {p.mode}
                                    </span>
                                </td>
                                <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{p.date}</td>
                                <td style={{ paddingRight: '30px' }}>
                                    {p.status === 'SETTLED' || p.status === 'SUCCESS' ? (
                                        <span className="badge-vibrant badge-success">{p.status === 'SUCCESS' ? 'SUCCESS' : 'SETTLED'}</span>
                                    ) : (
                                        <span className="badge-vibrant badge-warning">PROCESSING</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Payments;
