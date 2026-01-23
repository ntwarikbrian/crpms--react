const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testCarId = '';
let testServiceId = '';
let testRecordId = '';
let testPaymentId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Wait for server to be ready
async function waitForServer(maxAttempts = 30) {
  console.log('Waiting for server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await makeRequest('GET', '/health');
      if (result.status === 200) {
        console.log('✓ Server is ready!\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Server did not start in time');
}

// Test functions
async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const result = await makeRequest('GET', '/health');
    console.log(`✓ Health Check: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Health Check: FAIL - ${error.message}`);
    return false;
  }
}

async function testRegister() {
  console.log('\n=== Testing User Registration ===');
  try {
    const userData = {
      username: `testuser_${Date.now()}`,
      password: 'TestPass123!@#'
    };
    const result = await makeRequest('POST', '/auth/register', userData);
    console.log(`✓ Register: ${result.status === 201 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    return result.status === 201;
  } catch (error) {
    console.log(`✗ Register: FAIL - ${error.message}`);
    return false;
  }
}

async function testLogin() {
  console.log('\n=== Testing User Login ===');
  try {
    const username = `testuser_${Date.now()}`;
    const password = 'TestPass123!@#';
    
    // First register
    await makeRequest('POST', '/auth/register', { username, password });
    
    // Then login
    const result = await makeRequest('POST', '/auth/login', { username, password });
    console.log(`✓ Login: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    
    if (result.data.token) {
      authToken = result.data.token;
      testUserId = result.data.user?.userId;
      console.log(`  Token obtained: ${authToken.substring(0, 20)}...`);
    }
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Login: FAIL - ${error.message}`);
    return false;
  }
}

async function testGetServices() {
  console.log('\n=== Testing Get Services ===');
  try {
    const result = await makeRequest('GET', '/services');
    console.log(`✓ Get Services: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Services count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
    if (Array.isArray(result.data) && result.data.length > 0) {
      testServiceId = result.data[0].id;
      console.log(`  First service:`, result.data[0]);
    }
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Get Services: FAIL - ${error.message}`);
    return false;
  }
}

async function testAddCar() {
  console.log('\n=== Testing Add Car ===');
  try {
    const carData = {
      PlateNumber: `ABC${Math.floor(Math.random() * 10000)}`,
      Type: 'Sedan',
      Model: 'Toyota Camry',
      ManufacturingYear: 2020,
      DriverPhone: '1234567890',
      MechanicName: 'John Doe'
    };
    const result = await makeRequest('POST', '/cars', carData);
    console.log(`✓ Add Car: ${result.status === 201 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    
    if (result.data.id) {
      testCarId = result.data.id;
    }
    return result.status === 201;
  } catch (error) {
    console.log(`✗ Add Car: FAIL - ${error.message}`);
    return false;
  }
}

async function testGetCars() {
  console.log('\n=== Testing Get Cars ===');
  try {
    const result = await makeRequest('GET', '/cars');
    console.log(`✓ Get Cars: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Cars count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log(`  First car:`, result.data[0]);
    }
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Get Cars: FAIL - ${error.message}`);
    return false;
  }
}

async function testAddServiceRecord() {
  console.log('\n=== Testing Add Service Record ===');
  try {
    if (!testCarId || !testServiceId) {
      console.log(`⚠ Skipping: Need car and service IDs`);
      return false;
    }

    const recordData = {
      RecordNumber: `REC${Date.now()}`,
      CarId: testCarId,
      ServiceId: testServiceId,
      ServiceDate: new Date().toISOString().split('T')[0],
      Description: 'Regular maintenance'
    };
    const result = await makeRequest('POST', '/service-records', recordData);
    console.log(`✓ Add Service Record: ${result.status === 201 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    
    if (result.data.id) {
      testRecordId = result.data.id;
    }
    return result.status === 201;
  } catch (error) {
    console.log(`✗ Add Service Record: FAIL - ${error.message}`);
    return false;
  }
}

async function testGetServiceRecords() {
  console.log('\n=== Testing Get Service Records ===');
  try {
    const result = await makeRequest('GET', '/service-records');
    console.log(`✓ Get Service Records: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Records count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log(`  First record:`, result.data[0]);
    }
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Get Service Records: FAIL - ${error.message}`);
    return false;
  }
}

async function testAddPayment() {
  console.log('\n=== Testing Add Payment ===');
  try {
    if (!testRecordId) {
      console.log(`⚠ Skipping: Need service record ID`);
      return false;
    }

    const paymentData = {
      RecordId: testRecordId,
      AmountPaid: 50000,
      PaymentDate: new Date().toISOString().split('T')[0],
      PaymentMethod: 'Cash'
    };
    const result = await makeRequest('POST', '/payments', paymentData);
    console.log(`✓ Add Payment: ${result.status === 201 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    
    if (result.data.id) {
      testPaymentId = result.data.id;
    }
    return result.status === 201;
  } catch (error) {
    console.log(`✗ Add Payment: FAIL - ${error.message}`);
    return false;
  }
}

async function testGetPayments() {
  console.log('\n=== Testing Get Payments ===');
  try {
    const result = await makeRequest('GET', '/payments');
    console.log(`✓ Get Payments: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Payments count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log(`  First payment:`, result.data[0]);
    }
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Get Payments: FAIL - ${error.message}`);
    return false;
  }
}

async function testGetReports() {
  console.log('\n=== Testing Get Reports ===');
  try {
    const result = await makeRequest('GET', '/reports');
    console.log(`✓ Get Reports: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Get Reports: FAIL - ${error.message}`);
    return false;
  }
}

async function testUpdateCar() {
  console.log('\n=== Testing Update Car ===');
  try {
    if (!testCarId) {
      console.log(`⚠ Skipping: Need car ID`);
      return false;
    }

    const updateData = {
      PlateNumber: `UPD${Math.floor(Math.random() * 10000)}`,
      Type: 'SUV',
      Model: 'Toyota Highlander',
      ManufacturingYear: 2021,
      DriverPhone: '9876543210',
      MechanicName: 'Jane Smith'
    };
    const result = await makeRequest('PUT', `/cars/${testCarId}`, updateData);
    console.log(`✓ Update Car: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Update Car: FAIL - ${error.message}`);
    return false;
  }
}

async function testUpdatePayment() {
  console.log('\n=== Testing Update Payment ===');
  try {
    if (!testPaymentId) {
      console.log(`⚠ Skipping: Need payment ID`);
      return false;
    }

    const updateData = {
      AmountPaid: 75000,
      PaymentMethod: 'Card'
    };
    const result = await makeRequest('PUT', `/payments/${testPaymentId}`, updateData);
    console.log(`✓ Update Payment: ${result.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`  Response:`, result.data);
    return result.status === 200;
  } catch (error) {
    console.log(`✗ Update Payment: FAIL - ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         CRPMS API COMPREHENSIVE TEST SUITE                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await waitForServer();
  } catch (error) {
    console.error('✗ Server failed to start:', error.message);
    process.exit(1);
  }

  const results = [];

  results.push(await testHealthCheck());
  results.push(await testRegister());
  results.push(await testLogin());
  results.push(await testGetServices());
  results.push(await testAddCar());
  results.push(await testGetCars());
  results.push(await testAddServiceRecord());
  results.push(await testGetServiceRecords());
  results.push(await testAddPayment());
  results.push(await testGetPayments());
  results.push(await testGetReports());
  results.push(await testUpdateCar());
  results.push(await testUpdatePayment());

  // Summary
  console.log('\n╔══════════════════��═════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\nTotal Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${percentage}%`);

  if (percentage === 100) {
    console.log('\n✓ ALL TESTS PASSED! Database connectivity and API functionality verified.');
  } else if (percentage >= 80) {
    console.log('\n⚠ MOST TESTS PASSED. Some endpoints may need attention.');
  } else {
    console.log('\n✗ MULTIPLE TESTS FAILED. Please review the errors above.');
  }

  process.exit(percentage === 100 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
