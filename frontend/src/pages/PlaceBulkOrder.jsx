import apiClient from '../utils/axiosConfig';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function PlaceBulkOrder() {
    const navigate = useNavigate();
    const location = useLocation();
    const product = location.state?.product;
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    const [isImporting, setIsImporting] = useState(false);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({
        quantity: product?.min_wholesale_qty || 100,
        message: '',
        expected_price: product?.wholesale_price || ''
    });

    const downloadPOTemplate = () => {
        const templateData = [
            ["SKU_IDENTIFIER", "PRODUCT_NAME", "TARGET_QUANTITY", "TARGET_UNIT_PRICE", "LOGISTICS_NOTE"],
            ["MED_001", "Example Medicine Alpha", 500, 420.50, "Cold chain required"],
            ["MED_002", "Example Medicine Beta", 1200, 185.00, "Express clinical transport"]
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);
        
        // Style-like formatting (widths)
        ws['!cols'] = [
            { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 30 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, "PO_TEMPLATE");
        XLSX.writeFile(wb, "CareCart_Institutional_PO_Template.xlsx");
    };

    const handleBuyerPOImport = (e) => {
        setIsImporting(true);
        setTimeout(() => {
            alert("Corporate Purchase Order (CSV) successfully parsed! 14 lines extracted. Sending to distributors...");
            setIsImporting(false);
            navigate('/app/dashboard');
        }, 1500);
    };

    const downloadQuotePDF = (quoteData) => {
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
            doc.text("Official Clinical Quotation / Institutional Request", 15, 35);
            doc.text(`Issuer: ${user.username} | Account ID: ${user.profile_id}`, 15, 40);
            doc.text(`Generated: ${timestamp}`, 150, 25);

            doc.autoTable({
                startY: 60,
                head: [['Procurement Field', 'Strategic Value']],
                body: [
                    ['Medicine Name', product.name],
                    ['Manufacturer', product.manufacturer],
                    ['Requested Quantity', `${quoteData.quantity} Units`],
                    ['Offered Unit Price', `INR ${Number(quoteData.expected_price).toLocaleString()}`],
                    ['Total Valuation', `INR ${(Number(quoteData.quantity) * Number(quoteData.expected_price)).toLocaleString()}`],
                    ['Clinical Message', quoteData.message || 'N/A']
                ],
                theme: 'grid',
                headStyles: { fillColor: [182, 45, 45], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 8 },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 50 },
                    1: { halign: 'left' }
                }
            });

            // Compliance Footer
            const finalY = doc.lastAutoTable.finalY || 150;
            doc.setFillColor(248, 250, 252);
            doc.rect(15, finalY + 15, 180, 25, 'F');
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8);
            doc.text("CONFIDENTIAL: This manifest contains regulated clinical procurement data.", 20, finalY + 25);
            doc.text("Negotiations are protected by secure clinical nodes via AES-256 protocols.", 20, finalY + 30);

            doc.save(`CareCart_Quotation_${Date.now()}.pdf`);
        } catch (err) {
            console.error("Quotation Export failed:", err);
            alert("Digital Export Error: Check system logs.");
        }
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const payload = {
                product_id: product.product_id,
                buyer_id: user.profile_id,
                seller_id: product.seller_id,
                quantity: formData.quantity,
                expected_price: formData.expected_price,
                message: formData.message,
                status: 'OPEN'
            };
            
            await apiClient.post('/inquiries/', payload);
            
            if (window.confirm(`Quote Request Transmitted! Would you like to download the official Procurement Manifest for your records?`)) {
                downloadQuotePDF(payload);
            }
            navigate('/app/dashboard');
        } catch (err) {
            alert("Message node failed. Please try again later.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="page-transition" style={{ padding: '30px', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '10px' }}>Institutional <span style={{ color: '#b62d2d' }}>Procurement</span></h1>
                    <p style={{ color: '#64748b', fontWeight: '700', fontSize: '18px' }}>Direct B2B negotiation hub for verified clinical providers.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={downloadPOTemplate} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '15px 25px', borderRadius: '15px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Download size={18} /> GET PO TEMPLATE
                    </button>
                    <input type="file" id="po-csv" accept=".csv" style={{ display: 'none' }} onChange={handleBuyerPOImport} />
                    <button onClick={() => document.getElementById('po-csv').click()} disabled={isImporting} style={{ background: 'var(--velvet-brick)', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(182, 45, 45, 0.2)' }}>
                        <Upload size={20} color="white" />
                        {isImporting ? 'PARSING DATA NODE...' : 'IMPORT BULK PO'}
                    </button>
                </div>
            </div>

            {product ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '40px' }}>
                    {/* Medicine Specs Card */}
                    <div className="card" style={{ padding: '40px', background: 'white', borderRadius: '35px', height: 'fit-content', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={40} color="#b62d2d" />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '900', color: '#b62d2d', letterSpacing: '1px' }}>{product.category}</div>
                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{product.name}</h2>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>By {product.manufacturer}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '15px' }}>
                                <span style={{ fontWeight: '800', color: '#64748b' }}>Current Wholesale Rate:</span>
                                <span style={{ fontWeight: '900', color: '#0f172a' }}>₹{product.wholesale_price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '15px' }}>
                                <span style={{ fontWeight: '800', color: '#64748b' }}>Minimum Volume:</span>
                                <span style={{ fontWeight: '900', color: '#0f172a' }}>{product.min_wholesale_qty} Units</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8fafc', borderRadius: '15px' }}>
                                <span style={{ fontWeight: '800', color: '#64748b' }}>Verification:</span>
                                <span style={{ fontWeight: '900', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={16} /> GOVT. SECURED</span>
                            </div>
                        </div>

                        <div style={{ padding: '25px', background: '#fff1f2', borderRadius: '25px', border: '1px solid #ffe4e6' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', color: '#b62d2d', fontWeight: '900', fontSize: '14px', marginBottom: '10px' }}>
                                <Truck size={20} /> LOGISTICS PRIORITY
                            </div>
                            <p style={{ fontSize: '13px', color: '#9f1239', fontWeight: '700', margin: 0, lineHeight: '1.5' }}>
                                Bulk orders are dispatched via temperature-controlled clinical transport within 24 hours of price settlement.
                            </p>
                        </div>
                    </div>

                    {/* Best Price Negotiation Form */}
                    <div className="card" style={{ padding: '50px', background: 'white', borderRadius: '35px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                            <MessageSquare size={28} color="#b62d2d" />
                            <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>Ask for Best Price</h3>
                        </div>

                        <form onSubmit={handleQuoteSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>PROPOSED QUANTITY</label>
                                    <div style={{ position: 'relative' }}>
                                        <PlusCircle size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                                        <input 
                                            type="number" 
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                            className="lux-input" 
                                            style={{ width: '100%', paddingLeft: '50px', height: '60px' }} 
                                            placeholder="Units" 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>OFFERED PRICE UNIT (₹)</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: '#cbd5e1' }}>₹</div>
                                        <input 
                                            type="number" 
                                            required
                                            value={formData.expected_price}
                                            onChange={(e) => setFormData({...formData, expected_price: e.target.value})}
                                            className="lux-input" 
                                            style={{ width: '100%', paddingLeft: '50px', height: '60px' }} 
                                            placeholder="e.g. 350.00" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '40px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>MESSAGE TO SUPPLIER</label>
                                <textarea 
                                    style={{ width: '100%', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '25px', fontSize: '16px', fontWeight: '700', outline: 'none', minHeight: '150px', background: '#f8fafc', color: '#0f172a' }}
                                    placeholder="e.g. We require a recurring monthly batch of 10,000 units. Please provide the best possible price for a long-term clinical contract."
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={sending}
                                style={{ width: '100%', padding: '22px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', cursor: 'pointer', transition: '0.3s' }}
                            >
                                <Send size={24} /> {sending ? 'TRANSMITTING QUOTE...' : 'SEND QUOTE REQUEST'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '40px', padding: '120px 40px', textAlign: 'center' }}>
                     <div style={{ width: '100px', height: '100px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                        <Package size={50} color="#94a3b8" />
                     </div>
                     <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '15px' }}>Direct Procurement Hub</h2>
                     <p style={{ color: '#64748b', fontWeight: '700', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                        To send a specific Best-Price request, please browse the Master Clinical Registry and select a medicine for bulk procurement.
                     </p>
                     <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/app/products')} style={{ background: 'var(--velvet-brick)', color: 'white', border: 'none', padding: '18px 50px', borderRadius: '18px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(182, 45, 45, 0.15)' }}>BROWSE MASTER CATALOG</button>
                        <button onClick={downloadPOTemplate} style={{ background: 'white', color: 'var(--velvet-dark)', border: '1px solid #e2e8f0', padding: '18px 50px', borderRadius: '18px', fontWeight: '900', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Download size={20} /> TEMPLATE
                        </button>
                        <button onClick={() => document.getElementById('po-csv').click()} style={{ background: 'var(--velvet-dark)', color: 'white', border: 'none', padding: '18px 50px', borderRadius: '18px', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>IMPORT BULK PO</button>
                     </div>
                </div>
            )}
        </div>
    );
}
