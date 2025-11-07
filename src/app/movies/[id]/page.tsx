"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Star, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/MovieCard";
import { useSession } from "@/lib/auth-client";

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
  downloadLink: string;
}

export default function MovieDetailPage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id as string;
  const { data: session, isPending } = useSession();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie details
        const movieResponse = await fetch(`/api/movies/${movieId}`);
        if (!movieResponse.ok) {
          throw new Error("Movie not found");
        }
        const movieData = await movieResponse.json();
        setMovie(movieData);

        // Fetch suggestions (other movies)
        const suggestionsResponse = await fetch("/api/movies?limit=6");
        const suggestionsData = await suggestionsResponse.json();
        // Filter out the current movie
        const filtered = suggestionsData.filter(
          (m: Movie) => m.id !== parseInt(movieId)
        );
        setSuggestions(filtered.slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movie");
      } finally {
        setLoading(false);
      }
    }

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  const handleDownload = () => {
    if (movie?.downloadLink) {
      // Create a temporary anchor element to trigger download in current page
      const link = document.createElement('a');
      link.href = movie.downloadLink;
      link.download = `${movie.title}.mp4`; // Optional: suggest filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBookmarkClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if user is authenticated
    if (!session?.user) {
      // Prevent the checkbox from being checked
      e.preventDefault();
      e.target.checked = false;
      
      // Redirect to login with current page as redirect URL
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // If authenticated, allow the bookmark action
    // TODO: Implement actual bookmark functionality with backend
  };

  const fullStars = Math.floor(movie?.rating || 0);
  const hasHalfStar = (movie?.rating || 0) % 1 !== 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Loading skeleton */}
          <div className="space-y-6">
            <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse" />
            <div className="flex gap-4">
              <div className="w-40 h-[230px] rounded-3xl bg-gray-800 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-gray-800 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-red-400 text-lg mb-4">
            {error || "Movie not found"}
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Bookmark button styles */
        .ui-bookmark {
          --icon-size: 24px;
          --icon-secondary-color: rgb(77, 77, 77);
          --icon-hover-color: rgb(97, 97, 97);
          --icon-primary-color: gold;
          --icon-circle-border: 1px solid var(--icon-primary-color);
          --icon-circle-size: 35px;
          --icon-anmt-duration: 0.3s;
        }

        .ui-bookmark input {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          display: none;
        }

        .ui-bookmark .bookmark {
          width: var(--icon-size);
          height: auto;
          fill: var(--icon-secondary-color);
          cursor: pointer;
          -webkit-transition: 0.2s;
          -o-transition: 0.2s;
          transition: 0.2s;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          justify-content: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          position: relative;
          -webkit-transform-origin: top;
          -ms-transform-origin: top;
          transform-origin: top;
        }

        .bookmark::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          -webkit-box-shadow: 0 30px 0 -4px var(--icon-primary-color),
            30px 0 0 -4px var(--icon-primary-color),
            0 -30px 0 -4px var(--icon-primary-color),
            -30px 0 0 -4px var(--icon-primary-color),
            -22px 22px 0 -4px var(--icon-primary-color),
            -22px -22px 0 -4px var(--icon-primary-color),
            22px -22px 0 -4px var(--icon-primary-color),
            22px 22px 0 -4px var(--icon-primary-color);
          box-shadow: 0 30px 0 -4px var(--icon-primary-color),
            30px 0 0 -4px var(--icon-primary-color),
            0 -30px 0 -4px var(--icon-primary-color),
            -30px 0 0 -4px var(--icon-primary-color),
            -22px 22px 0 -4px var(--icon-primary-color),
            -22px -22px 0 -4px var(--icon-primary-color),
            22px -22px 0 -4px var(--icon-primary-color),
            22px 22px 0 -4px var(--icon-primary-color);
          border-radius: 50%;
          -webkit-transform: scale(0);
          -ms-transform: scale(0);
          transform: scale(0);
        }

        .bookmark::before {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: var(--icon-circle-border);
          opacity: 0;
        }

        .ui-bookmark:hover .bookmark {
          fill: var(--icon-hover-color);
        }

        .ui-bookmark input:checked + .bookmark::after {
          -webkit-animation: circles var(--icon-anmt-duration)
            cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          animation: circles var(--icon-anmt-duration)
            cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          -webkit-animation-delay: var(--icon-anmt-duration);
          animation-delay: var(--icon-anmt-duration);
        }

        .ui-bookmark input:checked + .bookmark {
          fill: var(--icon-primary-color);
          -webkit-animation: bookmark var(--icon-anmt-duration) forwards;
          animation: bookmark var(--icon-anmt-duration) forwards;
          -webkit-transition-delay: 0.3s;
          -o-transition-delay: 0.3s;
          transition-delay: 0.3s;
        }

        .ui-bookmark input:checked + .bookmark::before {
          -webkit-animation: circle var(--icon-anmt-duration)
            cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          animation: circle var(--icon-anmt-duration)
            cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          -webkit-animation-delay: var(--icon-anmt-duration);
          animation-delay: var(--icon-anmt-duration);
        }

        @-webkit-keyframes bookmark {
          50% {
            -webkit-transform: scaleY(0.6);
            transform: scaleY(0.6);
          }
          100% {
            -webkit-transform: scaleY(1);
            transform: scaleY(1);
          }
        }

        @keyframes bookmark {
          50% {
            -webkit-transform: scaleY(0.6);
            transform: scaleY(0.6);
          }
          100% {
            -webkit-transform: scaleY(1);
            transform: scaleY(1);
          }
        }

        @-webkit-keyframes circle {
          from {
            width: 0;
            height: 0;
            opacity: 0;
          }
          90% {
            width: var(--icon-circle-size);
            height: var(--icon-circle-size);
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes circle {
          from {
            width: 0;
            height: 0;
            opacity: 0;
          }
          90% {
            width: var(--icon-circle-size);
            height: var(--icon-circle-size);
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @-webkit-keyframes circles {
          from {
            -webkit-transform: scale(0);
            transform: scale(0);
          }
          40% {
            opacity: 1;
          }
          to {
            -webkit-transform: scale(0.8);
            transform: scale(0.8);
            opacity: 0;
          }
        }

        @keyframes circles {
          from {
            -webkit-transform: scale(0);
            transform: scale(0);
          }
          40% {
            opacity: 1;
          }
          to {
            -webkit-transform: scale(0.8);
            transform: scale(0.8);
            opacity: 0;
          }
        }

        /* Download button glow animations */
        @keyframes border-glow-translate {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        @keyframes border-glow-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes star-rotate {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(180deg);
          }
        }

        @keyframes star-shine {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-12">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Back Button and Bookmark Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-[14px] bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <label className="ui-bookmark">
              <input type="checkbox" onChange={handleBookmarkClick} />
              <div className="bookmark">
                <svg viewBox="0 0 32 32">
                  <g>
                    <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
                  </g>
                </svg>
              </div>
            </label>
          </div>

          {/* Movie Info - Horizontal Layout */}
          <div className="flex gap-4 mb-6">
            {/* Movie Poster - Left Side */}
            <div className="relative w-40 h-[230px] rounded-3xl overflow-hidden flex-shrink-0 shadow-2xl">
              <Image
                src={movie.posterImageUrl}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Movie Details - Right Side */}
            <div className="flex-1 flex flex-col justify-between space-y-3">
              {/* Title */}
              <h1 className="text-white text-2xl font-bold leading-tight">
                {movie.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < fullStars
                          ? "fill-yellow-400 text-yellow-400"
                          : i === fullStars && hasHalfStar
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "fill-transparent text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold text-sm">{movie.rating}</span>
              </div>

              {/* Release Date */}
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{movie.releaseYear}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{movie.duration}</span>
              </div>

              {/* Genre */}
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-xs font-medium">
                  {movie.genre}
                </span>
              </div>

              {/* Director */}
              <div>
                <p className="text-gray-400 text-xs">Directed by</p>
                <p className="text-white font-medium text-sm">{movie.director}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-2">Synopsis</h3>
            <p className="text-gray-400 leading-relaxed">{movie.description}</p>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="group relative dark:bg-neutral-800 bg-neutral-200 rounded-full p-px overflow-hidden w-full"
          >
            <span className="absolute inset-0 rounded-full overflow-hidden">
              <span className="inset-0 absolute pointer-events-none select-none">
                <span
                  className="block -translate-x-1/2 -translate-y-1/3 size-24 blur-xl"
                  style={{ background: "linear-gradient(135deg, rgb(122, 105, 249), rgb(242, 99, 120), rgb(245, 131, 63))" }}
                ></span>
              </span>
            </span>

            <span
              className="inset-0 absolute pointer-events-none select-none"
              style={{ animation: "10s ease-in-out 0s infinite alternate none running border-glow-translate" }}
            >
              <span
                className="block z-0 h-full w-12 blur-xl -translate-x-1/2 rounded-full"
                style={{
                  animation: "10s ease-in-out 0s infinite alternate none running border-glow-scale",
                  background: "linear-gradient(135deg, rgb(122, 105, 249), rgb(242, 99, 120), rgb(245, 131, 63))"
                }}
              ></span>
            </span>

            <span className="flex items-center justify-center gap-1 relative z-[1] dark:bg-neutral-950/90 bg-neutral-50/90 rounded-full py-2 px-4 w-full">
              <span className="bg-gradient-to-b dark:from-white dark:to-white/50 from-neutral-950 to-neutral-950/50 bg-clip-text text-[20px] text-transparent group-hover:scale-105 transition transform-gpu">
                Download
              </span>
            </span>
          </button>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-12">
              <h3 className="text-white text-xl font-semibold mb-4">
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {suggestions.map((suggestedMovie) => (
                  <MovieCard
                    key={suggestedMovie.id}
                    id={suggestedMovie.id}
                    title={suggestedMovie.title}
                    rating={suggestedMovie.rating}
                    posterUrl={suggestedMovie.posterImageUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}