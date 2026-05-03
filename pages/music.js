// pages/music.js
import { supabase } from "../lib/supabaseClient";
import MusicHeader from "../components/MusicHeader";
import BottomTab from "../components/BottomTab";
import MusicCard from "../components/MusicCard";
import Link from "next/link";

export default function Music({ songs }) {
  return (
    <main className="bg-black min-h-screen text-white p-2 md:p-3">
      <MusicHeader />

      <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 mt-3">
        {/* Sidebar (unchanged) */}
        <div className="bg-[#121212] rounded-2xl p-5 h-fit hidden lg:block">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Your Library</h2>
            <button className="w-10 h-10 rounded-full bg-white/5 text-2xl">+</button>
          </div>
          <div className="bg-[#1d1d1d] rounded-2xl p-5 mb-10">
            <h3 className="text-xl font-bold mb-2">Create your first playlist</h3>
            <p className="text-white/70 mb-6 text-sm">It's easy, we'll help you</p>
            <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">Create playlist</button>
          </div>
          <div className="text-white/50 flex flex-wrap gap-3 text-xs leading-6">
            <span>Legal</span>
            <span>Privacy Policy</span>
            <span>Cookies</span>
            <span>Accessibility</span>
            <span>Support</span>
          </div>
        </div>

        {/* Main grid */}
        <div className="bg-gradient-to-b from-[#1f1f1f] to-[#121212] rounded-2xl p-6 md:p-8 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Music</h2>
            <Link href="/trending" className="text-sm text-white/50 hover:text-amber-400 transition">
              Show all
            </Link>
          </div>
          {songs.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {songs.map((song) => (
                <MusicCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-12">No music available yet.</p>
          )}
        </div>
      </section>

      <BottomTab />
    </main>
  );
}

export async function getServerSideProps() {
  // Fetch published songs, ordered by most plays (trending)
  const { data: songs, error } = await supabase
    .from("music")
    .select("*")
    .eq("status", "published")
    .order("play_counts", { ascending: false, nullsLast: true }) // most plays first
    .order("created_at", { ascending: false }); // secondary: newest first if same plays

  if (error) {
    console.error("Error fetching music:", error);
  }

  // Optional debug: if no songs, check if any rows exist
  if (!songs || songs.length === 0) {
    const { data: allSongs, error: allError } = await supabase
      .from("music")
      .select("id, title, status")
      .limit(5);
    if (allError) console.error("All songs error:", allError);
    else if (allSongs?.length > 0) {
      console.log("Music rows exist but none have status='published'. Current statuses:", allSongs.map(s => s.status));
    }
  }

  return { props: { songs: songs || [] } };
}