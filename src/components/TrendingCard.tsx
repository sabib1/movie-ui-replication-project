"use client";

import Image from "next/image";
import { Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrendingCardProps {
  title: string;
  rating: number;
  duration: string;
  description: string;
  posterUrl: string;
}

export function TrendingCard({
  title,
  rating,
  duration,
  description,
  posterUrl,
}: TrendingCardProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex gap-4 w-full p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50">
      <div className="relative w-32 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="128px"
        />
      </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
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
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Duration {duration}</span>
        </div>
        <p className="text-gray-400 text-xs line-clamp-2">{description}</p>
        <Button
          className="mt-auto w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full"
          size="sm"
        >
          Watch Now
        </Button>
      </div>
    </div>
  );
}
