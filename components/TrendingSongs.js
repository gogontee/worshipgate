// components/TrendingSongs.js
import { useRef } from "react";
import MusicCard from "./MusicCard";

export default function TrendingSongs({ title, songs }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="mb-12">
      {/* Header with title and arrows */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {songs.map((song, idx) => (
          <div key={idx} className="flex-shrink-0 w-[calc(33.333%-1rem)] sm:w-[calc(20%-1rem)] snap-start">
            <MusicCard song={song} />
          </div>
        ))}
      </div>

      {/* Optional "Show all" link */}
      <div className="flex justify-end mt-2">
        <button className="text-white/50 text-sm hover:text-white transition">Show all</button>
      </div>
    </div>
  );
}