import { POST as CreateComplaint } from '../app/api/complaints/route';
import { POST as ResolveComplaint } from '../app/api/officer/complaints/[id]/resolve/route';
import { POST as ConfirmComplaint } from '../app/api/citizen/complaints/[id]/confirm/route';
import { POST as RejectComplaint } from '../app/api/citizen/complaints/[id]/reject/route';
import dbConnect from '../lib/db';
import User from '../lib/models/User';
import Department from '../lib/models/Department';
import Complaint from '../lib/models/Complaint';
import AuditLog from '../lib/models/AuditLog';

async function run() {
  await dbConnect();
  
  // Get users
  const citizen = await User.findOne({ role: 'citizen' });
  const djb = await Department.findOne({ name: 'Delhi Jal Board' });
  const officer = await User.findOne({ role: 'officer', department: djb._id });

  console.log(`\n================== PATH A: RESOLVE -> CONFIRM ==================\n`);

  // 1. Citizen creates complaint
  let reqCreate = new Request('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'x-user-id': citizen._id.toString(),
      'x-user-role': citizen.role,
    },
    body: JSON.stringify({
      title: 'Path A Water Leak',
      description: 'Test leak for path A',
      category: 'water',
      priority: 'high',
      district: 'Central',
    })
  });
  
  let res = await CreateComplaint(reqCreate);
  let data = await res.json();
  let complaintId = data.complaint.complaintId;
  let mongoId = data.complaint._id.toString();
  console.log(`[Citizen] Created Complaint ${complaintId}:`, data.complaint.status);

  // 2. Officer Resolves
  let reqResolve = new Request(`http://localhost:3000/api/officer/complaints/${mongoId}/resolve`, {
    method: 'POST',
    headers: {
      'x-user-id': officer._id.toString(),
      'x-user-role': officer.role,
      'x-user-department': officer.department.toString(),
    },
    body: JSON.stringify({
      resolutionNote: 'Fixed the leak completely as requested.'
    })
  });
  res = await ResolveComplaint(reqResolve, { params: { id: mongoId } });
  data = await res.json();
  console.log(`[Officer] Resolved Complaint:`, data.complaint.status);

  // 3. Citizen Confirms
  let reqConfirm = new Request(`http://localhost:3000/api/citizen/complaints/${mongoId}/confirm`, {
    method: 'POST',
    headers: {
      'x-user-id': citizen._id.toString(),
      'x-user-role': citizen.role,
    }
  });
  res = await ConfirmComplaint(reqConfirm, { params: { id: mongoId } });
  data = await res.json();
  console.log(`[Citizen] Confirmed Complaint final status:`, data.complaint.status);
  
  let logsA = await AuditLog.find({ complaint: mongoId }).sort({ timestamp: 1 });
  console.log(`[Audit Logs for Path A]:\n`, logsA.map(l => `- ${l.action}: ${l.note || ''}`).join('\n'));

  console.log(`\n================== PATH B: RESOLVE -> REJECT ==================\n`);

  // 1. Citizen creates complaint B
  let reqCreateB = new Request('http://localhost:3000/api/complaints', {
    method: 'POST',
    headers: {
      'x-user-id': citizen._id.toString(),
      'x-user-role': citizen.role,
    },
    body: JSON.stringify({
      title: 'Path B Water Leak',
      description: 'Test leak for path B',
      category: 'water',
      priority: 'high',
      district: 'Central',
    })
  });
  res = await CreateComplaint(reqCreateB);
  data = await res.json();
  complaintId = data.complaint.complaintId;
  mongoId = data.complaint._id.toString();
  console.log(`[Citizen] Created Complaint ${complaintId}:`, data.complaint.status);

  // 2. Officer Resolves
  let reqResolveB = new Request(`http://localhost:3000/api/officer/complaints/${mongoId}/resolve`, {
    method: 'POST',
    headers: {
      'x-user-id': officer._id.toString(),
      'x-user-role': officer.role,
      'x-user-department': officer.department.toString(),
    },
    body: JSON.stringify({
      resolutionNote: 'Fixed the leak but poorly.'
    })
  });
  res = await ResolveComplaint(reqResolveB, { params: { id: mongoId } });
  data = await res.json();
  console.log(`[Officer] Resolved Complaint:`, data.complaint.status);

  // 3. Citizen Rejects
  let reqReject = new Request(`http://localhost:3000/api/citizen/complaints/${mongoId}/reject`, {
    method: 'POST',
    headers: {
      'x-user-id': citizen._id.toString(),
      'x-user-role': citizen.role,
    }
  });
  res = await RejectComplaint(reqReject, { params: { id: mongoId } });
  data = await res.json();
  console.log(`[Citizen] Rejected Complaint final status:`, data.complaint.status);
  
  let logsB = await AuditLog.find({ complaint: mongoId }).sort({ timestamp: 1 });
  console.log(`[Audit Logs for Path B]:\n`, logsB.map(l => `- ${l.action}: ${l.note || ''}`).join('\n'));

  // 4. Show Integrity Score
  const updatedOfficer = await User.findById(officer._id);
  console.log(`\n[Officer] Integrity Score after Path B rejection: ${updatedOfficer.integrityScore}`);

  process.exit(0);
}

run();
