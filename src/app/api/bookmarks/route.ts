import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId is present
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Query user from database
    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Return 404 if user not found
    if (userRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse bookmarks JSON string (handle null/empty as empty array)
    let bookmarks: number[] = [];
    const bookmarksData = (userRecord[0] as any).bookmarks;
    
    if (bookmarksData) {
      try {
        bookmarks = JSON.parse(bookmarksData);
        // Ensure it's an array
        if (!Array.isArray(bookmarks)) {
          bookmarks = [];
        }
      } catch (parseError) {
        // If JSON parsing fails, return empty array
        console.error('Failed to parse bookmarks JSON:', parseError);
        bookmarks = [];
      }
    }

    // Return bookmarks array
    return NextResponse.json({ bookmarks }, { status: 200 });

  } catch (error) {
    console.error('GET bookmarks error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}