import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import Department from '@/lib/models/Department';
import User from '@/lib/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const userRole = request.headers.get('x-user-role');
    const userDepartment = request.headers.get('x-user-department');

    if (userRole !== 'officer' || !userDepartment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure models are registered before populate calls
    await Department.init();
    await User.init();

    const complaints = await Complaint.find({ department: userDepartment })
      .populate('citizen', 'name email phone')
      .populate('officer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    const userId = request.headers.get('x-user-id');
    const officer = await User.findById(userId).lean();

    const metrics = {
      open: complaints.filter(c => ['submitted', 'routed', 'in_progress'].includes(c.status)).length,
      resolved: complaints.filter(c => ['resolved_pending_confirmation', 'closed'].includes(c.status)).length,
      reopened: complaints.filter(c => c.status === 'reopened').length,
    };

    return NextResponse.json({ complaints, metrics, integrityScore: officer?.integrityScore || 100 });
  } catch (error) {
    console.error('Officer dashboard fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
