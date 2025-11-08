import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Parse URL to get search params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const movieIdStr = url.searchParams.get('movieId');

    console.log('Raw params - userId:', userId, 'movieIdStr:', movieIdStr);

    // Validate required parameters
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId parameter is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    if (!movieIdStr) {
      return NextResponse.json(
        { 
          error: 'movieId parameter is required',
          code: 'MISSING_MOVIE_ID' 
        },
        { status: 400 }
      );
    }

    // Validate movieId is a valid number
    const movieIdNum = parseInt(movieIdStr);
    if (isNaN(movieIdNum)) {
      return NextResponse.json(
        { 
          error: 'movieId must be a valid number',
          code: 'INVALID_MOVIE_ID' 
        },
        { status: 400 }
      );
    }

    // Query user from database
    const userRecord = await db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Check if user exists
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
    const bookmarksField = userRecord[0].bookmarks;
    let bookmarks: number[] = [];

    if (bookmarksField) {
      try {
        const parsed = JSON.parse(bookmarksField);
        bookmarks = Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error('Error parsing bookmarks JSON:', parseError);
        bookmarks = [];
      }
    }

    // Check if movieId exists in bookmarks array
    const isBookmarked = bookmarks.includes(movieIdNum);

    return NextResponse.json(
      { isBookmarked },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}