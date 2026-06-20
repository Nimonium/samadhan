import { NextResponse } from 'next/server';
import { classifyComplaint } from '@/lib/classifier';

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title && !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const result = classifyComplaint(title || '', description || '');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json({ error: 'Failed to classify complaint' }, { status: 500 });
  }
}
