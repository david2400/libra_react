import { NextRequest, NextResponse } from 'next/server';
import { createUserServerAction } from '@/app/[locale]/(protected)/account/users/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createUserServerAction(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: (error as any)?.message || 'Failed to create user' },
      { status: 400 }
    );
  }
}
