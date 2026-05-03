import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/router"
import AuthLayout from "../../components/AuthLayout"

export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Ensure user has a valid session (the reset link sets a session)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
      }
    }
    checkSession()
  }, [router])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 2000)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <AuthLayout title="Password updated">
        <p className="text-white/80 text-center">Your password has been changed. Redirecting to login...</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create new password">
      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
          <p className="text-xs text-white/40 mt-1">Must be at least 6 characters.</p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-full transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  )
}