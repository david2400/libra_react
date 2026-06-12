import { NextRequest, NextResponse } from 'next/server';
import { createPolicyServerAction } from '@/app/[locale]/(protected)/security/policies/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createPolicyServerAction(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { message: (error as any)?.message || 'Failed to create policy' },
      { status: 400 }
    );
  }
}
