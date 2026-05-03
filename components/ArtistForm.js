// components/ArtistForm.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function ArtistForm({ userId, existingArtist, onSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(existingArtist?.avatar_url || "");
  const [coverPreview, setCoverPreview] = useState(existingArtist?.cover_image_url || "");

  // Form fields
  const [name, setName] = useState(existingArtist?.name || "");
  const [slug, setSlug] = useState(existingArtist?.slug || "");
  const [bio, setBio] = useState(existingArtist?.bio || "");
  const [genre, setGenre] = useState(existingArtist?.genre || "");
  const [location, setLocation] = useState(existingArtist?.location || "");
  const [website, setWebsite] = useState(existingArtist?.website || "");

  // Social links
  const [instagram, setInstagram] = useState(existingArtist?.social_links?.instagram || "");
  const [twitter, setTwitter] = useState(existingArtist?.social_links?.twitter || "");
  const [facebook, setFacebook] = useState(existingArtist?.social_links?.facebook || "");
  const [youtube, setYoutube] = useState(existingArtist?.social_links?.youtube || "");

  // Auto-generate slug from name (only if slug hasn't been manually edited)
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  // Image preview handlers
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Upload image to storage and return public URL
  const uploadImage = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('artists')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('artists').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarUrl = existingArtist?.avatar_url || null;
      let coverUrl = existingArtist?.cover_image_url || null;
      if (avatarFile) avatarUrl = await uploadImage(avatarFile, 'avatars');
      if (coverFile) coverUrl = await uploadImage(coverFile, 'covers');

      const socialLinks = { instagram, twitter, facebook, youtube };
      // Remove empty fields
      Object.keys(socialLinks).forEach(key => !socialLinks[key] && delete socialLinks[key]);

      const artistData = {
        user_id: userId,
        name,
        slug,
        bio: bio || null,
        avatar_url: avatarUrl,
        cover_image_url: coverUrl,
        genre: genre || null,
        location: location || null,
        website: website || null,
        social_links: socialLinks,
      };

      let result;
      if (existingArtist?.id) {
        result = await supabase
          .from('artists')
          .update(artistData)
          .eq('id', existingArtist.id);
      } else {
        result = await supabase
          .from('artists')
          .insert([artistData]);
      }
      if (result.error) throw result.error;
      alert(existingArtist ? "Artist profile updated!" : "Artist profile created!");
      if (onSuccess) onSuccess();
      else router.push(`/dashboard/${userId}`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 rounded-2xl p-6 border border-white/10">
      <h2 className="text-2xl font-bold">{existingArtist ? "Edit Artist Profile" : "Create Artist Profile"}</h2>

      {/* Name & Slug */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Artist / Stage Name *</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            required
            className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL) – leave auto‑generated or customise</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            required
            className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
          />
          <p className="text-xs text-white/40 mt-1">Your public page: worshipgate.com/{slug || "your-name"}</p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          rows="4"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
        />
      </div>

      {/* Genre & Location */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Genre / Category</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g., Gospel, Preaching, Worship"
            className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Social Links (optional)</p>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram URL"
          className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
        />
        <input
          type="text"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="Twitter URL"
          className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
        />
        <input
          type="text"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="Facebook URL"
          className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
        />
        <input
          type="text"
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          placeholder="YouTube URL"
          className="w-full bg-black border border-white/20 rounded-lg px-4 py-2 focus:border-amber-500 outline-none"
        />
      </div>

      {/* Images */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Profile Picture (Avatar)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full text-white/70 mb-2"
          />
          {avatarPreview && (
            <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-amber-500" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image (Banner)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="w-full text-white/70 mb-2"
          />
          {coverPreview && (
            <img src={coverPreview} alt="Cover" className="w-full max-h-32 object-cover rounded-lg border border-amber-500" />
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-full transition disabled:opacity-50"
      >
        {loading ? "Saving..." : (existingArtist ? "Update Profile" : "Create Profile")}
      </button>
    </form>
  );
}