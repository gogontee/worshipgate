// components/VideoCard.js
import { useState } from "react";
import { Play, Clock } from "lucide-react";

export default function VideoCard({ video }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-black flex items-center justify-center">
            <Play className="w-10 h-10 text-white/30" />
          </div>
        )}
        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={10} />
            {video.duration}
          </div>
        )}
        <div
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm truncate group-hover:text-amber-400 transition">
          {video.title}
        </h3>
        <p className="text-white/50 text-xs truncate mt-1">{video.views || 0} views</p>
      </div>
    </div>
  );
}