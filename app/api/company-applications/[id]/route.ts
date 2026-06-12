import { NextRequest, NextResponse } from 'next/server';
import { updateCompanyApplicationAction } from '@/server/domains/access-control/security/company_applications';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { message: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await updateCompanyApplicationAction(idNum, body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to update company application' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { message: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Import the query function
    const { getCompanyApplicationById } = await import('@/server/domains/access-control/security/company_applications');
    
    const result = await getCompanyApplicationById(idNum);
    
    if (!result) {
      return NextResponse.json(
        { message: 'Company application not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
