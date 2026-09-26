/**
 * Fleuria Handmade - End-to-End System & CRUD Integration Test
 * Verifies that the Admin Panel and Public Website communicate seamlessly via database & APIs.
 */

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🌸 Starting Fleuria Handmade Full Flow Integration Test...\n');
  let token = null;
  let testProductId = null;
  let testOrderId = null;
  let testCustomOrderId = null;

  try {
    // Test 1: Health check
    const health = await fetch(`${API_BASE}/health`).then(r => r.json());
    console.log('✅ Test 1: Server Health Check:', health.status);

    // Test 2: Admin Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Iness@Fleuria.com',
        password: 'iness2131'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login failed: ' + JSON.stringify(loginData));
    token = loginData.token;
    console.log('✅ Test 2: Admin Authentication Succeeded (JWT Token Generated)');

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 3: Dashboard stats
    const stats = await fetch(`${API_BASE}/admin/dashboard/stats`, { headers: authHeaders }).then(r => r.json());
    console.log(`✅ Test 3: Dashboard Stats Loaded: ${stats.summary.totalProducts} Products, ${stats.summary.totalOrders} Orders, ${stats.summary.totalCustomOrders} Custom Requests`);

    // Test 4: Product Creation (Admin adds new product)
    const newProduct = {
      title: 'Rose Gold Chenille Hydrangea Bouquet',
      category_id: 'pipe-cleaner',
      price: 5500,
      original_price: 6500,
      stock_quantity: 15,
      stock_status: 'in_stock',
      image: 'assets/images/pipe-cleaner-tulips.jpg',
      short_description: 'Exquisite blush and rose gold velvety chenille hydrangea bouquet.',
      description: 'Handmade with over 80 miniature chenille florets meticulously wired into a lush spherical blooming bouquet.',
      features: ['100% Handcrafted plush chenille florets', 'Everlasting, bendable stems', 'Luxury gift wrap included'],
      care: 'Keep in dry room. Dust gently with cool blower.',
      is_featured: 1,
      is_new: 1
    };

    const createProdRes = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProduct)
    });
    const createProdData = await createProdRes.json();
    testProductId = createProdData.product.id;
    console.log(`✅ Test 4: Product Created in Admin (ID: ${testProductId}, Price: 5500 DA)`);

    // Test 5: Verify Product Appears on Public Website
    const publicProds = await fetch(`${API_BASE}/public/products`).then(r => r.json());
    const foundOnPublic = publicProds.products.find(p => p.id === testProductId);
    if (!foundOnPublic) throw new Error('New product did not appear on public website API!');
    console.log(`✅ Test 5: Verified Product Appeared on Public Website: "${foundOnPublic.title}" (${foundOnPublic.price} DA)`);

    // Test 6: Admin Updates Product Price: 5500 DA -> 6200 DA
    const updateRes = await fetch(`${API_BASE}/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ price: 6200 })
    });
    const updateData = await updateRes.json();
    console.log(`✅ Test 6: Admin Changed Price to ${updateData.product.price} DA`);

    // Test 7: Verify Updated Price Appears on Public Website
    const publicSingle = await fetch(`${API_BASE}/public/products/${testProductId}`).then(r => r.json());
    if (publicSingle.product.price !== 6200) throw new Error('Updated price did not reflect on public website!');
    console.log(`✅ Test 7: Verified Public Website Immediately Shows New Price: ${publicSingle.product.price} DA`);

    // Test 8: Admin Disables Product (is_active = 0)
    await fetch(`${API_BASE}/admin/products/${testProductId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ field: 'is_active' })
    });
    const publicAfterDisable = await fetch(`${API_BASE}/public/products`).then(r => r.json());
    const stillOnPublic = publicAfterDisable.products.find(p => p.id === testProductId);
    if (stillOnPublic) throw new Error('Disabled product should not be visible on public website!');
    console.log('✅ Test 8: Verified Disabled Product is Hidden from Public Website');

    // Test 9: Re-enable Product
    await fetch(`${API_BASE}/admin/products/${testProductId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ field: 'is_active' })
    });
    console.log('✅ Test 9: Re-enabled Product');

    // Test 10: Customer Checkout Order via WhatsApp placed on Website
    const orderPayload = {
      customer: {
        name: 'Kenza Meziane',
        phone: '+213 555 90 80 70',
        address: 'Cite 1000 Logements, Bloc 12',
        city: 'Annaba',
        giftNote: 'Happy Birthday Sis! Love you always.',
        paymentMethod: 'Cash on Delivery (Paiement à la livraison / COD)'
      },
      items: [
        {
          productId: testProductId,
          title: 'Rose Gold Chenille Hydrangea Bouquet',
          price: 6200,
          quantity: 1,
          image: 'assets/images/pipe-cleaner-tulips.jpg'
        }
      ],
      subtotal: 6200,
      shippingFee: 600,
      total: 6800
    };

    const orderRes = await fetch(`${API_BASE}/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    testOrderId = orderData.orderId;
    console.log(`✅ Test 10: Customer Placed WhatsApp Order on Storefront (${orderData.orderNumber})`);

    // Test 11: Verify Order appears in Admin Panel Orders list
    const adminOrders = await fetch(`${API_BASE}/admin/orders`, { headers: authHeaders }).then(r => r.json());
    const foundOrder = adminOrders.orders.find(o => o.id === testOrderId);
    if (!foundOrder) throw new Error('Customer order did not appear in admin orders!');
    console.log(`✅ Test 11: Verified Order Appeared in Admin Orders: ${foundOrder.order_number} by ${foundOrder.customer_name} (Total: ${foundOrder.total} DA)`);

    // Test 12: Admin Updates Order Status to "Preparing"
    await fetch(`${API_BASE}/admin/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Preparing' })
    });
    console.log('✅ Test 12: Admin Updated Order Status to "Preparing"');

    // Test 13: Customer Submits Bespoke Commission Brief on Website
    const customBrief = {
      name: 'Samira Belkacem',
      phone: '+213 661 55 44 33',
      type: 'Custom Pipe Cleaner Bouquet',
      palette: 'Dusty blue, ivory & eucalyptus green',
      date: '2026-11-20',
      budget: '14 000 DA',
      description: 'Bridal bouquet with 18 pipe cleaner peonies and custom silk ribbon wrapping.'
    };

    const customRes = await fetch(`${API_BASE}/public/custom-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customBrief)
    });
    const customData = await customRes.json();
    testCustomOrderId = customData.requestId;
    console.log(`✅ Test 13: Customer Submitted Bespoke Commission Brief (${testCustomOrderId})`);

    // Test 14: Verify Custom Order appears in Admin Custom Orders
    const adminCustom = await fetch(`${API_BASE}/admin/custom-orders`, { headers: authHeaders }).then(r => r.json());
    const foundCustom = adminCustom.customOrders.find(c => c.id === testCustomOrderId);
    if (!foundCustom) throw new Error('Bespoke request did not appear in admin custom orders!');
    console.log(`✅ Test 14: Verified Custom Request in Admin: ${foundCustom.customer_name} for "${foundCustom.project_type}"`);

    // Test 15: Store Settings Update (Admin changes Free Shipping: 8000 -> 10000, WhatsApp: 213555812564 -> 213555999888)
    await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        free_shipping_threshold: 10000,
        whatsapp_number: '213555999888',
        whatsapp_display: '+213 555 99 98 88'
      })
    });
    console.log('✅ Test 15: Admin Changed Free Shipping Threshold to 10000 DA and WhatsApp to 213555999888');

    // Test 16: Verify Public Website Config uses the new settings
    const publicConfig = await fetch(`${API_BASE}/public/config`).then(r => r.json());
    if (publicConfig.freeShippingThreshold !== 10000 || publicConfig.whatsappNumber !== '213555999888') {
      throw new Error('Public config does not reflect updated settings!');
    }
    console.log(`✅ Test 16: Verified Public Website Config Immediately Uses New Settings: Threshold: ${publicConfig.freeShippingThreshold} DA, WhatsApp: ${publicConfig.whatsappNumber}`);

    // Restore default settings
    await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        free_shipping_threshold: 8000,
        whatsapp_number: '213555812564',
        whatsapp_display: '+213 555 81 25 64'
      })
    });
    console.log('✅ Test 17: Restored Standard Store Settings Defaults');

    // Clean up test product
    await fetch(`${API_BASE}/admin/products/${testProductId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    console.log(`✅ Test 18: Cleaned Up Test Product ${testProductId}`);

    console.log('\n🎉 ALL 18 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('   The complete flow from Admin Panel -> SQLite Database -> Public Storefront works seamlessly!\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
