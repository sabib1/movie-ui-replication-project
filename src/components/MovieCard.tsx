"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

interface MovieCardProps {
  id: number;
  title: string;
  rating: number;
  posterUrl: string;
}

export function MovieCard({ id, title, rating, posterUrl }: MovieCardProps) {
  const router = useRouter();
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  const handleClick = () => {
    router.push(`/movies/${id}`);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="flex flex-col gap-2 w-full cursor-pointer group"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <h3 className="font-medium text-sm text-white truncate">{title}</h3>
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
    </div>
  );
}