const testAPIs = async () => {
  const tests = [
    { name: 'Products API', url: 'http://localhost:5000/api/products' },
    { name: 'Categories API', url: 'http://localhost:5000/api/categories' },
    { name: 'Orders API', url: 'http://localhost:5000/api/orders' },
    { name: 'Inquiries API', url: 'http://localhost:5000/api/inquiries' },
    { name: 'Dashboard API', url: 'http://localhost:5000/api/dashboard/stats' }
  ];

  for (const test of tests) {
    try {
      const res = await fetch(test.url);
      if (res.ok) {
        console.log(`[PASS] ${test.name} - Status: ${res.status}`);
      } else {
        // Some APIs might be 401 Unauthorized, which means the API works but requires auth.
        // That is still a pass for the endpoint being reachable!
        if (res.status === 401) {
          console.log(`[PASS] ${test.name} - Status: ${res.status} (Protected Endpoint)`);
        } else {
          console.log(`[FAIL] ${test.name} - Status: ${res.status}`);
        }
      }
    } catch (err) {
      console.log(`[FAIL] ${test.name} - ${err.message}`);
    }
  }

  // Test Admin Login
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'superadmin', password: 'wrongpassword' })
    });
    if (res.status === 401) {
      console.log(`[PASS] Admin Login API - Status: ${res.status} (Validates Password)`);
    } else {
      console.log(`[FAIL] Admin Login API - Status: ${res.status}`);
    }
  } catch (err) {
    console.log(`[FAIL] Admin Login API - ${err.message}`);
  }
};

testAPIs();
