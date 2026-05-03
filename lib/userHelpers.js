import { supabase } from './supabaseClient'

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserArtistProfile(userId) {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getMusicByArtist(artistId) {
  const { data, error } = await supabase
    .from('music')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}