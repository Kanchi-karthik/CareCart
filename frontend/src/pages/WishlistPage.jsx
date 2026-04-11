import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Pill, ShieldCheck, ChevronRight, Download, FileSpreadsheet, FileBarChart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function WishlistPage() {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist, addToCart } = useCart();

    const user = JSON.parse(sessionStorage.getItem('user') || '{"username": "Healthcare Professional"}');

    const exportWishlistExcel = () => {
        if (!wishlist || wishlist.length === 0) return;
        
        const timestamp = new Date().toLocaleString();
        const reportData = [
            ["CARE CART LOGISTICS HUB - CLINICAL REGISTRY REPORT"],
            [`Personal Favorites Registry for: ${user.full_name || user.username || "Authorized User"}`],
            [`Report Generation Date: ${timestamp}`],
            [`TOTAL REGISTRY ITEMS: ${wishlist.length}`],
            [""], 
            ["PRODUCT NAME", "MANUFACTURER", "CATEGORY", "CURRENCY", "MARKET RATE", "CLINICAL GRADE"]
        ];

        wishlist.forEach(p => {
            reportData.push([
                p.name,
                p.manufacturer,
                p.category,
                "INR (₹)",
                Number(p.selling_price || p.wholesale_price || 0),
                "VERIFIED"
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(reportData);
        worksheet['!cols'] = [{ wch: 35 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 18 }];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clinical Registry");
        XLSX.writeFile(workbook, `CareCart_Registry_${user.username}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportWishlistPDF = () => {
        if (!wishlist || wishlist.length === 0) return;
        
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Institutional Header
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 45, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("CARE CART LOGISTICS", 15, 22);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Personal Clinical Registry & Favorites Manifest", 15, 30);
        doc.text(`Practitioner: ${user.username} | Account Status: VERIFIED`, 15, 35);
        doc.text(`Generated: ${timestamp}`, 150, 22);

        doc.autoTable({
            startY: 55,
            head: [['Medicine Name', 'Manufacturer', 'Category', 'Clinical Grade', 'Est. Price']],
            body: wishlist.map(p => [p.name, p.manufacturer, p.category, 'VERIFIED', `INR ${p.selling_price || 0}`]),
            theme: 'grid',
            headStyles: { fillColor: [182, 45, 45], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                4: { halign: 'right' }
            }
        });

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This registry is for clinical reference only. Prices and availability are subject to market volatility.", 15, doc.lastAutoTable.finalY + 15);

        doc.save(`CareCart_Wishlist_${user.username}.pdf`);
    };

    const handleMoveToBag = (product) => {
        addToCart(product, 1);
        alert(`${product.name} moved to your Shopping Bag.`);
    };

    if (wishlist.length === 0) {
        return (
            <div className="page-transition" style={{ padding: '100px 8%', textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '80px', borderRadius: '50px', border: '2px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.03)' }}>
                    <div style={{ position: 'relative' }}>
                        <Heart size={100} color="#fee2e2" fill="#fee2e2" />
                    </div>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a' }}>My Liked Medicines</h2>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600', maxWidth: '450px' }}>Save items you want to buy later in this personal clinical registry.</p>
                    <button onClick={() => navigate('/app/products')} style={{ padding: '18px 40px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        DISCOVER NEW MEDICINES
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-transition" style={{ padding: '60px 5%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2.5px' }}>My Healthcare Favorites.</h1>
                    <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '600' }}>Review the products you've liked from our global medical catalogue.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={exportWishlistExcel} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '15px 25px', borderRadius: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <FileSpreadsheet size={20} color="#10b981" /> REGISTRY (XLS)
                    </button>
                    <button onClick={exportWishlistPDF} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '15px 25px', borderRadius: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <FileBarChart size={20} color="#b62d2d" /> OFFICIAL PDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                {wishlist.map((p) => (
                    <div key={p.product_id} style={{ background: 'white', borderRadius: '35px', padding: '30px', border: '2px solid #f1f5f9', transition: '0.3s' }} className="fav-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '20px' }}>
                                <Pill size={40} color="#b62d2d" />
                            </div>
                            <button onClick={() => toggleWishlist(p)} style={{ background: 'none', border: 'none', color: '#b62d2d', cursor: 'pointer' }}>
                                <Trash2 size={24} />
                            </button>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#b62d2d', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{p.category}</div>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>{p.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700', marginBottom: '25px' }}>
                                <ShieldCheck size={16} color="#10b981" /> {p.manufacturer}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>₹{(p.selling_price || p.wholesale_price || 0).toLocaleString()}</div>
                            <button onClick={() => handleMoveToBag(p)} style={{ background: '#0f172a', color: 'white', padding: '15px 25px', borderRadius: '15px', border: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <ShoppingBag size={20} /> ADD TO BAG
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .fav-card:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(15, 23, 42, 0.05); border-color: #b62d2d; }
            `}</style>
        </div>
    );
}
