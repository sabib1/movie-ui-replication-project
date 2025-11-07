"use client";

import { Heart, Clock, Star, Settings, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden mb-4">
            <Image
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
              alt="Profile"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-1">Yunus</h2>
          <p className="text-gray-400 text-sm">yunus@movieapp.com</p>
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
              <Heart className="w-6 h-6 text-yellow-500" />
              <p className="text-white text-xl font-semibold">42</p>
              <p className="text-gray-400 text-xs">Favorites</p>
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
          <Card className="bg-[#141414] border-[#2d2d2d] hover:bg-[#1c1c1c] transition-colors cursor-pointer h-[58px]">
            <CardContent className="flex items-center justify-between p-0 px-4 h-full">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-white">My Watchlist</span>
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
        <button className="w-full py-4 rounded-full border-2 border-red-600 text-red-600 font-medium hover:bg-red-600/10 transition-colors">
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}