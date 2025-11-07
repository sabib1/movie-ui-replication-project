import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { movies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Validate ID is present and numeric
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid movie ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const movieId = parseInt(id);

    // Query database for the movie
    const movie = await db.select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    // Check if movie was found
    if (movie.length === 0) {
      return NextResponse.json(
        { 
          error: 'Movie not found',
          code: 'MOVIE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Return the movie object
    return NextResponse.json(movie[0], { status: 200 });

  } catch (error) {
    console.error('GET movie by ID error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}