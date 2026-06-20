async function run() {
  console.log('1. Attempting to log in as a citizen...');
  
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9876543210',
      password: 'password123',
      role: 'citizen'
    })
  });

  const loginData = await loginRes.json();
  
  if (!loginRes.ok) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }

  console.log('Login successful! Welcome', loginData.user.name);

  const cookies = loginRes.headers.get('set-cookie');
  if (!cookies) {
    console.error('No cookies returned from login');
    process.exit(1);
  }

  console.log('Extracted Set-Cookie header (including HTTPOnly access_token).');

  console.log('\n2. Attempting to access an officer-only route (/api/officer/test) with citizen tokens...');
  
  const testRes = await fetch('http://localhost:3000/api/officer/test', {
    method: 'GET',
    headers: {
      'Cookie': cookies
    }
  });

  console.log(`\nResponse Status: ${testRes.status} ${testRes.statusText}`);
  const testData = await testRes.json();
  console.log('Response Body:', testData);
}

// Wait a bit for Next.js to fully start before running
setTimeout(run, 5000);
