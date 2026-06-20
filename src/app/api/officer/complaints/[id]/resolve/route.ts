import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import AuditLog from '@/lib/models/AuditLog';
import Notification from '@/lib/models/Notification';
import { z } from 'zod';

const resolveSchema = z.object({
  resolutionNote: z.string().min(10, 'Resolution note must be at least 10 characters long'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const complaintId = params.id;
    const body = await request.json();

    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message || 'Validation Error' }, { status: 400 });
    }

    const { resolutionNote } = parsed.data;

    const query = complaintId.startsWith('DL-') ? { complaintId } : { _id: complaintId };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userDepartment = request.headers.get('x-user-department');

    if (userRole !== 'officer' || complaint.department.toString() !== userDepartment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (complaint.status === 'resolved_pending_confirmation' || complaint.status === 'closed') {
      return NextResponse.json({ error: 'Complaint is already resolved or closed' }, { status: 400 });
    }

    const previousStatus = complaint.status;
    complaint.status = 'resolved_pending_confirmation';
    complaint.resolutionNote = resolutionNote;
    complaint.resolvedAt = new Date();
    // Assuming the officer resolving is the one assigned
    complaint.officer = userId; 

    await complaint.save();

    await AuditLog.create({
      complaint: complaint._id,
      action: 'resolved',
      performedBy: userId,
      fromStatus: previousStatus,
      toStatus: 'resolved_pending_confirmation',
      note: resolutionNote,
    });

    await Notification.create({
      user: complaint.citizen,
      type: 'resolved_pending_confirmation',
      complaint: complaint._id,
      message: `Your complaint ${complaint.complaintId} has been resolved by the officer. Please confirm.`
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Resolve error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
