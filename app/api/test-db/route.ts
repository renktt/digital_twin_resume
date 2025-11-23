import { NextResponse } from 'next/server';
import { vectorHelpers } from '@/lib/vector';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [resume, projects] = await Promise.all([
      vectorHelpers.getResume(),
      vectorHelpers.getProjects(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        resumeItems: resume.length,
        projects: projects.length,
        resumeSample: resume.slice(0, 2),
        projectsSample: projects.slice(0, 2),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
