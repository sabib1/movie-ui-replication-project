import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { movies } from '@/db/schema';
import { eq, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single movie by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID'
          },
          { status: 400 }
        );
      }

      const movie = await db.select()
        .from(movies)
        .where(eq(movies.id, parseInt(id)))
        .limit(1);

      if (movie.length === 0) {
        return NextResponse.json(
          { 
            error: 'Movie not found',
            code: 'MOVIE_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(movie[0], { status: 200 });
    }

    // List movies with search and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(movies);

    if (search) {
      query = query.where(like(movies.title, `%${search}%`));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

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