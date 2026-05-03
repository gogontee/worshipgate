// pages/[slug].js
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AudioCard from "../components/AudioCard";
import MusicHeader from "../components/MusicHeader";
import BottomTab from "../components/BottomTab";
import {
  MapPin,
  Globe,
  Music,
  Users,
  Headphones,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Share2,
  CheckCircle2,
} from "lucide-react";

export default function PublicProfile({ artist, music, debug }) {
  const [activeTab, setActiveTab] = useState("sounds");
  const [shareTooltip, setShareTooltip] = useState(false);

  if (!artist) {
    return (
      <>
        <MusicHeader />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Profile not found
        </div>
        <BottomTab />
      </>
    );
  }

  const totalPlays = music.reduce((sum, item) => sum + (item.play_counts || 0), 0);
  const totalListeners = music.reduce((sum, item) => sum + (item.listeners || 0), 0);
  const totalTracks = music.length;

  const socialIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    youtube: Youtube,
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  return (
    <>
      <MusicHeader />
      <main className="min-h-screen bg-black text-white pb-24">
        {/* Hero banner */}
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
          {artist.cover_image_url ? (
            <img
              src={artist.cover_image_url}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Profile content */}
        <div className="max-w-4xl mx-auto px-4 -mt-16 md:-mt-20 relative z-10 text-center">
          <div className="relative inline-block mx-auto">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl">
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-black flex items-center justify-center text-3xl font-black">
                  {artist.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-black rounded-full">
              <CheckCircle2 size={20} className="text-amber-500 fill-black" />
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold">{artist.name}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-white/50 text-xs mt-2">
              <div className="flex items-center gap-1"><Headphones size={12} /> {totalPlays.toLocaleString()} plays</div>
              <div className="flex items-center gap-1"><Users size={12} /> {totalListeners.toLocaleString()} listeners</div>
              <div className="flex items-center gap-1"><Music size={12} /> {totalTracks} tracks</div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 mt-3 text-white/50 text-xs">
              {artist.location && (
                <div className="flex items-center gap-1"><MapPin size={12} /> {artist.location}</div>
              )}
              {artist.social_links &&
                Object.entries(artist.social_links).map(([platform, url]) => {
                  const Icon = socialIcons[platform];
                  return Icon && url ? (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
                      <Icon size={14} />
                    </a>
                  ) : null;
                })}
              <button onClick={handleShare} className="relative hover:text-amber-400 transition">
                <Share2 size={14} />
                {shareTooltip && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            {artist.bio && (
              <p className="text-white/60 text-sm mt-4 max-w-2xl mx-auto leading-relaxed">{artist.bio}</p>
            )}
            {artist.website && (
              <a href={artist.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-400 text-xs mt-3 hover:underline">
                <Globe size={12} /> Website
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-white/10 flex flex-wrap justify-center gap-4">
            {[
              { id: "sounds", label: "All Sounds" },
              { id: "videos", label: "Videos" },
              { id: "album", label: "Album" },
              { id: "about", label: "About Artist" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          {activeTab === "sounds" && (
            <>
              {music.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {music.map((track) => (
                    <AudioCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-white/40 text-sm">
                  No sounds uploaded yet.
                  {debug && (
                    <div className="mt-2 text-xs text-red-400 max-w-md mx-auto">
                      Debug: {debug}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "videos" && (
            <div className="text-center py-16 text-white/40 text-sm">Video content coming soon.</div>
          )}

          {activeTab === "album" && (
            <div className="text-center py-16 text-white/40 text-sm">Albums will appear here.</div>
          )}

          {activeTab === "about" && (
            <div className="max-w-3xl mx-auto bg-white/5 rounded-xl p-5 border border-white/10 text-center">
              <h2 className="text-xl font-bold mb-2">About {artist.name}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{artist.bio || "No artist bio available yet."}</p>
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-400 text-xs mt-4 hover:underline">
                  <Globe size={12} /> Official Website
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomTab />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  // Get artist
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!artist) {
    return { props: { artist: null, music: [], debug: null } };
  }

  console.log("Artist ID:", artist.id);
  console.log("Artist slug:", artist.slug);

  // Direct query: SELECT * FROM music WHERE artist_id = artist.id (no filters)
  const { data: music, error } = await supabase
    .from("music")
    .select("*")
    .eq("artist_id", artist.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return { props: { artist, music: [], debug: `Query error: ${error.message}` } };
  }

  console.log("Raw music data:", music);
  console.log("Number of rows:", music?.length);

  // If still empty, try a different approach: get all music without artist filter
  if (!music || music.length === 0) {
    const { data: allMusic, error: allError } = await supabase
      .from("music")
      .select("*")
      .limit(5);
    console.log("All music (first 5):", allMusic);
    if (allError) console.error("All music error:", allError);

    let debugMsg = `No music found for artist_id = ${artist.id}. `;
    if (allMusic && allMusic.length > 0) {
      debugMsg += `But there are ${allMusic.length} total music rows. The artist_id in those rows: ${allMusic.map(m => m.artist_id).join(", ")}. `;
      debugMsg += `Make sure your music row has artist_id exactly "${artist.id}".`;
    } else {
      debugMsg += `There are no music rows at all in your music table.`;
    }
    return { props: { artist, music: [], debug: debugMsg } };
  }

  return {
    props: {
      artist,
      music: music || [],
      debug: null,
    },
  };
}