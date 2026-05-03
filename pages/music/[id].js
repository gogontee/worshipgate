// pages/music/[id].js – with artist avatar below cover (outside cover container)
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import MusicHeader from "../../components/MusicHeader";
import BottomTab from "../../components/BottomTab";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Share2,
  Calendar,
  Headphones,
  Users,
  Download,
  Music as MusicIcon,
  User as UserIcon,
  Loader2,
  Mic,
  X,
  Heart,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";

export default function MusicDetail({ initialSong, initialArtist }) {
  const router = useRouter();
  const [song, setSong] = useState(initialSong);
  const [artist, setArtist] = useState(initialArtist);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState("off");
  const [shuffle, setShuffle] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasIncrementedPlay, setHasIncrementedPlay] = useState(false);
  const audioRef = useRef(null);
  const waveInterval = useRef(null);
  const autoPlayedRef = useRef(false);

  // Auto-play on page load
  useEffect(() => {
    if (!song || !audioRef.current) return;
    if (autoPlayedRef.current) return;

    const attemptPlay = () => {
      if (audioRef.current && !isPlaying && !isLoadingAudio) {
        autoPlayedRef.current = true;
        handlePlayPause();
      }
    };
    const timer = setTimeout(attemptPlay, 300);
    return () => clearTimeout(timer);
  }, [song]);

  // Load playlist based on current song (artist & genre)
  const loadPlaylist = async (currentSong) => {
    if (!currentSong) return;
    let query = supabase.from("music").select("*").eq("status", "published");
    if (shuffle) {
      if (currentSong.genre) {
        query = query.eq("genre", currentSong.genre);
      } else if (currentSong.artist_id) {
        query = query.eq("artist_id", currentSong.artist_id);
      }
    } else {
      if (currentSong.artist_id) {
        query = query.eq("artist_id", currentSong.artist_id);
      }
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load playlist:", error);
      return;
    }
    if (data && data.length > 0) {
      setPlaylist(data);
      const idx = data.findIndex((s) => s.id === currentSong.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else {
      setPlaylist([currentSong]);
      setCurrentIndex(0);
    }
  };

  // Fetch song data by ID (for navigation)
  const fetchSongById = async (id) => {
    const { data, error } = await supabase
      .from("music")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    let artistData = null;
    if (data.artist_id) {
      const { data: a } = await supabase
        .from("artists")
        .select("id, name, slug, avatar_url")
        .eq("id", data.artist_id)
        .maybeSingle();
      artistData = a;
    }
    return { song: data, artist: artistData };
  };

  // Change to a new song
  const changeSong = async (newSong) => {
    if (!newSong) return;
    setHasIncrementedPlay(false);
    setSong(newSong);
    if (newSong.artist_id) {
      const { data: a } = await supabase
        .from("artists")
        .select("id, name, slug, avatar_url")
        .eq("id", newSong.artist_id)
        .maybeSingle();
      setArtist(a || null);
    } else {
      setArtist(null);
    }
    router.push(`/music/${newSong.id}`, undefined, { shallow: true });
    await loadPlaylist(newSong);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch(console.error);
    }
  };

  const playNext = async () => {
    if (playlist.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (repeatMode === "one") {
      await changeSong(playlist[currentIndex]);
      return;
    }
    if (nextIndex >= playlist.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    const nextSong = playlist[nextIndex];
    if (nextSong) {
      await changeSong(nextSong);
      setCurrentIndex(nextIndex);
    }
  };

  const playPrevious = async () => {
    if (playlist.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (repeatMode === "one") {
      await changeSong(playlist[currentIndex]);
      return;
    }
    if (prevIndex < 0) {
      if (repeatMode === "all") {
        prevIndex = playlist.length - 1;
      } else {
        return;
      }
    }
    const prevSong = playlist[prevIndex];
    if (prevSong) {
      await changeSong(prevSong);
      setCurrentIndex(prevIndex);
    }
  };

  const toggleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("one");
    else if (repeatMode === "one") setRepeatMode("all");
    else setRepeatMode("off");
  };

  const toggleShuffle = async () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    await loadPlaylist(song);
  };

  useEffect(() => {
    if (song) {
      loadPlaylist(song);
    }
  }, [song]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      playNext();
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playlist, currentIndex, repeatMode, shuffle, song]);

  const incrementPlayCount = async () => {
    if (!hasIncrementedPlay && song) {
      setHasIncrementedPlay(true);
      const { error } = await supabase.rpc("increment_plays", { music_id: song.id });
      if (error) console.error("Failed to increment play count:", error);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoadingAudio(true);
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
            incrementPlayCount();
          })
          .catch((err) => {
            console.error("Play failed:", err);
            setIsLoadingAudio(false);
            alert("Unable to play audio. Please try again later.");
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isPlaying) {
      waveInterval.current = setInterval(() => {
        const waveContainer = document.querySelector(".wave-animation");
        if (waveContainer) waveContainer.classList.add("playing");
      }, 100);
    } else {
      clearInterval(waveInterval.current);
      const waveContainer = document.querySelector(".wave-animation");
      if (waveContainer) waveContainer.classList.remove("playing");
    }
    return () => clearInterval(waveInterval.current);
  }, [isPlaying]);

  const incrementShareCount = async () => {
    if (!song) return;
    const { error } = await supabase.rpc("increment_shares", { music_id: song.id });
    if (error) console.error("Failed to increment share count:", error);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
    incrementShareCount();
  };

  const handleDownloadClick = () => {
    setShowDonationModal(true);
  };

  const incrementDownloadCount = async () => {
    if (!song) return;
    const { error } = await supabase.rpc("increment_downloads", { music_id: song.id });
    if (error) console.error("Failed to increment download count:", error);
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    setIsDonating(true);
    setTimeout(async () => {
      try {
        const response = await fetch(song.audio);
        if (!response.ok) throw new Error("Network error");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${song.title} - ${song.artist_name}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        await incrementDownloadCount();
        alert("Thank you for your support! Your download has started.");
        setShowDonationModal(false);
        setDonationAmount("");
      } catch (err) {
        alert("Download failed. Please try again.");
        console.error(err);
      } finally {
        setIsDonating(false);
      }
    }, 1500);
  };

  const featuredArtists =
    song?.feature_artist && Array.isArray(song.feature_artist)
      ? song.feature_artist.filter((name) => name !== song.artist_name)
      : [];

  const hasLyrics = song?.lyrics && song.lyrics.trim().length > 0;

  if (!song) {
    return (
      <>
        <MusicHeader />
        <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
          <p className="text-white/60">Song not found.</p>
          <Link href="/music" className="text-amber-400 hover:underline">
            Back to Music
          </Link>
        </div>
        <BottomTab />
      </>
    );
  }

  return (
    <>
      <MusicHeader />
      <div className="min-h-screen bg-black text-white pb-24">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
          <Link
            href="/music"
            className="inline-flex items-center gap-1 text-white/60 hover:text-amber-400 transition mb-4 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </Link>

          <div className="flex gap-4 items-start">
            {/* Left column: Cover + Artist Avatar (stacked) */}
            <div className="flex flex-col items-center gap-2 w-28 md:w-32 flex-shrink-0">
              {/* Cover image */}
              <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg border border-white/10">
                {song.cover ? (
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-black flex items-center justify-center">
                    <MusicIcon size={28} className="text-white/30" />
                  </div>
                )}
              </div>
              {/* Artist avatar circle – placed directly under the cover */}          {/* Artist avatar circle – placed directly under the cover */}
              {artist && (
                <Link href={`/${artist.slug}`} className="block mt-2 mb-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 bg-black shadow-md hover:scale-105 transition mx-auto">
                    {artist.avatar_url ? (
                      <img
                        src={artist.avatar_url}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-700 to-black flex items-center justify-center text-white text-sm font-bold">
                        {artist.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Right column: all song information */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">
                {song.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                {artist ? (
                  <Link
                    href={`/${artist.slug}`}
                    className="text-sm text-amber-400 hover:underline"
                  >
                    {song.artist_name}
                  </Link>
                ) : (
                  <span className="text-sm text-amber-400">{song.artist_name}</span>
                )}
                {featuredArtists.length > 0 && (
                  <span className="text-white/50 text-xs">
                    feat. {featuredArtists.join(", ")}
                  </span>
                )}
              </div>

              <div className="flex gap-3 mt-2 text-white/50 text-[10px]">
                {song.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={10} /> {new Date(song.release_date).toLocaleDateString()}
                  </div>
                )}
                {song.duration && (
                  <div className="flex items-center gap-1">
                    <MusicIcon size={10} /> {formatTime(song.duration)}
                  </div>
                )}
                {song.genre && (
                  <div className="flex items-center gap-1">
                    <UserIcon size={10} /> {song.genre}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={playPrevious}
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                >
                  <SkipBack size={16} className="text-white/70 hover:text-amber-400" />
                </button>
                <button
                  onClick={handlePlayPause}
                  disabled={isLoadingAudio}
                  className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center shadow-md disabled:opacity-50"
                >
                  {isLoadingAudio ? (
                    <Loader2 size={14} className="text-white animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={14} className="text-white" />
                  ) : (
                    <Play size={14} className="text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={playNext}
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                >
                  <SkipForward size={16} className="text-white/70 hover:text-amber-400" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                  title={
                    repeatMode === "off" ? "Repeat off" : repeatMode === "one" ? "Repeat one" : "Repeat all"
                  }
                >
                  {repeatMode === "one" ? (
                    <Repeat1 size={14} className="text-amber-400" />
                  ) : repeatMode === "all" ? (
                    <Repeat size={14} className="text-amber-400" />
                  ) : (
                    <Repeat size={14} className="text-white/50" />
                  )}
                </button>
                <button
                  onClick={toggleShuffle}
                  className="p-1.5 rounded-full hover:bg-white/10 transition"
                >
                  <Shuffle size={14} className={shuffle ? "text-amber-400" : "text-white/50"} />
                </button>
                <button
                  onClick={handleShare}
                  className="relative p-1.5 rounded-full hover:bg-white/10 transition"
                >
                  <Share2 size={14} className="text-white/70 hover:text-amber-400" />
                  {shareTooltip && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowLyrics(true)}
                  className="flex items-center gap-1 text-xs text-white/70 hover:text-amber-400 transition p-1.5 rounded-full hover:bg-white/10"
                >
                  <Mic size={14} /> <span className="hidden sm:inline">Lyrics</span>
                </button>
                <button
                  onClick={handleDownloadClick}
                  className="flex items-center gap-1 text-xs text-white/70 hover:text-amber-400 transition p-1.5 rounded-full hover:bg-white/10"
                >
                  <Download size={14} /> <span className="hidden sm:inline">Download</span>
                </button>
                {artist && (
                  <Link
                    href={`/${artist.slug}`}
                    className="flex items-center gap-1 text-xs text-white/70 hover:text-amber-400 transition p-1.5 rounded-full hover:bg-white/10"
                  >
                    <Heart size={14} /> <span className="hidden sm:inline">Support</span>
                  </Link>
                )}
              </div>

              <div className="mt-3">
                <div className="wave-animation flex items-center gap-0.5 h-6">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-amber-500 rounded-full transition-all duration-75 ${
                        isPlaying ? "wave-bar" : "h-1"
                      }`}
                      style={{
                        height: isPlaying ? `${Math.random() * 20 + 4}px` : "4px",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/50">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                  />
                  <span className="text-[10px] text-white/50">
                    {formatTime(duration)}
                  </span>
                </div>
                <audio
                  ref={audioRef}
                  preload="metadata"
                  src={song.audio}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onError={() => {
                    setIsLoadingAudio(false);
                    alert("Audio file could not be loaded.");
                  }}
                  className="hidden"
                />
              </div>

              {song.description && (
                <p className="mt-3 text-white/60 text-xs leading-relaxed line-clamp-2">
                  {song.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="bg-white/5 rounded-xl py-2 text-center">
              <Headphones size={14} className="mx-auto text-amber-400 mb-0.5" />
              <p className="text-[10px] text-white/60">Plays</p>
              <p className="font-bold text-xs">{(song.play_counts || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-xl py-2 text-center">
              <Users size={14} className="mx-auto text-amber-400 mb-0.5" />
              <p className="text-[10px] text-white/60">Listeners</p>
              <p className="font-bold text-xs">{(song.listeners || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-xl py-2 text-center">
              <Download size={14} className="mx-auto text-amber-400 mb-0.5" />
              <p className="text-[10px] text-white/60">Downloads</p>
              <p className="font-bold text-xs">{(song.download_counts || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Modal */}
      {showLyrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Lyrics</h3>
              <button
                onClick={() => setShowLyrics(false)}
                className="p-1 rounded-full hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {hasLyrics ? (
                <pre className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {song.lyrics}
                </pre>
              ) : (
                <p className="text-white/50 text-center py-8">
                  No lyrics available for this song.
                </p>
              )}
            </div>
            <div className="p-3 border-t border-white/10 text-center">
              <p className="text-white/40 text-xs">
                {song.title} — {song.artist_name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111] rounded-2xl w-full max-w-md overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Support the Minister</h3>
              <button
                onClick={() => setShowDonationModal(false)}
                className="p-1 rounded-full hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDonationSubmit} className="p-5">
              <p className="text-white/70 text-sm mb-4">
                To download this track, please consider supporting the artist with a small donation. Your contribution helps them create more spirit‑filled music.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Donation amount (USD)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="e.g., 5"
                  required
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isDonating}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 py-2 rounded-full font-medium transition disabled:opacity-50"
                >
                  {isDonating ? "Processing..." : "Send & Download"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-full font-medium transition"
                >
                  Not now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomTab />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;
  const { data: song, error } = await supabase
    .from("music")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !song) {
    return { props: { initialSong: null, initialArtist: null } };
  }

  let artist = null;
  if (song.artist_id) {
    const { data: artistData } = await supabase
      .from("artists")
      .select("id, name, slug, avatar_url")
      .eq("id", song.artist_id)
      .maybeSingle();
    artist = artistData;
  }

  return { props: { initialSong: song, initialArtist: artist } };
}