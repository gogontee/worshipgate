// components/AudioCard.js
import { useState } from "react";
import Link from "next/link";
import { Play, Pause, MoreHorizontal } from "lucide-react";

export default function AudioCard({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Determine featured artists
  const featured = track.feature_artist && Array.isArray(track.feature_artist) && track.feature_artist.length > 0;
  const hasFeatured = featured && !(track.feature_artist.length === 1 && track.feature_artist[0] === track.artist_name);

  const handlePlayPause = (e) => {
    e.preventDefault();
    setIsPlaying(!isPlaying);
    // You can integrate an actual audio player here, or rely on the link
  };

  return (
    <div className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300">
      {/* Cover image */}
      <div className="relative aspect-square overflow-hidden">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-black flex items-center justify-center">
            <Play className="w-8 h-8 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={`/music/${track.id}`}>
            <div className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate group-hover:text-amber-400 transition">
              {track.title}
            </h3>
            <p className="text-white/50 text-xs truncate mt-1">
              {track.artist_name}
              {hasFeatured && (
                <span className="text-white/40"> feat. {track.feature_artist.join(", ")}</span>
              )}
            </p>
            {track.duration && (
              <p className="text-white/40 text-[10px] mt-1">
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white/50 hover:text-amber-400 transition"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}