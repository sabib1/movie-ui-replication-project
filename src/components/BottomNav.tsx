"use client";

import { Home, Flame, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-border/50 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around px-8 py-4">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === "/" ? "text-white" : "text-gray-500"
          }`}
        >
          <Home className="w-6 h-6" fill={pathname === "/" ? "white" : "none"} />
        </Link>
        <Link
          href="/trending"
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === "/trending" ? "text-white" : "text-gray-500"
          }`}
        >
          <Flame className="w-6 h-6" fill={pathname === "/trending" ? "white" : "none"} />
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === "/profile" ? "text-white" : "text-gray-500"
          }`}
        >
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}
