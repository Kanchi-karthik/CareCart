import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Clipboard, Package, Plus, Upload, Search, Table, Grid, ShoppingCart, Trash2, Edit3, 
  ShieldCheck, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle, Heart,
  FileText, Smartphone, Printer, X, Info, Pill, DollarSign, Activity, FilePlus, Home, ArrowLeft, Download, ShoppingBag, Truck, FileDown, FileSpreadsheet, FileBarChart
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import apiClient from '../utils/axiosConfig';
import Logo from '../components/Logo';
import { useCart } from '../context/CartContext';

const Products = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { cart, wishlist, addToCart, toggleWishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState(routeLocation.state?.category || 'All');
  const [searchQuery, setSearchQuery] = useState(routeLocation.state?.initialSearch || "");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [restockList, setRestockList] = useState([]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
        const scrollAmount = sliderRef.current.clientWidth * 0.8;
        sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const rawUser = sessionStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { role: 'BUYER', username: 'Guest' };
  const inDashboard = routeLocation.pathname.startsWith('/app/');

  const fetchDependencies = async () => {
    try {
      setLoading(true);
      const url = user.role === 'SELLER' ? `/products/?seller_id=${user.profile_id}` : '/products/';
      const res = await apiClient.get(url);
      let fetchedProducts = res.data || [];
      setTopRated(fetchedProducts.slice(0, 10));
      setProducts(fetchedProducts);
      const uniqueCats = ['All', ...new Set(fetchedProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, [user.role, user.profile_id]);

  useEffect(() => {
     let result = [...products];
     if (activeCategory !== 'All') {
         result = result.filter(p => p.category === activeCategory);
     }
     if (searchQuery) {
         const lower = searchQuery.toLowerCase();
         result = result.filter(p => 
            p.name.toLowerCase().includes(lower) || 
            (p.manufacturer || '').toLowerCase().includes(lower) || 
            (p.category || '').toLowerCase().includes(lower)
         );
     }
     setFilteredProducts(result);
  }, [activeCategory, searchQuery, products]);

  const handleUpdateStock = async (id, field, value) => {
    try {
        const prod = products.find(p => p.product_id === id);
        const updated = { ...prod, [field]: value, requester_seller_id: user.profile_id };
        await apiClient.put('/products/', updated);
        fetchDependencies();
    } catch (err) { alert("Failed to update stock."); }
  };

  const exportStockExcel = () => {
    if (!products || products.length === 0) return;
    
    const timestamp = new Date().toLocaleString();
    const worksheetData = [
      ["CARE CART LOGISTICS HUB - CLINICAL STOCK REPORT"],
      [`Authorized Distributor: ${user.username || "Authorized User"}`],
      [`Report Timestamp: ${timestamp}`],
      [""],
      ['PRODUCT ID', 'MEDICINE NAME', 'MANUFACTURER', 'CATEGORY', 'QUANTITY', 'RETAIL MIN', 'WHOLESALE BATCH', 'INSTITUTIONAL RATE', 'RETAIL RATE']
    ];

    products.forEach(p => {
      worksheetData.push([
        p.product_id,
        p.name,
        p.manufacturer,
        p.category,
        p.quantity || 0,
        p.min_order_qty || 0,
        p.min_wholesale_qty || 0,
        Number(p.selling_price || 0),
        Number(p.retail_price || 0)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = [ { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 } ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clinical Stock");
    XLSX.writeFile(workbook, `CareCart_Stock_Report_${user.username}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportStockPDF = () => {
    if (!products || products.length === 0) return;
    
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Company Header
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CARE CART HUB", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Clinical Inventory & Logistical Manifest", 15, 28);
    doc.text(`Distributor: ${user.username} | Region: GLOBAL`, 15, 33);

    // Report Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text("Pharmaceutical Inventory Report", 15, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${timestamp}`, 150, 55);

    const bodyData = products.map(p => [
      p.product_id,
      p.name,
      p.category,
      p.quantity,
      `INR ${p.selling_price || 0}`
    ]);

    doc.autoTable({
      startY: 65,
      head: [['ID', 'Medicine', 'Category', 'Stock Units', 'Inst. Rate']],
      body: bodyData,
      theme: 'grid',
      headStyles: { 
        fillColor: [182, 45, 45], // B62D2D red
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 5,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        1: { fontStyle: 'bold', cellWidth: 70 },
        3: { halign: 'center' },
        4: { halign: 'right' }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an authorized clinical report generated sequestered from the CareCart Logistics Vault.", 15, finalY + 20);
    doc.text("Confidential & Regulatory Compliant.", 15, finalY + 25);

    doc.save(`CareCart_Inventory_${user.username}.pdf`);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Permanently decommission this medicine node from the master registry?")) {
        try {
            await apiClient.delete(`/products/?id=${id}&seller_id=${user.profile_id}`);
            fetchDependencies();
        } catch (err) { alert("Failed: Could not remove the medicine."); }
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (user.username === 'Guest') {
        navigate('/login?role=BUYER', { state: { redirectTo: '/app/products' } });
        return;
    }
    addToCart(product, 1);
  };

const ProductImage = ({ src, alt, h = '100%' }) => {
  const [imgError, setImgError] = useState(false);
  const isDefault = !src || src === 'default_medicine.png' || src.includes('unsplash') || src === '' || src.startsWith('file://') || imgError;
  
  if (isDefault) {
    return (
      <div style={{ width: '100%', height: h, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
        <Logo size={h === '100%' ? 60 : 40} type="icon" />
        <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', letterSpacing: '2px' }}>CLINICAL GRADE</div>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setImgError(true)} style={{ width: '100%', height: h, objectFit: 'contain', background: 'white' }} />;
};

const ProductCard = ({ product, isCompact = false, user, wishlist, toggleWishlist, navigate, handleAddToCart, handleUpdateStock, handleDeleteProduct }) => {
  const isSeller = user.role === 'SELLER';
  const isAdmin = user.role === 'ADMIN';
  const isLowStock = product.quantity < 20;
  const isLiked = (wishlist || []).some(p => p.product_id === product.product_id);

  return (
      <div 
          onClick={() => navigate(`/app/products/${product.product_id}`)} 
          className="card-clinical-unified hover-up" 
          style={{ 
              padding: '0', border: '1px solid #f1f5f9', borderRadius: '35px', 
              background: 'white', overflow: 'hidden', display: 'flex', flexDirection: 'column', 
              height: '100%', cursor: 'pointer', transition: '0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
          }}
      >
        <div style={{ width: '100%', height: isCompact ? '180px' : '240px', background: '#f8fafc', position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
           <ProductImage src={product.image_url && product.image_url.startsWith('data:') ? product.image_url : (product.image_url ? product.image_url.split(',')[0] : '')} alt={product.name} h={isCompact ? '180px' : '240px'} />
           
           {!isSeller && !isAdmin && (
             <button 
               onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
               style={{ 
                  position: 'absolute', top: '20px', right: '20px', background: isLiked ? '#b62d2d' : 'rgba(255,255,255,0.9)', 
                  color: isLiked ? 'white' : '#64748b', border: 'none', width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', zIndex: 10
               }}
             >
               <Heart size={20} fill={isLiked ? 'white' : 'none'} strokeWidth={isLiked ? 0 : 2.5} />
             </button>
           )}

           {isLowStock && <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#b62d2d', color: 'white', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>LOW STOCK</div>}
           {!isLowStock && <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#27ae60', color: 'white', padding: '6px 15px', borderRadius: '30px', fontSize: '10px', fontWeight: '900' }}>IN STOCK</div>}
        </div>

        <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#b62d2d', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>{product.category || 'PHARMA'}</div>
                    {isAdmin && (
                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Truck size={12} /> {product.seller_name || 'Direct Supply'}
                        </div>
                    )}
                </div>
                <h3 style={{ fontSize: isCompact ? '20px' : '24px', fontWeight: '900', marginBottom: '5px', color: '#0f172a', lineHeight: '1.2' }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: '700' }}>
                    <CheckCircle size={14} color="#10b981" /> Trusted Global Supply
                </div>
            </div>

            {isSeller && (
                <div style={{ marginTop: '15px', background: '#f8fafc', padding: '12px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', letterSpacing: '1px' }}>AVAILABLE STOCK</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{product.quantity || 0} Units</div>
                </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>RETAIL</span>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>₹{Number(product.retail_price).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', background: '#fef2f2', padding: '4px 8px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: '#b62d2d' }}>BULK</span>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#b62d2d' }}>₹{Number(product.wholesale_price).toLocaleString()}</div>
                  </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                  {isSeller ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                           <button onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/add-product`, { state: { product } });
                          }} className="btn-icon" style={{ background: '#f8fafc', width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Edit3 size={18} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.product_id); }} className="btn-icon" style={{ background: '#fef2f2', color: '#dc2626', width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #fecaca', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                  ) : (
                      <button 
                          onClick={(e) => handleAddToCart(e, product)} 
                          style={{ 
                              padding: '12px 25px', background: '#b62d2d', color: 'white', border: 'none', 
                              borderRadius: '15px', cursor: 'pointer', fontWeight: '900', fontSize: '12px',
                              boxShadow: '0 8px 15px rgba(182,45,45,0.2)'
                          }}
                      >
                          ADD TO BAG
                      </button>
                  )}
              </div>
            </div>
        </div>
      </div>
  );
};

const CategorySlider = ({ category, categoryProducts, user, wishlist, toggleWishlist, navigate, handleAddToCart, handleUpdateStock, handleDeleteProduct }) => {
  const catRef = useRef(null);
  const scrollCat = (dir) => {
      if (catRef.current) {
          const amt = catRef.current.clientWidth * 0.8;
          catRef.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' });
      }
  };

  return (
      <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '40px', height: '4px', background: '#b62d2d', borderRadius: '2px' }}></div>
                  <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', textTransform: 'capitalize', margin: 0 }}>{category}</h2>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                      <button onClick={() => scrollCat('left')} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }} className="hover-up">
                          <ChevronLeft size={18} color="#b62d2d" />
                      </button>
                      <button onClick={() => scrollCat('right')} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }} className="hover-up">
                          <ChevronRight size={18} color="#b62d2d" />
                      </button>
                  </div>
              </div>
          </div>
          <div ref={catRef} className="sliding-container hide-scrollbar" style={{ 
              display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '30px', scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth'
          }}>
              {categoryProducts.map(p => (
                  <div key={p.product_id} style={{ minWidth: 'clamp(280px, 80vw, 360px)', scrollSnapAlign: 'start' }}>
                      <ProductCard 
                        product={p} 
                        isCompact={true} 
                        user={user} 
                        wishlist={wishlist} 
                        toggleWishlist={toggleWishlist} 
                        navigate={navigate} 
                        handleAddToCart={handleAddToCart}
                        handleUpdateStock={handleUpdateStock}
                        handleDeleteProduct={handleDeleteProduct}
                      />
                  </div>
              ))}
          </div>
      </div>
  );
};

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="page-transition">
      <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
         .hover-up:hover { transform: translateY(-12px); box-shadow: 0 40px 80px rgba(0,0,0,0.1); border-color: #b62d2d; }
         .hide-scrollbar::-webkit-scrollbar { display: none; }
         .page-transition { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
         @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {!inDashboard && (
          <div style={{ background: 'white', borderBottom: '2px solid #f1f5f9', padding: '0 8%', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: '0', zIndex: 1000 }}>
              <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}><Logo size={42} /></div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span onClick={() => navigate('/home')} style={{ fontWeight: '900', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>GO TO HOME</span>
                  <button onClick={() => user.username === 'Guest' ? navigate('/login?role=BUYER') : navigate('/app/dashboard')} style={{ background: '#b62d2d', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer' }}>
                      {user.username === 'Guest' ? 'SIGN IN' : 'MY HOME'}
                  </button>
              </div>
          </div>
      )}

      <div style={{ padding: inDashboard ? '40px 4%' : '60px 8%', background: '#ffffff', maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
              <div>
                  <h1 style={{ fontSize: '56px', fontWeight: '900', color: '#0f172a', letterSpacing: '-3px', marginBottom: '10px' }}>Medicines List.</h1>
                  <p style={{ color: '#64748b', fontWeight: '700', fontSize: '18px' }}>Official medicine list for medical shops and clinics.</p>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                  {user.role === 'SELLER' && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={exportStockExcel} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '15px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileSpreadsheet size={20} color="#10b981" /> STOCK (XLS)
                        </button>
                        <button onClick={exportStockPDF} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '15px 25px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileBarChart size={20} color="#b62d2d" /> CLINICAL PDF
                        </button>
                        <button onClick={() => navigate('/app/add-product')} style={{ background: '#b62d2d', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>ADD NEW MEDICINE</button>
                    </div>
                  )}
                  <button onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                      {viewMode === 'grid' ? <Table size={20} color="#64748b" /> : <Grid size={20} color="#64748b" />}
                  </button>
              </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '20px 35px', borderRadius: '30px', border: '2px solid #e2e8f0', marginBottom: '45px', boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}>
                <Search size={24} color="#b62d2d" />
                <input 
                    placeholder="Search medicines, manufacturers, or salt names..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ border: 'none', background: 'transparent', width: '100%', paddingLeft: '20px', fontWeight: '800', fontSize: '18px', outline: 'none' }} 
                />
          </div>

          {!searchQuery && activeCategory === 'All' && topRated.length > 0 && (
              <div style={{ marginBottom: '65px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px', margin: 0 }}>Most Popular Medicines</h2>
                          <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => scrollSlider('left')} style={{ background: 'white', border: '2px solid #f1f5f9', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }} className="btn-nav">
                                  <ChevronLeft size={20} color="#b62d2d" />
                              </button>
                              <button onClick={() => scrollSlider('right')} style={{ background: 'white', border: '2px solid #f1f5f9', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s' }} className="btn-nav">
                                  <ChevronRight size={20} color="#b62d2d" />
                              </button>
                          </div>
                      </div>
                      <p onClick={() => setActiveCategory('All')} style={{ fontSize: '12px', fontWeight: '900', color: '#b62d2d', letterSpacing: '1px', cursor: 'pointer' }}>SEE ALL REGISTRY →</p>
                  </div>
                  <div ref={sliderRef} className="sliding-container hide-scrollbar" style={{ 
                      display: 'flex', 
                      gap: '25px', 
                      overflowX: 'auto', 
                      paddingBottom: '30px', 
                      scrollSnapType: 'x mandatory',
                      scrollBehavior: 'smooth'
                  }}>
                      {topRated.map(p => (
                          <div key={p.product_id} style={{ minWidth: 'clamp(280px, 100%, 380px)', scrollSnapAlign: 'start' }}>
                              <ProductCard 
                                product={p} 
                                isCompact={false} 
                                user={user} 
                                wishlist={wishlist} 
                                toggleWishlist={toggleWishlist} 
                                navigate={navigate} 
                                handleAddToCart={handleAddToCart}
                                handleUpdateStock={handleUpdateStock}
                                handleDeleteProduct={handleDeleteProduct}
                              />
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '25px', marginBottom: '45px' }} className="hide-scrollbar">
              {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '14px 28px', borderRadius: '50px', background: activeCategory === cat ? '#0f172a' : 'white', color: activeCategory === cat ? 'white' : '#64748b', fontWeight: '900', border: '1px solid #e2e8f0', whiteSpace: 'nowrap', transition: '0.3s', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px' }}>
                      {cat.toUpperCase()}
                  </button>
              ))}
          </div>

          {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', fontWeight: '900', color: '#b62d2d', letterSpacing: '2px' }}>OPENING STOCK LIST...</div>
          ) : (
              <div style={{ marginBottom: '60px' }}>
                  {searchQuery ? (
                    <>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '40px' }}>Searching for "{searchQuery}"</h2>
                        {filteredProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '40px' }}>
                                <Logo size={80} type="icon" />
                                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '20px' }}>No medicines found here.</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '45px' }}>
                                {filteredProducts.map(p => (
                                    <ProductCard 
                                        key={p.product_id} 
                                        product={p} 
                                        isCompact={true} 
                                        user={user} 
                                        wishlist={wishlist} 
                                        toggleWishlist={toggleWishlist} 
                                        navigate={navigate} 
                                        handleAddToCart={handleAddToCart}
                                        handleUpdateStock={handleUpdateStock}
                                        handleDeleteProduct={handleDeleteProduct}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
                        {categories.filter(c => c !== 'All').map(category => {
                            const categoryProducts = products.filter(p => p.category === category);
                            if (categoryProducts.length === 0) return null;
                            return (
                                <CategorySlider 
                                    key={category} 
                                    category={category} 
                                    categoryProducts={categoryProducts}
                                    user={user} 
                                    wishlist={wishlist} 
                                    toggleWishlist={toggleWishlist} 
                                    navigate={navigate} 
                                    handleAddToCart={handleAddToCart}
                                    handleUpdateStock={handleUpdateStock}
                                    handleDeleteProduct={handleDeleteProduct}
                                />
                            );
                        })}
                    </div>
                  )}
              </div>
          )}
      </div>

       {cart.length > 0 && user.role === 'BUYER' && (
         <button className="floating-cart" onClick={() => navigate('/app/cart')}>
            <ShoppingCart size={24} />
            <span>MY BAG ({cart.length})</span>
         </button>
       )}
    </div>
  );
};

export default Products;
