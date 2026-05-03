import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/router"
import Link from "next/link"
import AuthLayout from "../../components/AuthLayout"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // After successful login, get the user ID and redirect to dynamic dashboard
    const userId = data.user.id
    router.push(`/dashboard/${userId}`)
    setLoading(false)
  }

  return (
    <AuthLayout title="Welcome back">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
          <div className="text-right mt-1">
            <Link href="/auth/forgot-password" className="text-xs text-amber-400 hover:text-amber-300">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-full transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
        <p className="text-center text-white/60 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}