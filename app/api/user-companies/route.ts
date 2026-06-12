import { NextRequest, NextResponse } from 'next/server';
import { createUserCompanyAction } from '@/server/domains/access-control/account/user-companies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createUserCompanyAction(body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to create user-company assignment' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating user-company assignment:', error);
    return NextResponse.json(
      { message: 'Failed to create user-company assignment' },
      { status: 500 }
    );
  }
}
