import { NextRequest, NextResponse } from 'next/server';
import { updateUserServerAction, deleteUserServerAction } from '@/app/[locale]/(protected)/account/users/actions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const body = await request.json();
    
    const result = await updateUserServerAction(idNum, body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: (error as any)?.message || 'Failed to update user' },
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
    const idNum = parseInt(id);
    
    const result = await deleteUserServerAction(idNum);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: (error as any)?.message || 'Failed to delete user' },
      { status: 400 }
    );
  }
}
