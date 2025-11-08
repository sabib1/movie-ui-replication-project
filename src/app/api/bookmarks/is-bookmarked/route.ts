import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const movieId = url.searchParams.get('movieId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!movieId) {
      return NextResponse.json(
        { error: 'movieId is required', code: 'MISSING_MOVIE_ID' },
        { status: 400 }
      );
    }

    const parsedMovieId = parseInt(movieId);
    if (isNaN(parsedMovieId)) {
      return NextResponse.json(
        { error: 'movieId must be a valid number', code: 'INVALID_MOVIE_ID' },
        { status: 400 }
      );
    }

    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const bookmarksField = userRecord[0].bookmarks;

    let bookmarks: number[] = [];
    try {
      if (bookmarksField) {
        bookmarks = JSON.parse(bookmarksField);
      }
    } catch (error) {
      bookmarks = [];
    }

    if (!Array.isArray(bookmarks)) {
      bookmarks = [];
    }

    const isBookmarked = bookmarks.includes(parsedMovieId);

    return NextResponse.json({ isBookmarked }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}