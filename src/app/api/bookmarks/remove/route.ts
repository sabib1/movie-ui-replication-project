import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { movieId } = body;

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!movieId) {
      return NextResponse.json(
        { error: 'movieId is required', code: 'MISSING_MOVIE_ID' },
        { status: 400 }
      );
    }

    // Validate movieId is a number
    if (typeof movieId !== 'number' && isNaN(parseInt(movieId))) {
      return NextResponse.json(
        { error: 'movieId must be a valid number', code: 'INVALID_MOVIE_ID' },
        { status: 400 }
      );
    }

    const movieIdNumber = typeof movieId === 'number' ? movieId : parseInt(movieId);

    // Query user from database using authenticated user's ID
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userRecord = existingUser[0];

    // Parse existing bookmarks (handle null/empty as empty array)
    let bookmarks: number[] = [];
    if (userRecord.bookmarks) {
      try {
        const parsed = JSON.parse(userRecord.bookmarks);
        bookmarks = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Error parsing bookmarks JSON:', error);
        bookmarks = [];
      }
    }

    // Filter out the movieId from bookmarks array
    const updatedBookmarks = bookmarks.filter((id) => id !== movieIdNumber);

    // Stringify updated array back to JSON
    const bookmarksJson = JSON.stringify(updatedBookmarks);

    // Update user record with new bookmarks and updatedAt timestamp
    await db
      .update(user)
      .set({
        bookmarks: bookmarksJson,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id));

    // Return updated bookmarks array
    return NextResponse.json(
      { bookmarks: updatedBookmarks },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}