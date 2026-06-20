import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import AuditLog from '@/lib/models/AuditLog';
// Important to import models to ensure they are registered
import '@/lib/models/Department';
import '@/lib/models/User';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const complaintId = params.id; // Could be the custom string ID like 'DL-2024-12345' or MongoDB ObjectId

    // Find complaint by complaintId (string) or _id
    const query = complaintId.startsWith('DL-') ? { complaintId } : { _id: complaintId };
    const complaint = await Complaint.findOne(query)
      .populate('department')
      .populate('citizen', 'name email phone')
      .populate('officer', 'name email phone')
      .lean();

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // RBAC Enforcements
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userDepartment = request.headers.get('x-user-department');

    if (userRole === 'citizen' && complaint.citizen._id.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userRole === 'officer' && complaint.department._id.toString() !== userDepartment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch AuditLogs
    const auditLogs = await AuditLog.find({ complaint: complaint._id })
      .populate('performedBy', 'name role')
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({ complaint, auditLogs });
  } catch (error) {
    console.error('Fetch complaint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
