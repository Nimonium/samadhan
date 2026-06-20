import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import AuditLog from '@/lib/models/AuditLog';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const complaintId = params.id;

    const query = complaintId.startsWith('DL-') ? { complaintId } : { _id: complaintId };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'citizen' || complaint.citizen.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (complaint.status !== 'resolved_pending_confirmation') {
      return NextResponse.json({ error: 'Complaint is not pending confirmation' }, { status: 400 });
    }

    const previousStatus = complaint.status;
    complaint.status = 'closed';
    complaint.citizenConfirmedAt = new Date();
    complaint.closedAt = new Date();

    await complaint.save();

    await AuditLog.create({
      complaint: complaint._id,
      action: 'citizen_confirmed',
      performedBy: userId,
      fromStatus: previousStatus,
      toStatus: 'closed',
      note: 'Citizen confirmed the resolution',
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Confirm error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
