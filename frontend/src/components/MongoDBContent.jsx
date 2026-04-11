import React from 'react';
import { FileText, Database, BookOpen } from 'lucide-react';

const MongoDBContent = () => {
    const documents = [
        { title: 'Clinical Trials 2024.pdf', status: 'Processed', metadata: { type: 'Academic', pages: 42, lastAccess: '2h ago' } },
        { title: 'New Medicine Protocol.docx', status: 'Indexing', metadata: { type: 'Logic', pages: 12, lastAccess: 'Now' } },
        { title: 'Market Sentiment.json', status: 'Synced', metadata: { type: 'Research', size: '2MB', lastAccess: '1d ago' } },
    ];

    return (
        <div style={{ padding: '30px', background: '#fff', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--velvet-dark)' }}>MongoDB Content Lake</h3>
                <span style={{ fontSize: '11px', background: 'var(--velvet-brick)', padding: '5px 12px', borderRadius: '15px', fontWeight: '800', color: 'white' }}>DOCUMENTS ACTIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {documents.map((doc, i) => (
                    <div key={i} style={{ padding: '20px', borderRadius: '20px', background: '#fcfcfc', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', background: 'rgba(192, 57, 43, 0.05)', borderRadius: '12px', color: 'var(--velvet-brick)' }}>
                            <FileText size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '15px', color: '#333' }}>{doc.title}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'flex', gap: '10px' }}>
                                <span>Type: {doc.metadata.type}</span>
                                <span>•</span>
                                <span>{doc.metadata.pages || doc.metadata.size}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: doc.status === 'Processed' ? '#27ae60' : 'var(--vibrant-gold)' }}>{doc.status.toUpperCase()}</div>
                            <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{doc.metadata.lastAccess}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={16} /> Linked to Primary MongoDB Atlas Cluster
            </div>
        </div>
    );
};

export default MongoDBContent;
