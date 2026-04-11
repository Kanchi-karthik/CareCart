// Emergency Logistics Provisioning Script
// Targeted for CareCart Institutional Environment

import apiClient from '../utils/axiosConfig';

export async function provisionEmergencyOrder() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!user.id) {
        console.error("No Clinical Identity detected. Aborting provisioning.");
        return;
    }

    console.log("Provisioning Emergency Procurement Thread for: " + (user.profile_id || user.id));

    try {
        const payload = {
            buyer_id: user.profile_id || user.id,
            product_id: 'P001',
            seller_id: 'S001',
            quantity: 50,
            unit_price: 1200.00,
            total_amount: 60000.00,
            tax_amount: 7200.00,
            delivery_charge: 500.00,
            grand_total: 67700.00,
            status: 'PENDING',
            shipping_address: 'Apollo Clinical Hub, Jubilee Hills, Hyderabad',
            payment_method: 'UPI'
        };

        const res = await apiClient.post('/orders/', payload);
        console.log("Procurement Secured: " + res.data.message);
        return true;
    } catch (err) {
        console.error("Provisioning failure: " + (err.response?.data?.message || err.message));
        return false;
    }
}
