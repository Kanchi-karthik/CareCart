import { useState, useEffect, useMemo } from 'react';
import apiClient from '../utils/axiosConfig';
import { Search, Calendar, Shield, Clock, ArrowRight, X } from 'lucide-react';

const Consultancies = () => {
  const [consultancies, setConsultancies] = useState([]);
  const [clients, setClients] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedWindow, setSelectedWindow] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [formData, setFormData] = useState({
    client_id: '',
    customer_id: '',
    retailer_id: '',
    consultant_id: '',
    slot_id: '',
    title: '',
    service_type: '',
    start_time: '',
    end_time: '',
    fee: '',
    status: 'SCHEDULED',
    description: ''
  });

  const [availableServices, setAvailableServices] = useState([]);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchConsultancies(),
        fetchClients(),
        fetchConsultants()
      ]);
      setLoading(false);
    };
    fetchAllData();

    if (user.role === 'CLIENT') setFormData(prev => ({ ...prev, client_id: user.profile_id }));
    else if (user.role === 'CUSTOMER') setFormData(prev => ({ ...prev, customer_id: user.profile_id }));
    else if (user.role === 'RETAILER') setFormData(prev => ({ ...prev, retailer_id: user.profile_id }));
  }, [user.role, user.profile_id]);

  const fetchConsultancies = async () => {
    try {
      const response = await apiClient.get('/engagements');
      setConsultancies(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/clients');
      setClients(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchConsultants = async () => {
    try {
      const response = await apiClient.get('/consultants');
      setConsultants(response.data);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async (consultantId) => {
    try {
      const res = await apiClient.get(`/consultant-slots?consultant_id=${consultantId}`);
      const sorted = (res.data || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setAvailableSlots(sorted);
      setSelectedWindow(null);
      setSelectedDay(null);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'consultant_id' && value) {
      const selected = consultants.find(c => String(c.consultant_id).trim() === String(value).trim());
      if (selected) {
        try {
          const res = await apiClient.get(`/consultants?action=services&consultant_id=${value.trim()}`);
          setAvailableServices(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          setAvailableServices([]);
        }
        fetchSlots(value.trim());
      } else {
        setAvailableSlots([]);
        setAvailableServices([]);
      }
    }

    if (name === 'service_type') {
      const service = availableServices.find(s => s.service_name === value);
      if (service) {
        setFormData(prev => ({ ...prev, title: value, fee: service.fee, description: service.description || prev.description }));
      }
    }
  };

  const selectSlotFragment = (parentSlot, start, end) => {
    if (!parentSlot) return;

    const pad = (n) => n.toString().padStart(2, '0');
    const format = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setFormData(prev => ({
      ...prev,
      slot_id: parentSlot.slot_id,
      start_time: format(start),
      end_time: format(end)
    }));
  };

  const handleFinalBooking = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        role: user.role,
        client_id: user.role === 'CLIENT' ? user.profile_id : formData.client_id,
        customer_id: user.role === 'CUSTOMER' ? user.profile_id : formData.customer_id,
        retailer_id: user.role === 'RETAILER' ? user.profile_id : formData.retailer_id
      };

      await apiClient.post('/payments', {
        order_id: `CONS_${Date.now()}`,
        amount: formData.fee,
        mode: 'VIRTUAL_WALLET',
        status: 'SUCCESS',
        description: `Micro-Consultancy: ${formData.title}`
      });

      await apiClient.post('/engagements', payload);

      alert("Consultancy Synced & Medical Hub Locked. Payment Settled.");
      setShowCheckout(false);
      setShowForm(false);
      fetchConsultancies();
    } catch (err) {
      alert("Booking Rejected: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const explodeSlot = (slot) => {
    const start = new Date(slot.start_time.replace(' ', 'T'));
    const end = new Date(slot.end_time.replace(' ', 'T'));
    const fragments = [];

    let current = new Date(start);
    while (current < end) {
      let next = new Date(current.getTime() + 30 * 60000);
      if (next > end && (next - end) > 1000) break;

      fragments.push({
        id: `${slot.slot_id}_${current.getTime()}`,
        parentId: slot.slot_id,
        parentStatus: slot.status,
        start: new Date(current),
        end: new Date(next > end ? end : next),
        displayTime: `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`
      });
      current = next;
    }
    return fragments;
  };

  const calculateMasterWindows = (data = availableSlots) => {
    const windows = [];
    if (data.length === 0) return windows;

    let currentWindow = {
      id: Date.now(),
      start: data[0].start_time,
      end: data[0].end_time,
      originalSlots: [data[0]]
    };

    for (let i = 1; i < data.length; i++) {
      const slot = data[i];
      const prevSlot = data[i - 1];
      const isContiguous = prevSlot.end_time === slot.start_time;
      const sameDay = prevSlot.start_time.split(' ')[0] === slot.start_time.split(' ')[0];

      if (isContiguous && sameDay) {
        currentWindow.end = slot.end_time;
        currentWindow.originalSlots.push(slot);
      } else {
        windows.push(currentWindow);
        currentWindow = {
          id: Date.now() + i,
          start: slot.start_time,
          end: slot.end_time,
          originalSlots: [slot]
        };
      }
    }
    windows.push(currentWindow);
    return windows;
  };

  // Filter selectable future slots
  const masterWindows = useMemo(() => {
    const now = Date.now();
    const selectableSlots = availableSlots.filter(s => {
      if (s.status !== 'AVAILABLE') return false;
      const endTimeString = s.end_time ? s.end_time.replace(' ', 'T') : null;
      if (!endTimeString) return false;
      const endTime = new Date(endTimeString).getTime();
      return !isNaN(endTime) && endTime > now;
    });
    return calculateMasterWindows(selectableSlots);
  }, [availableSlots]);

  // Group windows by day
  const availableDays = useMemo(() => {
    const days = [...new Set(masterWindows.map(win => win.start.split(' ')[0]))];
    return days.sort((a, b) => new Date(a) - new Date(b));
  }, [masterWindows]);

  const windowsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    return masterWindows.filter(win => win.start.split(' ')[0] === selectedDay);
  }, [selectedDay, masterWindows]);

  // PERFORMANCE OPTIMIZATION: Memoize Active Fragments and Booking Registry
  const { activeFragments, bookedSet } = useMemo(() => {
    if (!selectedWindow) return { activeFragments: [], bookedSet: new Set() };

    const fragments = selectedWindow.originalSlots.flatMap(slot => explodeSlot(slot));

    // Create a high-speed lookup set for booked timestamps
    const booked = new Set(
      consultancies
        .filter(eng => String(eng.consultant_id) === String(formData.consultant_id))
        .map(eng => `${eng.start_time.split(' ')[0]}_${eng.start_time.split(' ')[1].substring(0, 5)}`)
    );

    return { activeFragments: fragments, bookedSet: booked };
  }, [selectedWindow, consultancies, formData.consultant_id]);

  // Role-based filtering for engagements
  const filteredEngagementsByRole = useMemo(() => {
    if (user.role === 'ADMIN') return consultancies;

    return consultancies.filter(eng => {
      const pId = String(user.profile_id);
      if (user.role === 'CLIENT') return String(eng.client_id) === pId;
      if (user.role === 'CUSTOMER') return String(eng.customer_id) === pId;
      if (user.role === 'RETAILER') return String(eng.retailer_id) === pId;
      return false;
    });
  }, [consultancies, user]);

  const filtered = filteredEngagementsByRole.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && !showCheckout) return <div style={{ textAlign: 'center', padding: '150px' }}><div className="spin-loader" style={{ margin: '0 auto' }}></div></div>;

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-4px' }}>Doctor Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '22px', fontWeight: '700' }}>Schedule a <span style={{ color: 'var(--velvet-brick)', background: 'var(--vibrant-gold)', padding: '2px 12px', borderRadius: '8px' }}>Doctor Consultation</span> with our experts.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-brick" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={26} /> BOOK DOCTOR
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '60px', border: '4px solid var(--vibrant-gold)', position: 'relative' }}>
          <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={32} /></button>

          <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Schedule Consultation</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px' }}>
            <div>
              <div style={{ marginBottom: '40px' }}>
                <label className="form-label">Available Doctors</label>
                <select name="consultant_id" value={formData.consultant_id} onChange={handleInputChange} className="form-input" style={{ fontSize: '18px', padding: '15px' }}>
                  <option value="">Choose a Doctor...</option>
                  {consultants.map(c => <option key={c.consultant_id} value={c.consultant_id}>{c.full_name} ({c.specialty})</option>)}
                </select>
              </div>

              {formData.consultant_id && (
                <div className="page-transition">
                  <label className="form-label">Available Days</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
                    {availableDays.length === 0 && <p style={{ fontSize: '14px', color: '#94a3b8' }}>No clinical availability found.</p>}
                    {availableDays.map(day => {
                      const dateObj = new Date(day);
                      const isSelected = selectedDay === day;
                      return (
                        <button
                          key={day}
                          onClick={() => { setSelectedDay(day); setSelectedWindow(null); }}
                          style={{
                            padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', transition: '0.3s',
                            background: isSelected ? 'var(--velvet-brick)' : 'white',
                            color: isSelected ? 'white' : 'var(--velvet-dark)',
                            border: isSelected ? '2px solid var(--vibrant-gold)' : '2px solid #e2e8f0',
                            textAlign: 'center', minWidth: '100px', boxShadow: isSelected ? '0 10px 15px -3px rgba(182, 45, 45, 0.2)' : 'none'
                          }}
                        >
                          <div style={{ fontSize: '10px', fontWeight: '900', opacity: isSelected ? 0.9 : 0.6 }}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
                          <div style={{ fontSize: '20px', fontWeight: '900' }}>{dateObj.getDate()}</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', opacity: isSelected ? 0.9 : 0.6 }}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDay && (
                    <div className="page-transition">
                      <label className="form-label">Professional Windows</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '40px' }}>
                        {windowsForSelectedDay.map((win, idx) => {
                          const totalFragments = win.originalSlots.reduce((acc, slot) => acc + explodeSlot(slot).length, 0);
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedWindow(win)}
                              style={{
                                padding: '20px', borderRadius: '15px', border: selectedWindow?.id === win.id ? '3px solid var(--vibrant-gold)' : '2px solid #eee',
                                background: selectedWindow?.id === win.id ? 'var(--velvet-dark)' : 'white',
                                color: selectedWindow?.id === win.id ? 'white' : 'var(--velvet-dark)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s', cursor: 'pointer', textAlign: 'left'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '18px', fontWeight: '900' }}>{win.start.split(' ')[1].substring(0, 5)} - {win.end.split(' ')[1].substring(0, 5)}</div>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: selectedWindow?.id === win.id ? 'var(--vibrant-gold)' : '#94a3b8' }}>{totalFragments} MICRO-SEGMENTS</div>
                              </div>
                              <ArrowRight size={20} opacity={selectedWindow?.id === win.id ? 1 : 0.3} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedWindow && (
                    <div className="page-transition" style={{ marginTop: '20px', background: '#f8fafc', border: '2px solid #e2e8f0', padding: '35px', borderRadius: '25px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div>
                          <label className="form-label" style={{ marginBottom: 0 }}>Select Micro-Segment</label>
                          <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>30-minute high-precision scheduling.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '10px', fontWeight: '900' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}><div className="square-legend green"></div> OPEN</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}><div className="square-legend dark"></div> FULL</div>
                        </div>
                      </div>

                      <div className="square-grid">
                        {activeFragments.map(frag => {
                          const dateStr = selectedWindow.start.split(' ')[0];
                          const fragKey = `${dateStr}_${frag.displayTime}`;
                          const isBooked = bookedSet.has(fragKey);
                          const isActive = formData.start_time.includes(frag.displayTime) && formData.start_time.includes(dateStr);

                          return (
                            <button
                              key={frag.id}
                              className={`sq-cell ${isBooked ? 'booked' : (isActive ? 'active' : 'available')}`}
                              onClick={() => selectSlotFragment(selectedWindow.originalSlots.find(s => s.slot_id === frag.parentId), frag.start, frag.end)}
                              title={`${frag.displayTime} - 30 Minutes`}
                              disabled={isBooked}
                            >
                              <span style={{ fontSize: '12px', fontWeight: '900' }}>{frag.displayTime}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <div style={{ marginBottom: '30px' }}>
                <label className="form-label">Consultation Type</label>
                <select name="service_type" value={formData.service_type} onChange={handleInputChange} className="form-input">
                  <option value="">Select Service...</option>
                  {availableServices.map((s, i) => <option key={i} value={s.service_name}>{s.service_name} (${s.fee})</option>)}
                </select>
              </div>

              <div className="card" style={{ background: 'var(--velvet-dark)', color: 'white', padding: '30px', borderRadius: '25px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontWeight: '700', opacity: 0.6 }}>Professional Fee</span>
                  <span style={{ fontWeight: '900', fontSize: '24px', color: 'var(--vibrant-gold)' }}>${formData.fee || '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                  <span style={{ fontWeight: '700', opacity: 0.6 }}>Selected Block</span>
                  <span style={{ fontWeight: '900' }}>{formData.start_time ? formData.start_time.split('T')[1] : 'None'}</span>
                </div>
                <p style={{ fontSize: '11px', opacity: 0.5, lineHeight: '1.6' }}>Master shift divided into 30-minute squares. Pick your target time to secure the hub lock.</p>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                disabled={!formData.slot_id || !formData.service_type}
                className="btn btn-brick"
                style={{ width: '100%', padding: '20px', fontSize: '18px', borderRadius: '20px' }}
              >
                SECURE SESSION <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="card page-transition" style={{ maxWidth: '450px', width: '90%', border: '4px solid var(--vibrant-gold)', padding: '50px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px', textAlign: 'center' }}>Confirm Session</h2>

            <div style={{ marginBottom: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Specialist</div>
                <div style={{ fontSize: '24px', fontWeight: '900' }}>Dr. {consultants.find(c => String(c.consultant_id) === String(formData.consultant_id))?.full_name}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: '800', color: '#64748b' }}>Time-Box</span>
                <span style={{ fontWeight: '900' }}>{formData.start_time.replace('T', ' ')} (30m)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={handleFinalBooking} className="btn btn-brick" style={{ width: '100%', padding: '18px' }}>PAY & SECURE HUB</button>
              <button onClick={() => setShowCheckout(false)} className="btn" style={{ width: '100%', border: '2px solid #eee' }}>ABORT</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '30px', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={22} style={{ position: 'absolute', left: '15px', top: '15px', color: '#94a3b8' }} />
            <input className="form-input" placeholder="Search archived sessions..." style={{ marginBottom: 0, paddingLeft: '50px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <p style={{ fontWeight: '800', color: '#64748b' }}>Showing {filtered.length} Engagements</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ textAlign: 'left', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
              <th style={{ padding: '25px 30px' }}>Engagement</th>
              <th>Expert</th>
              <th>Booked By</th>
              <th>Timeline</th>
              <th>Professional Fee</th>
              <th>Hub Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((eng) => {
              const dr = consultants.find(c => String(c.consultant_id) === String(eng.consultant_id))?.full_name || "Expert Hub";
              return (
                <tr key={eng.engagement_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--vibrant-gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--velvet-brick)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><Shield size={20} /></div>
                      <div>
                        <div style={{ fontWeight: '900', fontSize: '18px', color: 'var(--velvet-dark)' }}>{eng.title}</div>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--velvet-brick)', background: 'rgba(182, 45, 45, 0.05)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                          TOKEN ID: {eng.engagement_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{ fontWeight: '800' }}>Dr. {dr}</div></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '900', fontSize: '14px' }}>{eng.user_name || 'Personal Booking'}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>{eng.user_type}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '14px' }}>
                        <Clock size={14} /> {eng.start_time?.split(' ')[1]}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b' }}>{eng.start_time?.split(' ')[0]}</div>
                    </div>
                  </td>
                  <td><div style={{ fontWeight: '900', color: 'var(--velvet-brick)', fontSize: '18px' }}>${eng.fee}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span className={`badge-vibrant ${eng.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{eng.status}</span>
                      {eng.status !== 'COMPLETED' && (
                        <button className="btn-action-ledger" style={{ background: 'var(--velvet-brick)', color: 'white', width: 'auto', padding: '0 15px', fontSize: '10px', fontWeight: '900' }}>
                          RESUME TOKEN →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .spin-loader { width: 40px; height: 40px; border: 4px solid var(--vibrant-gold); border-top-color: var(--velvet-brick); border-radius: 50%; animation: spin 1s linear infinite; } 
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .square-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; 
        }
        .sq-cell {
            padding: 15px 5px; border-radius: 12px; border: none;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .sq-cell:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15); filter: brightness(1.1); }
        .sq-cell.available { background: #10b981; color: white; }
        .sq-cell.booked { background: #cbd5e1; color: #64748b; cursor: not-allowed; opacity: 0.6; box-shadow: none; pointer-events: none; }
        .sq-cell.active { background: var(--velvet-dark); color: white; transform: scale(1.05); border: 2px solid var(--vibrant-gold); box-shadow: 0 0 20px rgba(0,0,0,0.2); }
        
        .square-legend { width: 12px; height: 12px; border-radius: 4px; }
        .square-legend.green { background: #10b981; }
        .square-legend.dark { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default Consultancies;
