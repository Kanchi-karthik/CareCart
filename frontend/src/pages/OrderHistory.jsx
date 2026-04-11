import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axiosConfig';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            // Using the granular multi-product join view for clinical transparency
            const res = await apiClient.get('/orders?action=detailed');
            setOrders(res.data);
        } catch (error) {
            console.error('Error loading granular order logs:', error);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Order Records</h1>
            </div>

            <div className="table-container fade-in">
                <table className="data-table logistics-table">
                    <thead>
                        <tr>
                            <th>Logistics ID</th>
                            <th>Medical Partner (Buyer)</th>
                            <th>Pharma Node (Seller)</th>
                            <th>Medicine Manifest</th>
                            <th>Qty</th>
                            <th>Total (AUD)</th>
                            <th>Fulfillment Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o, idx) => (
                            <tr key={`${o.order_id}-${idx}`}>
                                <td className="font-mono">{o.order_id}</td>
                                <td className="font-bold">{o.buyer_name}</td>
                                <td className="text-muted">{o.seller_name}</td>
                                <td className="product-cell">{o.product_name}</td>
                                <td>{o.quantity}</td>
                                <td className="price-tag">${o.total}</td>
                                <td><span className={`status-pill ${o.status.toLowerCase()}`}>{o.status}</span></td>
                                <td className="text-xs text-muted">{new Date(o.order_date).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
