import { NextRequest, NextResponse } from 'next/server';
import { updateUserCompanyAction, deleteUserCompanyAction } from '@/server/domains/access-control/account/user-companies';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; companyId: string }> }
) {
  try {
    const { userId, companyId } = await params;
    const userIdNum = parseInt(userId);
    const companyIdNum = parseInt(companyId);
    const body = await request.json();
    
    const result = await updateUserCompanyAction(userIdNum, companyIdNum, body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to update user-company assignment' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating user-company assignment:', error);
    return NextResponse.json(
      { message: 'Failed to update user-company assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; companyId: string }> }
) {
  try {
    const { userId, companyId } = await params;
    const userIdNum = parseInt(userId);
    const companyIdNum = parseInt(companyId);
    
    const result = await deleteUserCompanyAction(userIdNum, companyIdNum);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to delete user-company assignment' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting user-company assignment:', error);
    return NextResponse.json(
      { message: 'Failed to delete user-company assignment' },
      { status: 500 }
    );
  }
}
