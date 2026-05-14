import { NextRequest, NextResponse } from 'next/server';
import { updateRoleAction, deleteRoleAction } from '@/server/domains/access-control/security/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getRoleById } = await import('@/server/domains/access-control/security/roles');
    
    const result = await getRoleById(params.id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { message: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const result = await updateRoleAction(params.id, body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to update role' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { message: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteRoleAction(params.id);
    
    if (result.success) {
      return NextResponse.json({ message: 'Role deleted successfully' });
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to delete role' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { message: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
