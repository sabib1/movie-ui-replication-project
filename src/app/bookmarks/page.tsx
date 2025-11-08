"use client";

import { useState, useEffect } from "react";
import { Bookmark, ArrowLeft } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { BottomNav } from "@/components/BottomNav";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Movie {
  id: number;
  title: string;
  genre: string;
  releaseYear: number;
  director: string;
  rating: number;
  posterImageUrl: string;
  description: string;
  duration: string;
}

export default function BookmarksPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      const currentPath = encodeURIComponent("/bookmarks");
      router.push(`/login?redirect=${currentPath}`);
    }
  }, [session, isPending, router]);

  // Fetch bookmarked movies
  useEffect(() => {
    async function fetchBookmarkedMovies() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Get bookmark IDs from user
        const bookmarksResponse = await fetch(
          `/api/bookmarks?userId=${encodeURIComponent(session.user.id)}`
        );

        if (!bookmarksResponse.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const bookmarksData = await bookmarksResponse.json();
        const bookmarkIds: number[] = bookmarksData.bookmarks || [];

        // If no bookmarks, set empty array and return
        if (bookmarkIds.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        // Fetch all bookmarked movies
        const moviePromises = bookmarkIds.map(async (id) => {
          try {
            const response = await fetch(`/api/movies?id=${id}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch {
            return null;
          }
        });

        const movieResults = await Promise.all(moviePromises);
        const validMovies = movieResults.filter((movie) => movie !== null);

        setMovies(validMovies);
      } catch (err) {
        console.error("Error fetching bookmarked movies:", err);
        setError("Failed to load bookmarked movies. Please try again.");
        toast.error("Failed to load bookmarked movies");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchBookmarkedMovies();
    }
  }, [session?.user?.id]);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if no session (will redirect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-semibold flex items-center gap-2">
              <Bookmark className="w-6 h-6" />
              My Bookmarks
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {loading ? "Loading..." : `${movies.length} ${movies.length === 1 ? "movie" : "movies"}`}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[2/3] rounded-2xl bg-gray-800 animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 bg-gray-800 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No Bookmarks Yet</h3>
            <p className="text-gray-400 text-center mb-6 max-w-xs">
              Start exploring and bookmark your favorite movies to watch later!
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all hover:scale-105 active:scale-95"
            >
              Explore Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                rating={movie.rating}
                posterUrl={movie.posterImageUrl}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
