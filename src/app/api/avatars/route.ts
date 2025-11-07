import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avatars } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const allAvatars = await db.select().from(avatars);
    
    return NextResponse.json(allAvatars, { status: 200 });
  } catch (error) {
    console.error('GET avatars error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}