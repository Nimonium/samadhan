import connectToDatabase from '../lib/db';
import Department from '../lib/models/Department';
import User from '../lib/models/User';
import Complaint from '../lib/models/Complaint';
import AuditLog from '../lib/models/AuditLog';
import Notification from '../lib/models/Notification';
import bcrypt from 'bcryptjs';

const DEPARTMENTS = [
  { name: 'Delhi Jal Board', slaHours: 48 },
  { name: 'PWD', slaHours: 72 },
  { name: 'MCD', slaHours: 36 },
  { name: 'Discoms', slaHours: 24 },
];

const DISTRICTS = ['South Delhi', 'New Delhi', 'Dwarka', 'Rohini', 'East Delhi', 'North Delhi'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function runSeed() {
  await connectToDatabase();
  console.log('Connected to DB. Clearing existing data...');

  // Idempotent: clear collections
  await Department.deleteMany({});
  await User.deleteMany({});
  await Complaint.deleteMany({});
  // Use native deleteMany to bypass schema pre-hooks for AuditLog during seeding
  await AuditLog.collection.deleteMany({});
  await Notification.deleteMany({});

  console.log('Seeding Departments...');
  const deptDocs = await Department.insertMany(DEPARTMENTS);

  console.log('Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash('password123', salt);

  const cmUser = await User.create({
    name: 'CM Office Chief',
    phone: '9000000001',
    passwordHash: passHash,
    role: 'cm',
  });

  const citizens = await User.insertMany([
    { name: 'Ravi Kumar', phone: '9800000001', passwordHash: passHash, role: 'citizen', district: 'South Delhi' },
    { name: 'Priya Sharma', phone: '9800000002', passwordHash: passHash, role: 'citizen', district: 'Dwarka' },
    { name: 'Amit Singh', phone: '9800000003', passwordHash: passHash, role: 'citizen', district: 'Rohini' },
    { name: 'Neha Gupta', phone: '9800000004', passwordHash: passHash, role: 'citizen', district: 'New Delhi' },
  ]);

  const officers = [];
  const admins = [];

  for (const dept of deptDocs) {
    const admin = await User.create({
      name: `${dept.name} Admin`,
      phone: `910000${deptDocs.indexOf(dept)}00`,
      passwordHash: passHash,
      role: 'admin',
      department: dept._id,
    });
    admins.push(admin);

    for (let i = 1; i <= 3; i++) {
      const officer = await User.create({
        name: `${dept.name} Officer ${i}`,
        phone: `920000${deptDocs.indexOf(dept)}0${i}`,
        passwordHash: passHash,
        role: 'officer',
        department: dept._id,
      });
      officers.push(officer);
    }
  }

  // Assign officers to departments (bidirectional ref)
  for (const dept of deptDocs) {
    const deptOfficers = officers.filter(o => o.department.toString() === dept._id.toString());
    dept.officers = deptOfficers.map(o => o._id as any);
    await dept.save();
  }

  console.log('Seeding Complaints...');

  const complaintPromises = [];
  
  // Helpers to generate specific types of complaints
  const generateComplaintId = (seq: number) => `DL-2026-${String(seq).padStart(5, '0')}`;
  
  let seq = 1;
  const now = new Date();

  const addAuditLog = async (complaintId: any, action: string, fromStatus?: string, toStatus?: string, performedBy?: any) => {
    // We use collection.insertOne to bypass the pre-hooks for append-only simulation if needed,
    // actually insertOne or create() doesn't trigger update hooks, so Model.create() is fine.
    await AuditLog.create({
      complaint: complaintId,
      action,
      fromStatus,
      toStatus,
      performedBy,
      timestamp: new Date(now.getTime() - Math.random() * 100000), // slightly in past
    });
  };

  // Generate 60 complaints total
  for (let i = 0; i < 60; i++) {
    const citizen = getRandomItem(citizens);
    const department = getRandomItem(deptDocs);
    const deptOfficers = officers.filter(o => o.department.toString() === department._id.toString());
    const officer = getRandomItem(deptOfficers);
    
    // Status distribution
    let status = 'closed';
    if (i < 15) status = 'submitted'; // 15
    else if (i < 25) status = 'routed'; // 10
    else if (i < 45) status = 'in_progress'; // 20
    else if (i < 50) status = 'resolved_pending_confirmation'; // 5 (fulfills the >= 3 requirement)
    else if (i < 55) status = 'closed'; // 5
    else status = 'reopened'; // 5

    // SLA Breach requirement: >= 5 complaints past SLA deadline
    // We'll make the first 6 'in_progress' complaints breached
    let slaDeadline = new Date(now.getTime() + department.slaHours * 60 * 60 * 1000);
    if (status === 'in_progress' && i >= 25 && i < 31) {
      slaDeadline = new Date(now.getTime() - 2 * 60 * 60 * 1000); // breached 2 hours ago
    }

    // MCD311 requirement: >= 4 complaints with source "mcd311"
    let source = 'direct';
    let mcd311Ref = undefined;
    if (i >= 10 && i < 15) { // 5 mcd311 complaints
      source = 'mcd311';
      mcd311Ref = `MCD-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const priority = getRandomItem(['low', 'medium', 'high', 'critical']);
    
    const complaintData: any = {
      complaintId: generateComplaintId(seq++),
      title: `Issue regarding ${department.name} - ${i}`,
      description: `This is a detailed description for complaint ${i} assigned to ${department.name}.`,
      category: getRandomItem(['roads', 'water', 'electricity', 'sanitation', 'law_order', 'other']),
      categorySource: getRandomItem(['ai_suggested', 'manual']),
      department: department._id,
      priority,
      status,
      citizen: citizen._id,
      district: getRandomItem(DISTRICTS),
      geo: { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 },
      evidenceUrls: ['https://via.placeholder.com/150'],
      source,
      mcd311Ref,
      slaDeadline,
    };

    if (status !== 'submitted') {
      complaintData.officer = officer._id;
    }

    if (status === 'resolved_pending_confirmation' || status === 'closed') {
      complaintData.resolutionNote = `Resolved issue for ${complaintData.title}.`;
      complaintData.resolvedAt = new Date();
    }
    
    if (status === 'closed') {
      complaintData.citizenConfirmedAt = new Date();
      complaintData.closedAt = new Date();
    }

    const c = await Complaint.create(complaintData);

    // Create Audit Logs representing the lifecycle
    await addAuditLog(c._id, 'submitted', null, 'submitted', citizen._id);

    if (status !== 'submitted') {
      await addAuditLog(c._id, 'routed', 'submitted', 'routed', undefined); // auto or admin
      if (status !== 'routed') {
        await addAuditLog(c._id, 'status_changed', 'routed', 'in_progress', officer._id);
        
        if (status === 'resolved_pending_confirmation' || status === 'closed') {
          await addAuditLog(c._id, 'resolution_submitted', 'in_progress', 'resolved_pending_confirmation', officer._id);
        }
        if (status === 'closed') {
          await addAuditLog(c._id, 'citizen_confirmed', 'resolved_pending_confirmation', 'closed', citizen._id);
        }
        if (status === 'reopened') {
          await addAuditLog(c._id, 'resolution_submitted', 'in_progress', 'resolved_pending_confirmation', officer._id);
          await addAuditLog(c._id, 'citizen_rejected', 'resolved_pending_confirmation', 'reopened', citizen._id);
        }
      }
    }
  }

  console.log('Seeding Complete!');
  
  // Show counts
  const dCount = await Department.countDocuments();
  const uCount = await User.countDocuments();
  const cCount = await Complaint.countDocuments();
  const aCount = await AuditLog.countDocuments();
  const nCount = await Notification.countDocuments();
  
  console.log(`\n--- DATABASE COUNTS ---`);
  console.log(`Departments: ${dCount}`);
  console.log(`Users: ${uCount}`);
  console.log(`Complaints: ${cCount}`);
  console.log(`AuditLogs: ${aCount}`);
  console.log(`Notifications: ${nCount}`);
  console.log(`-----------------------\n`);

  process.exit(0);
}

runSeed().catch(console.error);
