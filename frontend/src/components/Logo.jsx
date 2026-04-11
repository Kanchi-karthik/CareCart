import React from 'react';

const Logo = ({ size = 100, type = 'full', inverse = false }) => {
    const primaryColor = inverse ? 'white' : 'var(--vibrant-gold)';
    const secondaryColor = inverse ? 'rgba(255,255,255,0.8)' : 'var(--velvet-brick)';

    const svgSize = size * 0.8;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
            {/* MediCart Hybrid 3D Logo */}
            <div className="perspective-container" style={{ width: size, height: size }}>
                <div className="logo-3d-scene" style={{
                    transformStyle: 'preserve-3d',
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}>

                    {/* Squared Background Plate */}
                    <div style={{
                        position: 'absolute',
                        width: '90%', height: '90%',
                        left: '5%', top: '5%',
                        border: `3px solid ${primaryColor}`,
                        borderRadius: '12px',
                        transform: 'translateZ(0px) rotateY(15deg) rotateX(10deg)',
                        boxShadow: `0 10px 25px ${primaryColor}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(5px)'
                    }}>
                        {/* Medical Cart Icon */}
                        <svg viewBox="0 0 100 100" style={{
                            width: '75%', height: '75%',
                            transform: 'translateZ(20px)',
                            filter: `drop-shadow(0 0 8px ${primaryColor}88)`
                        }}>
                            {/* Cart Body */}
                            <path d="M20 20 H30 L40 70 H85 L95 30 H35" fill="none" stroke={primaryColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Wheels */}
                            <circle cx="45" cy="85" r="8" fill={secondaryColor} />
                            <circle cx="80" cy="85" r="8" fill={secondaryColor} />

                            {/* Central "K" & Medical Cross Fusion */}
                            <g transform="translate(45, 35) scale(0.4)">
                                <path d="M10 0 V100 M10 50 L60 0 M10 50 L60 100" stroke={inverse ? 'white' : 'var(--vibrant-gold)'} strokeWidth="15" strokeLinecap="round" fill="none" />
                                {/* Glowing Pulse Dot */}
                                <circle cx="10" cy="50" r="12" fill={secondaryColor}>
                                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            </g>
                        </svg>
                    </div>

                    {/* Floating Glow Sphere */}
                    <div style={{
                        position: 'absolute',
                        width: '20%', height: '20%',
                        background: primaryColor,
                        borderRadius: '50%',
                        left: '40%', top: '40%',
                        filter: 'blur(15px)',
                        opacity: 0.3,
                        animation: 'floatGlow 3s infinite ease-in-out'
                    }}></div>
                </div>
            </div>

            {type === 'full' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                        fontSize: size * 0.45,
                        fontWeight: '900',
                        letterSpacing: '-2px',
                        color: inverse ? 'white' : 'var(--text-main)',
                        lineHeight: '0.9'
                    }}>
                        <span style={{ color: secondaryColor }}>CARE</span>
                        <span style={{ color: primaryColor }}>CART</span>
                    </span>
                    <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: 'var(--text-muted)',
                        letterSpacing: '3px',
                        marginTop: '2px',
                        textTransform: 'uppercase'
                    }}>Logistics Hub</span>
                </div>
            )}

            <style>{`
                @keyframes floatGlow {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-10px) scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default Logo;
