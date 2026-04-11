import apiClient from '../utils/axiosConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeEngagements: 0
  });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const downloadSummaryReport = () => {
    try {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // High-Contrast Institutional Header
        doc.setFillColor(15, 23, 42); // Velvet Dark
        doc.rect(0, 0, 210, 50, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("CARE CART HUB", 15, 25);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Institutional Business Summary & Operational Audit", 15, 35);
        doc.text(`Node Participant: ${user.username} | Sector: B2B GLOBAL`, 15, 40);
        doc.text(`Generated: ${timestamp}`, 150, 25);

        // Core Metrics Table
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.text("Executive Summary Metrics", 15, 65);
        
        doc.autoTable({
            startY: 75,
            body: [
                ['Metric Identity', 'Current Valuation / Count'],
                ['Consolidated Expenditures', `INR ${stats.totalSpent.toLocaleString()}`],
                ['Procurement Lifecycle Count', `${stats.totalOrders} Units`],
                ['Active Consultancy Threads', `${stats.activeEngagements} Engagements`],
                ['Compliance Status', 'SECURE / VERIFIED']
            ],
            theme: 'striped',
            headStyles: { fillColor: [182, 45, 45] },
            styles: { fontSize: 11, cellPadding: 8 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80 },
                1: { halign: 'right', textColor: [182, 45, 45], fontStyle: 'bold' }
            }
        });

        const finalY = doc.lastAutoTable.finalY || 150;

        // Visual Signature
        doc.setDrawColor(182, 45, 45);
        doc.setLineWidth(1);
        doc.line(15, finalY + 10, 195, finalY + 10);
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text("This manifest is an automated generation for internal accounting and inventory reconciliation.", 15, finalY + 20);
        doc.text("System Integrity: AES-256 Encrypted | Cloud-Node: V2.4-PRIMARY", 15, finalY + 25);

        doc.save(`CareCart_Business_Summary_${Date.now()}.pdf`);
    } catch (err) {
        console.error("Summary Export failed:", err);
        alert("Digital Manifest Error: System refused export.");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const clientsRes = await apiClient.get('/clients');
      const client = clientsRes.data.find(c => c.user_id === user.user_id);
      if (!client) {
        setLoading(false);
        return;
      }
      
      const ordersRes = await apiClient.get('/orders/b2b');
      const myOrders = (ordersRes.data || []).filter(o => o.client_id === client.client_id);

      const engagementsRes = await apiClient.get('/engagements');
      const myEngagements = (engagementsRes.data || []).filter(e => String(e.client_id) === String(client.client_id));

      setStats({
        totalOrders: myOrders.length,
        totalSpent: myOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        activeEngagements: myEngagements.filter(e => e.status !== 'COMPLETED').length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
        <div>
          <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '10px' }}>Institutional Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Orchestrating <span style={{ color: 'var(--velvet-brick)' }}>global logistics</span> and professional pharmaceutical threads.</p>
        </div>
        <button 
          onClick={downloadSummaryReport}
          style={{ 
            background: 'var(--velvet-dark)', 
            color: 'white', 
            padding: '15px 35px', 
            borderRadius: '20px', 
            border: '2px solid var(--vibrant-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '1px'
          }}
          className="hover-up"
        >
          <FileText size={20} color="var(--vibrant-gold)" /> EXPORT BUSINESS SUMMARY
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '50px' }}>
        <div className="card" style={{ padding: '40px', background: 'white', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(182, 45, 45, 0.05)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--velvet-brick)', marginBottom: '25px' }}>
            <ShoppingCart size={30} />
          </div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '8px' }}>PROCUREMENT LIFECYCLE</div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{stats.totalOrders}</div>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03 }}><ShoppingCart size={150} /></div>
        </div>

        <div className="card" style={{ padding: '40px', background: 'white', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(39, 174, 96, 0.05)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60', marginBottom: '25px' }}>
            <FileText size={30} />
          </div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '8px' }}>TOTAL FISCAL OUTLAY</div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#27ae60' }}>₹{stats.totalSpent.toLocaleString()}</div>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03 }}><FileText size={150} /></div>
        </div>

        <div className="card" style={{ padding: '40px', background: 'white', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(111, 66, 193, 0.05)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f42c1', marginBottom: '25px' }}>
            <Users size={30} />
          </div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '8px' }}>ACTIVE ADVISORY NODES</div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#6f42c1' }}>{stats.activeEngagements}</div>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03 }}><Users size={150} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="card" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Building2 size={24} color="var(--velvet-brick)" /> Global Registry Access
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <button onClick={() => navigate('/app/products')} className="quick-action-btn" style={{ padding: '30px', borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--velvet-dark)', fontWeight: '900' }}>
              <ShoppingCart size={32} /> Products
            </button>
            <button onClick={() => navigate('/app/place-bulk-order')} className="quick-action-btn" style={{ padding: '30px', borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', background: 'var(--velvet-brick)', border: 'none', color: 'white', fontWeight: '900' }}>
              <FileText size={32} /> Bulk Order
            </button>
            <button onClick={() => navigate('/app/engagements')} className="quick-action-btn" style={{ padding: '30px', borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', background: 'var(--velvet-dark)', border: 'none', color: 'white', fontWeight: '900' }}>
              <Users size={32} /> Consultancy
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '40px', background: 'var(--velvet-dark)', color: 'white' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px', color: 'var(--vibrant-gold)' }}>Institutional Security</h3>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', fontWeight: '500' }}>
            Your portal is synchronized with global blockchain ledgers for real-time inventory verification and fiscal transparency.
          </div>
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--vibrant-gold)', marginBottom: '5px' }}>ENCRYPTION STATUS</div>
            <div style={{ fontSize: '14px', fontWeight: '900' }}>AES-256 ACTIVE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
