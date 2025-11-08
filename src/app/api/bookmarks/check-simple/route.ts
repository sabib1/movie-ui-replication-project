import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Parse URL and extract query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const movieId = url.searchParams.get('movieId');

    // Debug logging
    console.log('userId:', userId);
    console.log('movieId:', movieId);

    // Validate required parameters
    if (!userId || !movieId) {
      return NextResponse.json(
        { 
          error: 'userId and movieId are required parameters',
          code: 'MISSING_REQUIRED_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Validate movieId is a valid number
    const movieIdNum = parseInt(movieId);
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
    const userData = await db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Check if user exists
    if (userData.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse bookmarks JSON string
    let bookmarks: number[] = [];
    try {
      const bookmarksString = userData[0].bookmarks;
      if (bookmarksString && bookmarksString !== '[]') {
        bookmarks = JSON.parse(bookmarksString);
      }
    } catch (parseError) {
      console.error('Error parsing bookmarks:', parseError);
      bookmarks = [];
    }

    // Check if movieId exists in bookmarks array
    const isBookmarked = bookmarks.includes(movieIdNum);

    // Return result
    return NextResponse.json(
      { isBookmarked },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}