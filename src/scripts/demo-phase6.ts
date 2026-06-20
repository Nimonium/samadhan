import { fetchMCD311Complaints } from '../lib/mcd311';
import { POST as CreateComplaint } from '../app/api/complaints/route';
import dbConnect from '../lib/db';
import User from '../lib/models/User';

async function run() {
  await dbConnect();
  
  console.log('--- DEMO A: MCD311 Fallback ---');
  process.env.MCD311_SIMULATE_FAILURE = 'true';
  try {
    console.log('Attempting to fetch MCD311 complaints with MCD311_SIMULATE_FAILURE=true...');
    await fetchMCD311Complaints();
  } catch (err: any) {
    console.error('MCD311 Fetch Failed gracefully:', err.message);
  }

  // Confirm direct complaints still work
  const citizen = await User.findOne({ role: 'citizen' });
  let reqCreate = new Request('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'x-user-id': citizen._id.toString(),
      'x-user-role': citizen.role,
    },
    body: JSON.stringify({
      title: 'Direct Complaint during MCD311 Outage',
      description: 'Even if the legacy API is down, our direct channels stay up.',
      category: 'roads',
      priority: 'low',
      district: 'South',
    })
  });
  
  let res = await CreateComplaint(reqCreate);
  let data = await res.json();
  console.log('Direct complaint created successfully despite MCD311 failure:', data.complaint.complaintId);


  console.log('\n--- DEMO B: Critical Alert Socket.io Emission ---');
  console.log('Submitting a critical complaint. Check the socket server logs for the emission.');
  
  let reqCritical = new Request('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'x-user-id': citizen._id.toString(),
      'x-user-role': citizen.role,
    },
    body: JSON.stringify({
      title: 'CRITICAL EVENT: Major Riot',
      description: 'Urgent attention required',
      category: 'law_order',
      priority: 'critical',
      district: 'Central',
    })
  });
  
  let resCritical = await CreateComplaint(reqCritical);
  let dataCritical = await resCritical.json();
  console.log('Critical complaint created:', dataCritical.complaint.complaintId);
  
  setTimeout(() => process.exit(0), 2000);
}

run();
