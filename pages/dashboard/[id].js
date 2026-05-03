// pages/dashboard/[id].js – fixed loading issue
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import BottomTab from "../../components/BottomTab";
import ArtistForm from "../../components/ArtistForm";
import { Pencil, PlusCircle, Eye } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState(null);
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showArtistForm, setShowArtistForm] = useState(false);

  // Settings
  const [explicitFilter] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [playlistsVisibility, setPlaylistsVisibility] = useState("public");

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Wait for auth and id – redirect if needed
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!id) return; // wait for id to be available
    if (user.id !== id) {
      router.push("/auth/login");
      return;
    }
  }, [user, authLoading, id, router]);

  // Fetch user and artist data (only when user and id are ready)
  useEffect(() => {
    if (!user || !id) return; // id may be undefined initially

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: userRecord } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (userRecord) {
          setUserData(userRecord);
          setNotificationsEnabled(userRecord.notifications_enabled ?? true);
          setEmailNotifications(userRecord.email_notifications ?? true);
          setPlaylistsVisibility(userRecord.playlists_visibility ?? "public");
        }

        const { data: artistRecord } = await supabase
          .from("artists")
          .select("*")
          .eq("user_id", id)
          .maybeSingle();

        if (artistRecord) setArtistData(artistRecord);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, id]); // id can change, but user.id ensures ownership

  // Avatar upload handler (unchanged)
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploadingAvatar(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", id);
    if (!updateError) {
      setUserData({ ...userData, avatar_url: publicUrl });
      setAvatarPreview(publicUrl);
    }
    setUploadingAvatar(false);
  };

  // Toggles for notifications (unchanged)
  const toggleNotifications = async () => {
    setUpdating(true);
    const newValue = !notificationsEnabled;
    await supabase.from("users").update({ notifications_enabled: newValue }).eq("id", id);
    setNotificationsEnabled(newValue);
    setUpdating(false);
  };

  const toggleEmailNotifications = async () => {
    setUpdating(true);
    const newValue = !emailNotifications;
    await supabase.from("users").update({ email_notifications: newValue }).eq("id", id);
    setEmailNotifications(newValue);
    setUpdating(false);
  };

  const updatePlaylistsVisibility = async (visibility) => {
    setUpdating(true);
    await supabase.from("users").update({ playlists_visibility: visibility }).eq("id", id);
    setPlaylistsVisibility(visibility);
    setUpdating(false);
  };

  // Refresh data after artist form success (unchanged)
  const refreshArtistData = async () => {
    const { data: artistRecord } = await supabase
      .from("artists")
      .select("*")
      .eq("user_id", id)
      .maybeSingle();
    setArtistData(artistRecord);
    setShowArtistForm(false);
    if (artistRecord && userData && !userData.is_artist) {
      await supabase.from("users").update({ is_artist: true, artist_profile_id: artistRecord.id }).eq("id", id);
      setUserData({ ...userData, is_artist: true });
    }
  };

  // Loading indicator: wait for both authLoading (global) and local loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        User not found.
      </div>
    );
  }

  const isArtist = userData.is_artist === true;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
          {/* Profile Header – unchanged UI */}
          <div className="flex flex-col items-center md:flex-row md:items-start justify-between gap-6 mb-10">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500 bg-black">
                  {userData.avatar_url || avatarPreview ? (
                    <img
                      src={avatarPreview || userData.avatar_url}
                      alt={userData.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-700 to-black flex items-center justify-center">
                      <span className="text-white text-xl font-black">WG</span>
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-1.5 cursor-pointer hover:bg-amber-600 transition"
                >
                  <Pencil size={14} className="text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{userData.full_name}</h1>
                <p className="text-white/60">{userData.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                    Role: {userData.role || "user"}
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                    Plan: {userData.subscription_tier || "free"}
                  </span>
                  {userData.country && (
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs">{userData.country}</span>
                  )}
                  {userData.region_state && (
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs">{userData.region_state}</span>
                  )}
                </div>
              </div>
            </div>

            {isArtist && (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/add-music"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-full text-sm font-medium transition"
                >
                  <PlusCircle size={18} /> Add Music
                </Link>
                <Link
                  href={`/${artistData?.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-medium transition"
                >
                  <Eye size={18} /> View Public Page
                </Link>
              </div>
            )}
          </div>

          {showArtistForm && (
            <div className="mb-8">
              <ArtistForm
                userId={id}
                existingArtist={artistData}
                onSuccess={refreshArtistData}
              />
            </div>
          )}

          {/* Health Status */}
          <div className="bg-white/5 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Account Health</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-white/80">
                  Healthy account – no content restrictions
                </span>
              </div>
            </div>
          </div>

          {/* Notifications & Playlist Visibility */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-5">
              <h3 className="text-xl font-semibold mb-4">Notifications</h3>
              <div className="flex justify-between items-center py-2">
                <span>Push</span>
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    notificationsEnabled ? "bg-amber-500" : "bg-white/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Email</span>
                <button
                  onClick={toggleEmailNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    emailNotifications ? "bg-amber-500" : "bg-white/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5">
              <h3 className="text-xl font-semibold mb-3">Playlist Visibility</h3>
              <div className="flex flex-wrap gap-2">
                {["public", "private", "followers"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updatePlaylistsVisibility(opt)}
                    className={`px-4 py-2 rounded-full capitalize ${
                      playlistsVisibility === opt
                        ? "bg-amber-500 text-white"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* "Create your Page" Section */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h3 className="text-xl font-semibold">Your Public Page</h3>
              {!isArtist && !showArtistForm && (
                <button
                  onClick={() => setShowArtistForm(true)}
                  className="bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-full text-sm font-medium"
                >
                  + Create your Page
                </button>
              )}
            </div>

            {isArtist && artistData ? (
              <div>
                <p className="text-green-400 mb-2">✓ Your page is live</p>
                <p className="font-semibold">{artistData.name}</p>
                <p className="text-white/60 text-sm">Slug: /{artistData.slug}</p>
                <Link
                  href={`/${artistData.slug}`}
                  target="_blank"
                  className="text-amber-400 hover:underline text-sm inline-block mt-2"
                >
                  View public page →
                </Link>
              </div>
            ) : !showArtistForm && (
              <p className="text-white/50">
                No public page yet. Click “Create your Page” to share music or sermons.
              </p>
            )}
          </div>

          {isArtist && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Upload New Music</h3>
              <p className="text-white/70 text-sm mb-4">Share your latest track, sermon, or worship session.</p>
              <Link
                href="/add-music"
                className="inline-block bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-full font-medium transition"
              >
                + Add Music
              </Link>
            </div>
          )}
        </div>
      </div>
      <BottomTab />
    </>
  );
}