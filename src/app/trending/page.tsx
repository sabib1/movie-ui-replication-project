"use client";

import { useState, useEffect } from "react";
import { Search, Mic, Flame } from "lucide-react";
import { TrendingCard } from "@/components/TrendingCard";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";

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

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const url = searchQuery
          ? `/api/movies?search=${encodeURIComponent(searchQuery)}`
          : "/api/movies?limit=10";
        const response = await fetch(url);
        const data = await response.json();
        // Sort by rating to show trending (highest rated first)
        const sortedMovies = data.sort((a: Movie, b: Movie) => b.rating - a.rating);
        setMovies(sortedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-6 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-full"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <Mic className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Trending Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <h3 className="text-yellow-400 text-xl font-semibold">Trending</h3>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-800/30">
                  <div className="w-32 h-48 rounded-xl bg-gray-700 animate-pulse" />
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="h-5 bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <div className="flex flex-col gap-4">
              {movies.map((movie) => (
                <TrendingCard
                  key={movie.id}
                  title={movie.title}
                  rating={movie.rating}
                  duration={movie.duration}
                  description={movie.description}
                  posterUrl={movie.posterImageUrl}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No movies found</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
