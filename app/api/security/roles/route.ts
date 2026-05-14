import { NextRequest, NextResponse } from 'next/server';
import { createRoleAction, updateRoleAction, deleteRoleAction } from '@/server/domains/access-control/security/roles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;

    // Import the query function
    const { getRoles } = await import('@/server/domains/access-control/security/roles');
    
    const result = await getRoles({
      page,
      limit,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { message: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createRoleAction(body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { message: result.error?.message || 'Failed to create role' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { message: 'Failed to create role' },
      { status: 500 }
    );
  }
}
