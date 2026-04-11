import React, { useState, useEffect } from 'react';
import { Mail, User, Clock, MessageSquare, CheckCircle, AlertCircle, Trash2, Filter, FileDown, FileText, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await fetch('/api/inquiries');
            const data = await response.json();
            setInquiries(data);
        } catch (error) {
            console.error("Failed to fetch inquiries");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`/api/inquiries?id=${id}&status=${newStatus}`, {
                method: 'PUT'
            });
            const result = await response.json();
            if (result.success) {
                fetchInquiries();
            }
        } catch (error) {
            console.error("Failed to update status");
        }
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "N/A";
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "DATE PENDING";
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Institutional Header
            doc.setFillColor(15, 23, 42); 
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("CARE CART ADVISORY", 15, 20);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Network Partnership & System Inquiry Report", 15, 28);
            doc.text(`Generated: ${timestamp} | Mode: GLOBAL HUB`, 15, 33);

            const tableData = filteredInquiries.map(inq => [
                inq.fullName,
                inq.email,
                inq.status,
                formatDate(inq.createdAt),
                inq.message
            ]);

            doc.autoTable({
                startY: 50,
                head: [['Client Name', 'Channel @ Email', 'Pipeline Status', 'Timestamp', 'Message Payload']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [182, 45, 45], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 4 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 35 },
                    2: { halign: 'center' },
                    4: { cellWidth: 60 }
                }
            });

            doc.save(`CareCart_Inquiries_Audit_${Date.now()}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("Digital Export Error: Check system logs.");
        }
    };

    const exportToExcel = () => {
        if (!filteredInquiries || filteredInquiries.length === 0) return;
        
        const timestamp = new Date().toLocaleString();
        const reportData = [
            ["CARE CART LOGISTICS HUB - ADVISORY AUDIT REPORT"],
            [`Report Generation Date: ${timestamp}`],
            [`TOTAL ACTIVE THREADS: ${filteredInquiries.length}`],
            [""], 
            ["CLIENT NAME", "EMAIL CHANNEL", "STATUS", "SUBMISSION DATE", "MESSAGE CONTENT"]
        ];

        filteredInquiries.forEach(inq => {
            reportData.push([
                inq.fullName,
                inq.email,
                inq.status,
                formatDate(inq.createdAt),
                inq.message
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(reportData);
        worksheet['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 60 }];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Advisory Audit");
        XLSX.writeFile(workbook, `CareCart_Advisory_Audit_${Date.now()}.xlsx`);
    };

    const filteredInquiries = inquiries.filter(inq => filter === 'ALL' || inq.status === filter);

    const getStatusStyles = (status) => {
        switch(status) {
            case 'NEW': return { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe', label: 'NEW REQUEST' };
            case 'REVIEWING': return { bg: '#fffbeb', text: '#92400e', border: '#fef3c7', label: 'UNDER REVIEW' };
            case 'RESOLVED': return { bg: '#ecfdf5', text: '#166534', border: '#dcfce7', label: 'COMPLETED' };
            default: return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9', label: status };
        }
    };

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>Advisory Hub</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Process incoming <span style={{ color: 'var(--velvet-brick)' }}>partnership nodes</span> and network inquiries.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={exportToPDF} className="btn-icon" style={{ padding: '0 25px', gap: '8px', width: 'auto', borderRadius: '15px', background: 'white', border: '2px solid #f1f5f9', color: 'var(--velvet-brick)' }}>
                        <FileText size={18} /> <span style={{ fontWeight: '900', fontSize: '11px' }}>PDF EXPORT</span>
                    </button>
                    <button onClick={exportToExcel} className="btn-icon" style={{ padding: '0 25px', gap: '8px', width: 'auto', borderRadius: '15px', background: 'white', border: '2px solid #f1f5f9', color: '#10b981' }}>
                        <FileDown size={18} /> <span style={{ fontWeight: '900', fontSize: '11px' }}>XLS RECAP</span>
                    </button>
                </div>
            </div>

            <div className="filter-hub">
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(192, 57, 43, 0.05)', padding: '12px', borderRadius: '12px' }}>
                        <Filter size={20} color="var(--velvet-brick)" />
                    </div>
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="form-input"
                        style={{ marginBottom: 0, width: '250px', borderRadius: '15px', fontWeight: '800', background: 'white' }}
                    >
                        <option value="ALL">ALL PIPELINE NODES</option>
                        <option value="NEW">NEW ENTRIES</option>
                        <option value="REVIEWING">UNDER REVIEW</option>
                        <option value="RESOLVED">COMPLETED</option>
                    </select>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px' }}>{filteredInquiries.length} ACTIVE THREADS</span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '900' }}>SYNCING PIPELINE DATA...</div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {filteredInquiries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '30px', border: '2px dashed #e2e8f0', color: '#94a3b8', fontWeight: '800' }}>
                            NO ACTIVE INQUIRIES IN THIS STAGE
                        </div>
                    ) : (
                        filteredInquiries.map((inq) => {
                            const styles = getStatusStyles(inq.status);
                            return (
                                <div key={inq.id} style={{ 
                                    background: 'white', 
                                    border: '1px solid #f1f5f9', 
                                    borderRadius: '25px', 
                                    padding: '30px',
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(220px, 1fr) 2fr 200px',
                                    gap: '30px',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s'
                                }} className="hover-card">
                                    
                                    <style>{`
                                        .hover-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); border-color: #b62d2d30; }
                                    `}</style>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px', color: '#b62d2d' }}><User size={22} /></div>
                                            <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '18px' }}>{inq.fullName}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>
                                            <Mail size={16} /> {inq.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            <Clock size={14} /> {formatDate(inq.createdAt)}
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', gap: '10px', color: '#475569', fontWeight: '800', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px' }}>
                                            <MessageSquare size={16} /> ADVISORY MESSAGE
                                        </div>
                                        <div style={{ color: '#1e293b', fontWeight: '500', lineHeight: '1.7', fontSize: '15px' }}>{inq.message}</div>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ 
                                            display: 'inline-flex', padding: '8px 20px', borderRadius: '30px', fontSize: '11px', fontWeight: '900', 
                                            justifyContent: 'center', alignSelf: 'flex-end',
                                            background: styles.bg,
                                            color: styles.text,
                                            border: `1px solid ${styles.border}`
                                        }}>
                                            {styles.label}
                                        </div>
                                        
                                        {inq.status === 'NEW' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(inq.id, 'REVIEWING')}
                                                style={{ background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s' }}
                                            >
                                                <AlertCircle size={18} /> START REVIEW
                                            </button>
                                        )}

                                        {inq.status === 'REVIEWING' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(inq.id, 'RESOLVED')}
                                                style={{ background: '#166534', color: 'white', border: 'none', padding: '14px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.3s' }}
                                            >
                                                <CheckCircle size={18} /> MARK COMPLETED
                                            </button>
                                        )}

                                        {inq.status === 'RESOLVED' && (
                                            <div style={{ 
                                                padding: '14px', 
                                                borderRadius: '15px', 
                                                fontWeight: '900', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '10px',
                                                color: '#166534',
                                                background: '#f0fdf4',
                                                border: '1px solid #dcfce7'
                                            }}>
                                                <ShieldCheck size={18} /> ARCHIVED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminInquiries;
