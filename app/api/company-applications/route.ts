import { NextRequest, NextResponse } from 'next/server';
import { createCompanyApplicationAction } from '@/server/domains/access-control/security/company_applications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCompanyApplicationAction(body);
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 });
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to create company application' },
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Import the query function
    const { getCompanyApplications } = await import('@/server/domains/access-control/security/company_applications');
    
    const result = await getCompanyApplications(params);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
