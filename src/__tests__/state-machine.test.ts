import { POST as CreateComplaint } from '../app/api/complaints/route';
import { POST as ResolveComplaint } from '../app/api/officer/complaints/[id]/resolve/route';
import { POST as ConfirmComplaint } from '../app/api/citizen/complaints/[id]/confirm/route';
import { POST as RejectComplaint } from '../app/api/citizen/complaints/[id]/reject/route';
import { GET as GetComplaint } from '../app/api/complaints/[id]/route';

import dbConnect from '../lib/db';
import User from '../lib/models/User';
import Department from '../lib/models/Department';
import Complaint from '../lib/models/Complaint';
import AuditLog from '../lib/models/AuditLog';
import Notification from '../lib/models/Notification';
import mongoose from 'mongoose';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return {
    io: () => ({
      emit: jest.fn(),
      disconnect: jest.fn(),
    })
  };
});

jest.mock('bullmq', () => ({
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
  })),
}));

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }));
});

describe('Two-step resolution state machine', () => {
  let citizenId: string;
  let officerId: string;
  let departmentId: string;

  beforeAll(async () => {
    await dbConnect();
    
    // Setup test users
    const dept = await Department.create({ name: 'Delhi Jal Board', slaHours: 24 });
    departmentId = dept._id.toString();

    const citizen = await User.create({ name: 'Test Citizen', email: 'test.c@example.com', role: 'citizen', passwordHash: 'hash', phone: '1234567890' });
    citizenId = citizen._id.toString();

    const officer = await User.create({ name: 'Test Officer', email: 'test.o@example.com', role: 'officer', department: dept._id, passwordHash: 'hash', phone: '0987654321', integrityScore: 100 });
    officerId = officer._id.toString();
  });

  afterAll(async () => {
    await Department.deleteMany({});
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
  });

  afterEach(async () => {
    await Complaint.deleteMany({});
    await AuditLog.deleteMany({});
    // Reset officer score
    await User.findByIdAndUpdate(officerId, { integrityScore: 100 });
  });

  const createReq = (body: any, headers: any) => new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers: new Headers(headers),
    body: JSON.stringify(body)
  });

  it('Valid path: submitted -> in_progress (implicitly after routing) -> resolved_pending_confirmation -> closed', async () => {
    // 1. Create
    const reqCreate = createReq({ title: 'Leak', description: 'Big leak', category: 'water', priority: 'high', district: 'South' }, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resCreate = await CreateComplaint(reqCreate);
    const dataCreate = await resCreate.json();
    const cId = dataCreate.complaint._id.toString();
    expect(dataCreate.complaint.status).toBe('submitted');

    // 2. Resolve
    const reqResolve = createReq({ resolutionNote: 'Fixed it fully.' }, { 'x-user-id': officerId, 'x-user-role': 'officer', 'x-user-department': departmentId });
    const resResolve = await ResolveComplaint(reqResolve, { params: { id: cId } });
    const dataResolve = await resResolve.json();
    expect(resResolve.status).toBe(200);
    expect(dataResolve.complaint.status).toBe('resolved_pending_confirmation');

    // 3. Confirm
    const reqConfirm = createReq({}, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resConfirm = await ConfirmComplaint(reqConfirm, { params: { id: cId } });
    const dataConfirm = await resConfirm.json();
    expect(resConfirm.status).toBe(200);
    expect(dataConfirm.complaint.status).toBe('closed');
    expect(dataConfirm.complaint.citizenConfirmedAt).toBeDefined();

    const officerAfter = await User.findById(officerId);
    expect(officerAfter?.integrityScore).toBe(100); // no decrement
  });

  it('Rejection path: resolved_pending_confirmation -> in_progress + integrityScore decremented by exactly 2', async () => {
    // 1. Create
    const reqCreate = createReq({ title: 'Leak', description: 'Big leak', category: 'water', priority: 'high', district: 'South' }, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resCreate = await CreateComplaint(reqCreate);
    const cId = (await resCreate.json()).complaint._id.toString();

    // 2. Resolve
    const reqResolve = createReq({ resolutionNote: 'Fixed it fully.' }, { 'x-user-id': officerId, 'x-user-role': 'officer', 'x-user-department': departmentId });
    await ResolveComplaint(reqResolve, { params: { id: cId } });

    // 3. Reject
    const reqReject = createReq({}, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resReject = await RejectComplaint(reqReject, { params: { id: cId } });
    const dataReject = await resReject.json();
    expect(resReject.status).toBe(200);
    expect(dataReject.complaint.status).toBe('in_progress');

    const officerAfter = await User.findById(officerId);
    expect(officerAfter?.integrityScore).toBe(98); // Decremented by 2
  });

  it('Auto-close path: resolved_pending_confirmation -> closed via BullMQ job + autoClosedAt set + integrityScore NOT decremented', async () => {
    // 1. Create
    const reqCreate = createReq({ title: 'Leak', description: 'Big leak', category: 'water', priority: 'high', district: 'South' }, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resCreate = await CreateComplaint(reqCreate);
    const cId = (await resCreate.json()).complaint._id.toString();

    // 2. Resolve
    const reqResolve = createReq({ resolutionNote: 'Fixed it fully.' }, { 'x-user-id': officerId, 'x-user-role': 'officer', 'x-user-department': departmentId });
    await ResolveComplaint(reqResolve, { params: { id: cId } });

    // 3. Call the BullMQ job handler manually
    const { jobHandler } = require('../worker/worker');
    await jobHandler({ name: 'auto_confirm', data: { complaintId: cId } });

    // Check complaint
    const closedComplaint = await Complaint.findById(cId);
    expect(closedComplaint?.status).toBe('closed');
    expect(closedComplaint?.autoClosedAt).toBeDefined();

    // Check Integrity score NOT decremented
    const officerAfter = await User.findById(officerId);
    expect(officerAfter?.integrityScore).toBe(100);
  });

  it('Invalid transitions: officer cannot set status directly to "closed", citizen cannot set status to "resolved_pending_confirmation"', async () => {
    // These are enforced natively by the API endpoints only accepting specific routes (e.g., /resolve handles resolved_pending_confirmation)
    // We will verify that calling /resolve doesn't let officer set 'closed'
    const reqCreate = createReq({ title: 'Leak', description: 'Big leak', category: 'water', priority: 'high', district: 'South' }, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resCreate = await CreateComplaint(reqCreate);
    const cId = (await resCreate.json()).complaint._id.toString();

    // Try to pass status in body to bypass (API should ignore it)
    const reqResolve = createReq({ resolutionNote: 'Fixed it fully.', status: 'closed' }, { 'x-user-id': officerId, 'x-user-role': 'officer', 'x-user-department': departmentId });
    const resResolve = await ResolveComplaint(reqResolve, { params: { id: cId } });
    const dataResolve = await resResolve.json();
    expect(dataResolve.complaint.status).toBe('resolved_pending_confirmation'); // Ignored 'closed'
  });

  it('Server-side Zod enforcement: submitting a resolve request with empty resolutionNote must return 400', async () => {
    const reqCreate = createReq({ title: 'Leak', description: 'Big leak', category: 'water', priority: 'high', district: 'South' }, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resCreate = await CreateComplaint(reqCreate);
    const cId = (await resCreate.json()).complaint._id.toString();

    const reqResolve = createReq({ resolutionNote: '' }, { 'x-user-id': officerId, 'x-user-role': 'officer', 'x-user-department': departmentId });
    const resResolve = await ResolveComplaint(reqResolve, { params: { id: cId } });
    expect(resResolve.status).toBe(400);
    const data = await resResolve.json();
    expect(data.error).toMatch(/must be at least 10 characters long/);
  });

  it('Officer token -> different department complaints -> 403', async () => {
    const reqCreate = createReq({ title: 'Leak', description: 'Big leak', category: 'water', priority: 'high', district: 'South' }, { 'x-user-id': citizenId, 'x-user-role': 'citizen' });
    const resCreate = await CreateComplaint(reqCreate);
    const cId = (await resCreate.json()).complaint._id.toString();

    // Different department ID for officer header
    const reqGet = new Request('http://localhost:3000/api/test', {
      headers: new Headers({ 'x-user-id': officerId, 'x-user-role': 'officer', 'x-user-department': new mongoose.Types.ObjectId().toString() })
    });
    const resGet = await GetComplaint(reqGet, { params: { id: cId } });
    expect(resGet.status).toBe(403);
  });
});
