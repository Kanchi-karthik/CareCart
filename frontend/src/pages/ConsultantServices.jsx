import React, { useState, useEffect } from 'react';
import { UserCircle, Calendar, Plus, Save, Trash2, DollarSign, Activity, Clock, Shield, Filter, CheckCircle, AlertCircle, Search, User, Briefcase, Zap, FileText } from 'lucide-react';
import apiClient from '../utils/axiosConfig';

const ConsultantServices = () => {
    const [consultant, setConsultant] = useState(null);
    const [services, setServices] = useState([]);
    const [slots, setSlots] = useState([]);
    const [engagements, setEngagements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('MENU'); // MENU, SLOTS, LEDGER

    const [newShift, setNewShift] = useState({ date: '', start_time: '09:00', end_time: '12:00' });
    const [previewSlots, setPreviewSlots] = useState([]);

    // Ledger Filters
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchFilter, setSearchFilter] = useState('');
    const [selectedControlSlot, setSelectedControlSlot] = useState(null);

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (consultant) {
            fetchSlots();
            fetchEngagements();
        }
    }, [consultant]);

    const fetchProfile = async () => {
        try {
            const res = await apiClient.get('/consultants');
            const profile = res.data.find(c => String(c.user_id).trim() === String(user.user_id).trim());
            if (profile) {
                setConsultant({
                    ...profile,
                    consultant_id: String(profile.consultant_id).trim()
                });
            }
        } catch (err) {
            console.error("Profile sync failed", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        try {
            const res = await apiClient.get(`/consultant-slots?consultant_id=${consultant.consultant_id}`);
            const sorted = (res.data || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            setSlots(sorted);
        } catch (err) {
            console.error("Slot fetch failed", err);
        }
    };

    const fetchEngagements = async () => {
        try {
            const res = await apiClient.get('/engagements');
            const filtered = (res.data || []).filter(e => String(e.consultant_id) === String(consultant.consultant_id));
            setEngagements(filtered);
        } catch (err) {
            console.error("Engagement fetch failed", err);
        }
    };

    const generateSlots = () => {
        if (!newShift.date || !newShift.start_time || !newShift.end_time) return alert("Define shift window.");

        const start = new Date(`${newShift.date}T${newShift.start_time}`);
        const end = new Date(`${newShift.date}T${newShift.end_time}`);
        const generated = [];

        let current = new Date(start);
        while (current < end) {
            let next = new Date(current.getTime() + 30 * 60000);
            if (next > end) break;

            const pad = (n) => n.toString().padStart(2, '0');
            const format = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

            generated.push({
                start_time: format(current),
                end_time: format(next)
            });
            current = next;
        }
        setPreviewSlots(generated);
    };

    const handlePublishAll = async () => {
        if (!consultant) return alert("Initialize profile first.");
        try {
            setSaving(true);
            await Promise.all(previewSlots.map(slot =>
                apiClient.post('/consultant-slots', {
                    consultant_id: consultant.consultant_id,
                    ...slot
                })
            ));
            alert(`${previewSlots.length} Micro-slots synchronized with your active registry.`);
            setPreviewSlots([]);
            fetchSlots();
        } catch (err) {
            alert("Batch Sync Fault.");
        } finally {
            setSaving(false);
        }
    };

    const fetchServices = async () => {
        if (!consultant) return;
        try {
            const res = await apiClient.get(`/consultants?action=services&consultant_id=${consultant.consultant_id}`);
            setServices(res.data || []);
        } catch (err) {
            console.error("Services fetch failed", err);
        }
    };

    useEffect(() => {
        if (consultant) {
            fetchServices();
        }
    }, [consultant]);

    const addService = async () => {
        if (!consultant) return alert("Profile not initialized.");
        if (!newService.type) return alert("Select a service category.");

        try {
            setSaving(true);
            const serviceName = newService.type === 'OTHER' ? newService.customName : newService.type;
            if (!serviceName) return alert("Provide a service title.");

            await apiClient.post('/consultants/services', {
                consultant_id: consultant.consultant_id,
                service_name: serviceName,
                fee: newService.fee,
                description: "Professional medical service node registered in CareCart MDBMS."
            });

            // Explicitly reload services
            await fetchServices();
            alert("Success: Specialist registry updated.");

            setNewService({ type: '', fee: 100, customName: '' });
        } catch (err) {
            alert("Registration Fault.");
        } finally {
            setSaving(false);
        }
    };

    const removeService = async (serviceId) => {
        if (!window.confirm("Verify: Permanently purge this service from your catalog?")) return;
        try {
            await apiClient.delete(`/consultants/services?service_id=${serviceId}`);
            fetchServices();
        } catch (err) {
            alert("Purge Fault.");
        }
    };

    const SERVICE_CATALOG = {
        "CORE CLINICAL": ["General Health Audit", "Pediatric Wellness Check", "General Medicine"],
        "SPECIALIZED": ["Cardiology Consultation", "Neurological Assessment", "Dermatology Screening", "Surgical Consultation", "Psychiatric Counseling", "Gynecology Consultation", "Orthopedic Evaluation", "ENT Specialist Visit", "Ophthalmologist Exam", "Urology Checkup", "Nephrology Analysis", "Pulmonology Screening", "Endocrinology Audit", "Oncology Consultation"],
        "DIAGNOSTIC & REHAB": ["Radiology Report Review", "Physiotherapy Session", "Sports Medicine Therapy"],
        "PREMIUM": ["Executive Cardiac Screening", "Custom Specialized Node"]
    };

    const PREDEFINED_SERVICES = Object.values(SERVICE_CATALOG).flat();

    const [newService, setNewService] = useState({ type: '', fee: 100, customName: '' });

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Verify: Permanently purge this availability window?")) return;
        try {
            await apiClient.delete(`/consultant-slots?slot_id=${slotId}`);
            fetchSlots();
        } catch (err) {
            alert(err.response?.data?.message || "Purge Denied.");
        }
    };

    const groupedSlots = React.useMemo(() => {
        return slots.reduce((groups, slot) => {
            if (!slot.start_time) return groups;
            const date = slot.start_time.split(' ')[0];
            if (!groups[date]) groups[date] = [];
            groups[date].push(slot);
            return groups;
        }, {});
    }, [slots]);

    const filteredEngagements = React.useMemo(() => {
        return (engagements || []).filter(e => {
            const matchesType = typeFilter === 'ALL' || e.user_type === typeFilter;
            const matchesSearch = e.user_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                e.title?.toLowerCase().includes(searchFilter.toLowerCase());
            return matchesType && matchesSearch;
        }).sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    }, [engagements, typeFilter, searchFilter]);


    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <Activity size={48} className="rotate-slow" style={{ margin: '0 auto 20px', color: 'var(--velvet-brick)' }} />
            <p style={{ fontWeight: '800' }}>Synchronizing specialist environment...</p>
        </div>
    );

    if (!consultant) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 20px', color: '#f59e0b' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Specialist Profile Not Found</h2>
            <p style={{ color: '#64748b', fontWeight: '700', marginBottom: '30px' }}>Your account is registered as a CONSULTANT, but no professional profile was found in our MDBMS registry.</p>
            <button onClick={() => window.location.reload()} className="btn btn-brick">RETRY SYNCHRONIZATION</button>
        </div>
    );

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                <div>
                    <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px' }}>Specialist Hub</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '700' }}>Expert management of <span style={{ color: 'var(--velvet-brick)' }}>Normalized Service Nodes</span>.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '5px', borderRadius: '15px' }}>
                    {[
                        { id: 'MENU', label: 'SERVICES', icon: DollarSign },
                        { id: 'SLOTS', label: 'AVAILABILITY', icon: Clock },
                        { id: 'LEDGER', label: 'BOOKING LEDGER', icon: Briefcase }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px', borderRadius: '12px', border: 'none',
                                background: activeTab === tab.id ? 'var(--velvet-dark)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#64748b',
                                fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'
                            }}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'MENU' && (
                <div className="card" style={{ border: '4px solid var(--vibrant-gold)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '900' }}>Professional Catalog (Normalized)</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '700' }}>Add services one by one to your institutional registry.</p>
                        </div>
                        <button onClick={fetchServices} className="btn" style={{ background: 'white', border: '5px solid var(--vibrant-gold)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--velvet-brick)', fontWeight: '900' }}>
                            <Activity size={16} /> REFRESH MDBMS REGISTRY
                        </button>
                    </div>

                    {saving && (
                        <div style={{ background: 'var(--velvet-brick)', color: 'white', padding: '10px 20px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', fontWeight: '900', textAlign: 'center' }}>
                            SYNCHRONIZING NEW SERVICE NODE WITH INSTITUTIONAL DATABASE...
                        </div>
                    )}

                    <div className="glass-card" style={{ padding: '40px', marginBottom: '40px', borderLeft: '8px solid var(--vibrant-gold)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '30px', alignItems: 'flex-end' }}>
                            <div>
                                <label className="form-label" style={{ fontSize: '11px', color: 'var(--velvet-brick)', letterSpacing: '1px' }}>SERVICE CATEGORY</label>
                                <select
                                    className="form-input premium-input"
                                    style={{ background: 'white', marginBottom: 0 }}
                                    value={newService.type}
                                    onChange={e => setNewService({ ...newService, type: e.target.value })}
                                >
                                    <option value="">Select Specialty Node...</option>
                                    {Object.entries(SERVICE_CATALOG).map(([group, list]) => (
                                        <optgroup key={group} label={group}>
                                            {list.map(s => <option key={s} value={s}>{s}</option>)}
                                        </optgroup>
                                    ))}
                                    <optgroup label="UNLISTED">
                                        <option value="OTHER">OTHER / SPECIALIZED SERVICE</option>
                                    </optgroup>
                                </select>
                            </div>

                            {newService.type === 'OTHER' && (
                                <div style={{ gridColumn: 'span 3', marginTop: '15px' }}>
                                    <label className="form-label">CUSTOM SERVICE NAME</label>
                                    <input
                                        className="form-input premium-input"
                                        placeholder="Enter specialized service title..."
                                        value={newService.customName}
                                        onChange={e => setNewService({ ...newService, customName: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="form-label" style={{ fontSize: '11px', color: 'var(--velvet-brick)', letterSpacing: '1px' }}>INSTITUTIONAL FEE (?)</label>
                                <input
                                    type="number"
                                    className="form-input premium-input"
                                    style={{ background: 'white', marginBottom: 0 }}
                                    value={newService.fee}
                                    onChange={e => setNewService({ ...newService, fee: e.target.value })}
                                />
                            </div>
                            <button onClick={addService} className="btn-premium-hub" disabled={saving}>
                                <Plus size={20} /> {saving ? 'SYNCING...' : 'REGISTER NODE'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {services.map((service, index) => (
                            <div key={index} className="card" style={{ background: '#f8fafc', border: '2px solid #eee', padding: '20px 30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--velvet-brick)', textTransform: 'uppercase', letterSpacing: '1px' }}>ACTIVE NODE</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--velvet-dark)' }}>{service.service_name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Ref ID: {service.service_id}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>SERVICE REVENUE</div>
                                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--vibrant-gold)' }}>${service.fee}</div>
                                        </div>
                                        <button onClick={() => removeService(service.service_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}>
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {services.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1' }}>
                                <Briefcase size={48} style={{ margin: '0 auto 20px', color: '#cbd5e1' }} />
                                <p style={{ fontWeight: '800', color: '#94a3b8' }}>Your catalog is empty. Add services from the selector above.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'SLOTS' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                    <div className="card" style={{ alignSelf: 'start', border: '4px solid var(--vibrant-gold)' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px' }}>Fragment Shifts</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <label className="form-label">CALENDAR DATE</label>
                            <input type="date" className="form-input" value={newShift.date} onChange={e => setNewShift({ ...newShift, date: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                            <div>
                                <label className="form-label">SHIFT START</label>
                                <input type="time" className="form-input" value={newShift.start_time} onChange={e => setNewShift({ ...newShift, start_time: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">SHIFT END</label>
                                <input type="time" className="form-input" value={newShift.end_time} onChange={e => setNewShift({ ...newShift, end_time: e.target.value })} />
                            </div>
                        </div>
                        <button onClick={generateSlots} className="btn" style={{ width: '100%', marginBottom: '15px', border: '2px solid #eee', fontWeight: '900' }}>CALCULATE 30M BLOCKS</button>

                        {previewSlots.length > 0 && (
                            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '900', color: 'var(--velvet-brick)', marginBottom: '15px' }}>PREVIEW SEGMENTS</p>
                                <div className="square-grid small">
                                    {previewSlots.map((ps, i) => (
                                        <div key={i} className="sq-cell available small"></div>
                                    ))}
                                </div>
                                <button onClick={handlePublishAll} disabled={saving} className="btn btn-brick" style={{ width: '100%', padding: '15px', marginTop: '20px' }}>SYNC TO EXPERT HUB</button>
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '30px', background: '#f8fafc', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '900' }}>Active Registry</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>Status-aware 30-minute medical fragments. <span style={{ color: 'var(--velvet-brick)' }}>(T-Minus Realtime Auto-Cleanup Active)</span></p>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '11px', fontWeight: '900' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="square-legend green"></div> FREE</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="square-legend gold"></div> BOOKED</div>
                            </div>
                        </div>

                        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '400px', maxHeight: '600px', overflowY: 'auto', borderRadius: '0 0 20px 20px' }}>
                            {Object.keys(groupedSlots).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: '#cbd5e1' }}>
                                    <Activity size={48} style={{ margin: '0 auto 20px' }} />
                                    <p style={{ fontWeight: '800' }}>No active segments published.</p>
                                </div>
                            ) : Object.keys(groupedSlots).map(date => (
                                <div key={date} style={{ marginBottom: '45px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                        <Calendar size={12} /> {date}
                                    </div>
                                    <div className="square-grid">
                                        {groupedSlots[date].map(slot => {
                                            const eng = engagements.find(e => e.engagement_id === slot.engagement_id);
                                            const isSelected = selectedControlSlot === slot.slot_id;

                                            return (
                                                <div
                                                    key={slot.slot_id}
                                                    onClick={() => slot.status === 'AVAILABLE' && setSelectedControlSlot(isSelected ? null : slot.slot_id)}
                                                    className={`sq-cell ${slot.status === 'BOOKED' ? 'booked-special' : 'available'} ${isSelected ? 'active-control' : ''}`}
                                                    title={`${slot.start_time.split(' ')[1]} - ${slot.status}`}
                                                >
                                                    <div className="sq-content">
                                                        <span style={{ fontSize: '12px', fontWeight: '900' }}>{slot.start_time.split(' ')[1].substring(0, 5)}</span>
                                                        {slot.status === 'BOOKED' && (
                                                            <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--velvet-brick)', marginTop: '2px' }}>
                                                                {eng?.user_name?.split(' ')[0] || 'RESERVED'}
                                                            </div>
                                                        )}

                                                        {isSelected && (
                                                            <div className="slot-control-pop page-transition">
                                                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', marginBottom: '8px' }}>NODE CONTROL</div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.slot_id); setSelectedControlSlot(null); }}
                                                                    className="btn btn-brick"
                                                                    style={{ padding: '8px', fontSize: '10px', width: '100%' }}
                                                                >
                                                                    <Trash2 size={12} /> PURGE
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'LEDGER' && (
                <div className="card" style={{ padding: 0, border: '4px solid var(--vibrant-gold)' }}>
                    <div style={{ padding: '30px', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '900' }}>Procurement Ledger</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>View institutional clients and patient sessions.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                <input
                                    className="form-input"
                                    style={{ marginBottom: 0, paddingLeft: '40px', width: '250px', background: 'white' }}
                                    placeholder="Search by name/id..."
                                    value={searchFilter}
                                    onChange={e => setSearchFilter(e.target.value)}
                                />
                            </div>
                            <select
                                className="form-input"
                                style={{ marginBottom: 0, width: '150px', background: 'white' }}
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                            >
                                <option value="ALL">ALL TYPES</option>
                                <option value="CLIENT">INSTITUTION</option>
                                <option value="CUSTOMER">PATIENT</option>
                                <option value="RETAILER">RETAILER</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ padding: '0 30px 30px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
                                    <th style={{ padding: '25px 0' }}>Procurement Partner</th>
                                    <th>Service Node</th>
                                    <th>Timeline</th>
                                    <th>Revenue</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEngagements.map(eng => (
                                    <tr key={eng.engagement_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--velvet-brick)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '900', fontSize: '16px' }}>{eng.user_name || 'Anonymous User'}</div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>ID: {eng.engagement_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '14px', fontWeight: '800' }}>{eng.title}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '900' }}>{eng.start_time.split(' ')[1]}</span>
                                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800' }}>{eng.start_time.split(' ')[0]}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '900', color: 'var(--vibrant-gold)', background: 'var(--velvet-dark)', padding: '5px 12px', borderRadius: '8px', display: 'inline-block' }}>
                                                ${eng.fee}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px',
                                                background: eng.user_type === 'CLIENT' ? '#eff6ff' : (eng.user_type === 'CUSTOMER' ? '#ecfdf5' : '#fff7ed'),
                                                color: eng.user_type === 'CLIENT' ? '#1d4ed8' : (eng.user_type === 'CUSTOMER' ? '#047857' : '#c2410c')
                                            }}>
                                                {eng.user_type}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button title="View Audit Trail" className="btn-action-ledger" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                                    <FileText size={14} />
                                                </button>
                                                <button title="Verify Session" className="btn-action-ledger" style={{ background: '#ecfdf5', color: '#047857' }}>
                                                    <Shield size={14} />
                                                </button>
                                                <button title="Export Invoice" className="btn-action-ledger" style={{ background: '#fff7ed', color: '#c2410c' }}>
                                                    <Zap size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEngagements.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                                            <FileText size={40} style={{ margin: '0 auto 15px' }} />
                                            <p style={{ fontWeight: '800' }}>No engagements found for these criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
                }

                .premium-input {
                    border-radius: 14px !important;
                    border: 2px solid #f1f5f9 !important;
                    padding: 14px 20px !important;
                    font-weight: 700 !important;
                    transition: 0.3s !important;
                }
                .premium-input:focus {
                    border-color: var(--vibrant-gold) !important;
                    box-shadow: 0 0 0 4px rgba(241, 196, 15, 0.1) !important;
                }

                .btn-premium-hub {
                    background: var(--velvet-brick);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    padding: 15px 30px;
                    font-weight: 900;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .btn-premium-hub:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(183, 28, 28, 0.2);
                    filter: brightness(1.1);
                }

                .square-grid { 
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; 
                }
                .square-grid.small { gap: 8px; }
                .sq-cell {
                    padding: 20px 10px; border-radius: 16px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .sq-cell.small { width: 50px; height: 50px; padding: 0; cursor: default; box-shadow: none; border-radius: 10px; }
                .sq-cell:hover:not(.small) { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); filter: brightness(1.1); }
                .sq-cell.available { background: linear-gradient(135deg, #10b981, #059669); color: white; }
                .sq-cell.booked-special { background: linear-gradient(135deg, var(--vibrant-gold), #d4af37); color: var(--velvet-dark); }
                
                .sq-content { display: flex; flex-direction: column; align-items: center; position: relative; width: 100%; height: 100%; justify-content: center; }
                
                .sq-delete-visible { display: none; }

                .active-control {
                    transform: scale(1.1) translateY(-5px) !important;
                    z-index: 100;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
                }

                .slot-control-pop {
                    position: absolute;
                    top: 110%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    border: 2px solid var(--vibrant-gold);
                    border-radius: 12px;
                    padding: 12px;
                    width: 120px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 101;
                    pointer-events: auto;
                }
                .slot-control-pop::after {
                    content: '';
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 8px solid transparent;
                    border-bottom-color: var(--vibrant-gold);
                }

                .btn-action-ledger {
                    width: 32px; height: 32px; border-radius: 10px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: 0.3s;
                }
                .btn-action-ledger:hover { transform: translateY(-2px); filter: brightness(0.9); }

                .square-legend { width: 12px; height: 12px; border-radius: 4px; }
                .square-legend.green { background: #10b981; }
                .square-legend.gold { background: var(--vibrant-gold); }
            `}</style>
        </div>
    );
};

export default ConsultantServices;
