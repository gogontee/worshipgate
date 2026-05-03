// pages/add-music.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import BottomTab from "../components/BottomTab";
import * as mm from "music-metadata-browser";

export default function AddMusic() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [artistId, setArtistId] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [manualArtistSlug, setManualArtistSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isArtist, setIsArtist] = useState(false);
  const [checkingArtist, setCheckingArtist] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [language, setLanguage] = useState("");
  const [featureArtists, setFeatureArtists] = useState("");
  const [tags, setTags] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [mood, setMood] = useState("");

  // Files
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Extracted metadata
  const [duration, setDuration] = useState(null);
  const [bpm, setBpm] = useState(null);

  // Check if current user is an artist
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const checkUserArtist = async () => {
      const { data: artist } = await supabase
        .from("artists")
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (artist) {
        setIsArtist(true);
        setArtistId(artist.id);
        setArtistName(artist.name);
      } else {
        setIsArtist(false);
      }
      setCheckingArtist(false);
    };
    checkUserArtist();
  }, [user, authLoading, router]);

  // Fetch artist by slug (for non‑artists)
  const fetchArtistBySlug = async (slug) => {
    setSlugError("");
    const { data, error } = await supabase
      .from("artists")
      .select("id, name")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (error || !data) {
      setSlugError("Artist not found. Check the slug or ask the artist for their unique slug.");
      return null;
    }
    return data;
  };

  // Handle manual artist slug submission
  const handleArtistSlugSubmit = async () => {
    if (!manualArtistSlug.trim()) {
      setSlugError("Please enter an artist slug or ID");
      return;
    }
    setLoading(true);
    const artist = await fetchArtistBySlug(manualArtistSlug);
    if (artist) {
      setArtistId(artist.id);
      setArtistName(artist.name);
      setSlugError("");
    }
    setLoading(false);
  };

  // Audio metadata extraction
  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    try {
      const metadata = await mm.parseBlob(file);
      setDuration(Math.round(metadata.format.duration));
      let bpmValue = null;
      if (metadata.common.bpm) bpmValue = metadata.common.bpm;
      else if (metadata.native?.id3v2) {
        const tbpm = metadata.native.id3v2.find(f => f.id === "TBPM");
        if (tbpm?.value) bpmValue = parseInt(tbpm.value.text, 10);
      }
      setBpm(bpmValue || null);
    } catch (err) {
      console.error("Audio metadata error", err);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artistId) {
      alert("Please select an artist first");
      return;
    }
    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }
    setLoading(true);

    // Upload audio
    const audioExt = audioFile.name.split(".").pop();
    const audioPath = `${artistId}/${Date.now()}.${audioExt}`;
    const { error: audioError } = await supabase.storage
      .from("music_audio")
      .upload(audioPath, audioFile);
    if (audioError) {
      alert("Audio upload failed: " + audioError.message);
      setLoading(false);
      return;
    }
    const { data: audioPublic } = supabase.storage.from("music_audio").getPublicUrl(audioPath);
    const audioUrl = audioPublic.publicUrl;

    // Upload cover (optional)
    let coverUrl = "";
    if (coverFile) {
      const coverExt = coverFile.name.split(".").pop();
      const coverPath = `${artistId}/covers/${Date.now()}.${coverExt}`;
      const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, coverFile);
      if (!coverError) {
        const { data: coverPublic } = supabase.storage.from("covers").getPublicUrl(coverPath);
        coverUrl = coverPublic.publicUrl;
      }
    }

    const featureArtistArray = featureArtists.trim() ? featureArtists.split(",").map(s => s.trim()) : [];
    const tagsArray = tags.trim() ? tags.split(",").map(s => s.trim()) : [];

    const { error: insertError } = await supabase.from("music").insert({
      title,
      artist_id: artistId,
      artist_name: artistName,
      feature_artist: featureArtistArray,
      cover: coverUrl || null,
      audio: audioUrl,
      description: description || null,
      lyrics: lyrics || null,
      genre: genre || null,
      release_date: releaseDate || null,
      duration: duration || null,
      status: "draft",
      listeners: 0,
      download_counts: 0,
      play_counts: 0,
      share_counts: 0,
      is_explicit: false,
      language: language || null,
      bpm: bpm || null,
      key_signature: keySignature || null,
      mood: mood || null,
      tags: tagsArray,
    });

    if (insertError) {
      alert("Database error: " + insertError.message);
      setLoading(false);
    } else {
      setSuccessMessage("✅ Music uploaded successfully! It will be reviewed by admins.");
      setLoading(false);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/${user.id}`);
      }, 2000);
    }
  };

  if (authLoading || checkingArtist) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
        <BottomTab />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Add New Music</h1>
          <p className="text-white/60 mb-6">Fill in the details of your track or sermon.</p>

          {/* Success Toast */}
          {successMessage && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-up">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Artist selection */}
          {!isArtist && !artistId && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
              <h2 className="text-xl font-semibold mb-3">You are not an artist</h2>
              <p className="text-white/60 text-sm mb-4">
                To upload music, please enter the unique <strong>slug</strong> of the artist or band you are uploading for.
                (e.g., <code className="bg-black/50 px-1 rounded">simeon-oluwole</code>)
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={manualArtistSlug}
                  onChange={(e) => setManualArtistSlug(e.target.value)}
                  placeholder="Artist slug (e.g., simeon-oluwole)"
                  className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
                />
                <button
                  onClick={handleArtistSlugSubmit}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-full font-medium transition"
                >
                  {loading ? "Checking..." : "Use this artist"}
                </button>
              </div>
              {slugError && <p className="text-red-400 text-sm mt-2">{slugError}</p>}
            </div>
          )}

          {/* Show selected artist info */}
          {artistId && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-sm text-white/60">Uploading as artist:</span>
                <p className="font-semibold">{artistName}</p>
              </div>
              {!isArtist && (
                <button
                  onClick={() => {
                    setArtistId(null);
                    setArtistName("");
                    setManualArtistSlug("");
                  }}
                  className="text-amber-400 text-sm hover:underline"
                >
                  Change artist
                </button>
              )}
            </div>
          )}

          {artistId && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form fields... (unchanged) */}
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lyrics</label>
                <textarea
                  rows="5"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none font-mono text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g., Gospel, Worship, Hip Hop"
                    className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Release Date</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g., English, Yoruba"
                    className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Key Signature</label>
                  <input
                    type="text"
                    value={keySignature}
                    onChange={(e) => setKeySignature(e.target.value)}
                    placeholder="e.g., C major, A minor"
                    className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mood</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g., Joyful, Reflective"
                    className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="worship, prayer, energetic"
                    className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Featured Artists (comma separated)</label>
                <input
                  type="text"
                  value={featureArtists}
                  onChange={(e) => setFeatureArtists(e.target.value)}
                  placeholder="e.g., Simeon Oluwole, Gospel Choir"
                  className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Audio File *</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  required
                  className="w-full text-white/70"
                />
                {audioPreview && (
                  <audio controls src={audioPreview} className="mt-2 w-full max-w-xs" />
                )}
                {duration && (
                  <p className="text-xs text-white/50 mt-1">Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
                )}
                {bpm && <p className="text-xs text-white/50">BPM: {bpm}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cover Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="w-full text-white/70"
                />
                {coverPreview && (
                  <img src={coverPreview} alt="Cover preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-full transition disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          )}
        </div>
      </div>
      <BottomTab />
    </>
  );
}