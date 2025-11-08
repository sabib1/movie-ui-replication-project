"use client";

import { Heart, Clock, Star, Settings, ChevronRight, Bookmark } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch bookmark count
  useEffect(() => {
    async function fetchBookmarks() {
      if (!session?.user?.id) return;

      try {
        setLoadingBookmarks(true);
        const response = await fetch(
          `/api/bookmarks?userId=${encodeURIComponent(session.user.id)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const bookmarks = data.bookmarks || [];
          setBookmarkCount(bookmarks.length);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoadingBookmarks(false);
      }
    }

    fetchBookmarks();
  }, [session?.user?.id]);

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error("Failed to sign out. Please try again.");
        setIsSigningOut(false);
      } else {
        localStorage.removeItem("bearer_token");
        toast.success("Signed out successfully");
        refetch(); // Update session state
        router.push("/");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      setIsSigningOut(false);
    }
  };

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen bg-black pb-24">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Profile Header Skeleton */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse mb-4" />
            <div className="h-7 w-32 bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#141414] border border-[#2d2d2d] rounded-lg h-[114px] flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse" />
                <div className="h-7 w-12 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Menu Items Skeleton */}
          <div className="flex flex-col gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#141414] border border-[#2d2d2d] rounded-lg h-[58px] flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="w-5 h-5 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Sign Out Button Skeleton */}
          <div className="w-full h-14 rounded-full bg-gray-800 animate-pulse" />
        </div>

        <BottomNav />
      </div>
    );
  }

  // Don't render if no session (will redirect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden mb-4">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Profile"}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <h2 className="text-white text-2xl font-semibold mb-1">
            {session.user.name}
          </h2>
          <p className="text-gray-400 text-sm">{session.user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#141414] border-[#2d2d2d] h-[114px]">
            <CardContent className="flex flex-col items-center justify-center p-0 h-full">
              <Clock className="w-6 h-6 text-yellow-500" />
              <p className="text-white text-xl font-semibold">156</p>
              <p className="text-gray-400 text-xs">Watched</p>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2d2d2d] h-[114px]">
            <CardContent className="flex flex-col items-center justify-center p-0 h-full">
              <Bookmark className="w-6 h-6 text-yellow-500" />
              <p className="text-white text-xl font-semibold">
                {loadingBookmarks ? (
                  <span className="inline-block w-8 h-6 bg-gray-700 animate-pulse rounded" />
                ) : (
                  bookmarkCount
                )}
              </p>
              <p className="text-gray-400 text-xs">Bookmarked</p>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2d2d2d] h-[114px]">
            <CardContent className="flex flex-col items-center justify-center p-0 h-full">
              <Star className="w-6 h-6 text-yellow-500" />
              <p className="text-white text-xl font-semibold">28</p>
              <p className="text-gray-400 text-xs">Reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-4 mb-6">
          <Card 
            onClick={() => router.push("/bookmarks")}
            className="bg-[#141414] border-[#2d2d2d] hover:bg-[#1c1c1c] transition-colors cursor-pointer h-[58px]"
          >
            <CardContent className="flex items-center justify-between p-0 px-4 h-full">
              <div className="flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-gray-400" />
                <span className="text-white">My Bookmark</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2d2d2d] hover:bg-[#1c1c1c] transition-colors cursor-pointer h-[58px]">
            <CardContent className="flex items-center justify-between p-0 px-4 h-full">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-white">Watch History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2d2d2d] hover:bg-[#1c1c1c] transition-colors cursor-pointer h-[58px]">
            <CardContent className="flex items-center justify-between p-0 px-4 h-full">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-white">Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full py-4 rounded-full border-2 border-red-600 text-red-600 font-medium hover:bg-red-600/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSigningOut ? (
            <>
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Signing Out...
            </>
          ) : (
            "Sign Out"
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}