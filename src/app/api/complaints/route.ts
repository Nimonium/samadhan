import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import AuditLog from '@/lib/models/AuditLog';
import Department from '@/lib/models/Department';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'citizen') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    // Simplified validation for MVP
    const { title, description, category, priority, district, source, categorySource } = body;

    // Find the department for this category. In MVP, let's map it.
    // E.g., water -> DJB, roads -> PWD, electricity -> Discoms, sanitation/others -> MCD
    let depName = 'MCD';
    if (category === 'water') depName = 'Delhi Jal Board';
    if (category === 'roads') depName = 'PWD';
    if (category === 'electricity') depName = 'Discoms';

    const department = await Department.findOne({ name: depName });

    if (!department) {
      return NextResponse.json({ error: 'Department mapping failed' }, { status: 500 });
    }

    // Generate complaint ID
    const year = new Date().getFullYear();
    const sequence = Math.floor(10000 + Math.random() * 90000); // 5 digit sequence
    const complaintId = `DL-${year}-${sequence}`;

    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + department.slaHours);

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      categorySource: categorySource || 'manual',
      department: department._id,
      priority,
      status: 'submitted',
      citizen: userId,
      district,
      source: source || 'direct',
      slaDeadline,
    });

    await AuditLog.create({
      complaint: complaint._id,
      action: 'created',
      performedBy: userId,
      toStatus: 'submitted',
      note: 'Complaint filed by citizen',
    });

    // Notify assigned officer (by department)
    // Find all officers in this department
    const officers = await User.find({ role: 'officer', department: department._id });
    for (const officer of officers) {
      await Notification.create({
        user: officer._id,
        type: 'routed',
        complaint: complaint._id,
        message: `New complaint ${complaintId} routed to your department.`
      });
    }

    if (priority === 'critical') {
      const cms = await User.find({ role: { $in: ['cm', 'admin'] } });
      for (const cm of cms) {
        await Notification.create({
          user: cm._id,
          type: 'critical_alert',
          complaint: complaint._id,
          message: `CRITICAL Priority Complaint ${complaintId} filed.`
        });
      }

      // Emit socket.io event to internal server
      const { io } = require('socket.io-client');
      const socketUrl = process.env.INTERNAL_SOCKET_URL || 'http://localhost:3001';
      const socket = io(socketUrl);
      socket.emit('internal_critical_alert', { complaintId, title, district });
      // Clean up after small delay
      setTimeout(() => socket.disconnect(), 1000);
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
