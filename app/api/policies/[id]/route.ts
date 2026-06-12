import { NextRequest, NextResponse } from 'next/server';
import { updatePolicyServerAction, deletePolicyServerAction } from '@/app/[locale]/(protected)/security/policies/actions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const result = await updatePolicyServerAction(id, body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { message: (error as any)?.message || 'Failed to update policy' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await deletePolicyServerAction(id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { message: (error as any)?.message || 'Failed to delete policy' },
      { status: 400 }
    );
  }
}
