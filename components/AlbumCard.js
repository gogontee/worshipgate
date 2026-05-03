// components/AlbumCard.js
import { Music, Play } from "lucide-react";

export default function AlbumCard({ album }) {
  return (
    <div className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        {album.cover ? (
          <img
            src={album.cover}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-black flex items-center justify-center">
            <Music size={32} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm truncate group-hover:text-amber-400 transition">
          {album.title}
        </h3>
        <p className="text-white/50 text-xs truncate mt-1">
          {album.song_count || 0} tracks • {album.release_year || "2024"}
        </p>
      </div>
    </div>
  );
}