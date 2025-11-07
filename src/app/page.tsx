"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Mic, ChevronRight, X } from "lucide-react";
import { MovieCard } from "@/components/MovieCard";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
}

export default function Home() {
  const { data: session, isPending } = useSession();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);
  const recognitionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        typeText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const typeText = (text: string) => {
    setIsTypingAnimation(true);
    let index = 0;
    setSearchQuery("");

    const typeChar = () => {
      if (index < text.length) {
        setSearchQuery((prev) => prev + text[index]);
        index++;
        typingTimeoutRef.current = setTimeout(typeChar, 50);
      } else {
        setIsTypingAnimation(false);
      }
    };

    typeChar();
  };

  const handleVoiceClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSearchQuery("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const url = searchQuery
          ? `/api/movies?search=${encodeURIComponent(searchQuery)}`
          : "/api/movies?limit=15";
        const response = await fetch(url);
        const data = await response.json();
        setMovies(data);
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-semibold">
              {isPending ? (
                "Hello there! 👋"
              ) : session?.user ? (
                `Hello ${session.user.name || "there"}! 👋`
              ) : (
                "Hello there! 👋"
              )}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
              alt="Profile"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
        </div>

        {/* Greeting */}
        <h2 className="text-white text-3xl font-semibold mb-6 leading-tight">
          What do you
          <br />
          want to watch
          <br />
          today?
        </h2>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={isTypingAnimation}
            className="pl-12 pr-12 py-6 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-full"
          />
          {searchQuery.length > 0 ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-700/50 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          ) : (
            <button
              onClick={handleVoiceClick}
              className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-700/50 rounded-full p-1 transition-colors"
            >
              <Mic
                className={`w-5 h-5 transition-colors ${
                  isListening ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-white"
                }`}
              />
            </button>
          )}
        </div>

        {/* Movie For You Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">
              {searchQuery ? "Search Results" : "Movie For You"}
            </h3>
            <button className="text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

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
          ) : movies.length > 0 ? (
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
          ) : (
            <p className="text-gray-400 text-center py-8">No movies found</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}