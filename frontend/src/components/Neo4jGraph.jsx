import React from 'react';

const Neo4jGraph = () => {
    const nodes = [
        { id: 'Admin', type: 'user', x: 50, y: 50, color: '#c0392b' },
        { id: 'Retailer A', type: 'retailer', x: 20, y: 30, color: '#d35400' },
        { id: 'Retailer B', type: 'retailer', x: 80, y: 20, color: '#d35400' },
        { id: 'Customer X', type: 'customer', x: 10, y: 80, color: '#3498db' },
        { id: 'Customer Y', type: 'customer', x: 90, y: 70, color: '#3498db' },
        { id: 'Medicine A', type: 'product', x: 40, y: 90, color: '#f1c40f' },
        { id: 'Medicine B', type: 'product', x: 60, y: 10, color: '#f1c40f' },
    ];

    const links = [
        { from: 0, to: 1 }, { from: 0, to: 2 },
        { from: 1, to: 3 }, { from: 2, to: 4 },
        { from: 3, to: 5 }, { from: 4, to: 5 },
        { from: 1, to: 6 }, { from: 2, to: 6 },
    ];

    return (
        <div style={{ padding: '30px', background: '#fff', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--velvet-dark)' }}>Network Relationship Graph</h3>
                <span style={{ fontSize: '11px', background: '#f8f9fa', padding: '5px 12px', borderRadius: '15px', fontWeight: '800', color: '#666' }}>LIVE CONNECTIONS</span>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', border: '1px solid #eee', borderRadius: '20px', background: '#fafafa' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    {/* Links */}
                    {links.map((link, i) => (
                        <line
                            key={i}
                            x1={nodes[link.from].x} y1={nodes[link.from].y}
                            x2={nodes[link.to].x} y2={nodes[link.to].y}
                            stroke="#ddd" strokeWidth="0.5"
                            style={{ transition: 'all 0.5s ease' }}
                        />
                    ))}
                    {/* Nodes */}
                    {nodes.map((node, i) => (
                        <g key={i}>
                            <circle
                                cx={node.x} cy={node.y} r="3"
                                fill={node.color}
                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                            >
                                <animate attributeName="r" values="3;3.5;3" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <text x={node.x} y={node.y + 6} fontSize="2.5" fontWeight="800" textAnchor="middle" fill="#666">
                                {node.id}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '12px', color: '#c0392b', fontWeight: '800' }}>● Admin</div>
                <div style={{ fontSize: '12px', color: '#d35400', fontWeight: '800' }}>● Retailer</div>
                <div style={{ fontSize: '12px', color: '#3498db', fontWeight: '800' }}>● Customer</div>
                <div style={{ fontSize: '12px', color: '#f1c40f', fontWeight: '800' }}>● Medicine</div>
            </div>
        </div>
    );
};

export default Neo4jGraph;
