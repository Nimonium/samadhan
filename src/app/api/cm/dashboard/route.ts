import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import User from '@/lib/models/User';
import Department from '@/lib/models/Department';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'cm' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Ensure Department model is registered before populate
    await Department.init();

    const complaints = await Complaint.find()
      .populate('department', 'name')
      .lean();

    const now = new Date();

    const totalOpen = complaints.filter(c => ['submitted', 'routed', 'in_progress', 'reopened'].includes(c.status)).length;
    const slaBreaches = complaints.filter(c => 
      ['submitted', 'routed', 'in_progress', 'reopened'].includes(c.status) && 
      new Date(c.slaDeadline) < now
    ).length;

    const resolvedComplaints = complaints.filter(c => c.resolvedAt);
    const avgResolutionTime = resolvedComplaints.length > 0 
      ? Math.round(resolvedComplaints.reduce((acc, c) => acc + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()), 0) / resolvedComplaints.length / (1000 * 60 * 60))
      : 0;

    const officers = await User.find({ role: 'officer' })
      .populate('department', 'name')
      .lean();

    const officerStats = officers.map(officer => {
      const assigned = complaints.filter(c => c.officer?.toString() === officer._id.toString());
      const activeCases = assigned.filter(c => ['submitted', 'routed', 'in_progress', 'reopened'].includes(c.status)).length;
      return {
        _id: officer._id,
        name: officer.name,
        department: (officer.department as any)?.name || 'Unknown',
        integrityScore: officer.integrityScore,
        activeCases
      };
    }).sort((a, b) => b.activeCases - a.activeCases); // Sort by active cases descending

    return NextResponse.json({ 
      kpis: { totalOpen, slaBreaches, avgResolutionTime },
      officerStats
    });
  } catch (error) {
    console.error('CM dashboard fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
