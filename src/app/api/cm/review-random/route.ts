import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Complaint from '@/lib/models/Complaint';
import '@/lib/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'cm' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const closedComplaints = await Complaint.find({ status: 'closed' })
      .populate('officer', 'name')
      .lean();

    // Shuffle and pick top 3
    const shuffled = closedComplaints.sort(() => 0.5 - Math.random());
    const sampled = shuffled.slice(0, 3);

    return NextResponse.json({ complaints: sampled });
  } catch (error) {
    console.error('Random review fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
