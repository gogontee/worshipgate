// components/MusicCard.js
import Link from "next/link";
import { Play } from "lucide-react";

export default function MusicCard({ song }) {
  // Determine featured artists
  const featured = song.feature_artist && Array.isArray(song.feature_artist) && song.feature_artist.length > 0;
  const hasFeatured = featured && !(song.feature_artist.length === 1 && song.feature_artist[0] === song.artist_name);

  return (
    <div className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300">
      {/* Cover image */}
      <div className="relative aspect-square overflow-hidden">
        {song.cover ? (
          <img
            src={song.cover}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-black flex items-center justify-center">
            <Play className="w-8 h-8 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={`/music/${song.id}`}>
            <div className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm truncate group-hover:text-amber-400 transition">
          {song.title}
        </h3>
        <p className="text-white/50 text-xs truncate mt-1">
          {song.artist_name}
          {hasFeatured && (
            <span className="text-white/40"> feat. {song.feature_artist.join(", ")}</span>
          )}
        </p>
        {song.duration && (
          <p className="text-white/40 text-[10px] mt-1">
            {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
          </p>
        )}
      </div>
    </div>
  );
}