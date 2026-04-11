import React from 'react';

/**
 * A simplified component that replaces the previous 'SecuredValue'.
 * Per user request, blur/masking is removed to keep content fully visible and easy to read.
 */
const SecuredValue = ({ 
    value, 
    color = 'inherit', 
    size = 'inherit',
    isSensitive = false 
}) => {
    return (
        <span style={{ 
            color, 
            fontSize: size, 
            fontWeight: '900',
            transition: 'all 0.3s ease'
        }}>
            {value}
        </span>
    );
};

export default SecuredValue;
