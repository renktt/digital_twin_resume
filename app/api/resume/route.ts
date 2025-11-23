import { vectorHelpers } from '@/lib/vector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const resumeData = await vectorHelpers.getResume();
    
    // Sort by section and order
    const sorted = resumeData.sort((a, b) => {
      if (a.section === b.section) {
        return (a.order || 0) - (b.order || 0);
      }
      return a.section.localeCompare(b.section);
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching resume data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume data' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { section, title, description, dateRange, order } = body;

    const resumeItem = await vectorHelpers.addResumeItem({
      section,
      title,
      description,
      dateRange,
      order: order || 0,
    });

    return NextResponse.json(resumeItem, { status: 201 });
  } catch (error) {
    console.error('Error creating resume item:', error);
    return NextResponse.json(
      { error: 'Failed to create resume item' },
      { status: 500 }
    );
  }
}
