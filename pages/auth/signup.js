import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/router"
import Link from "next/link"
import AuthLayout from "../../components/AuthLayout"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("")
  const [regionState, setRegionState] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          country,
          region_state: regionState,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // After signup, update the public.users row with extra fields
    if (data.user) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          country: country || null,
          region_state: regionState || null,
        })
        .eq('id', data.user.id)

      if (updateError) {
        console.error("Failed to update user profile:", updateError)
      }
    }

    // Show success message and redirect to login page
    setSuccess(true)
    setTimeout(() => router.push("/auth/login?message=Account created! Please log in."), 2000)
    setLoading(false)
  }

  if (success) {
    return (
      <AuthLayout title="Account created">
        <div className="text-center">
          <p className="text-white/80 mb-4">
            Your account has been created successfully!
          </p>
          <p className="text-white/60 text-sm">
            Redirecting to login page...
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create account">
      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-black hover:text-black/70 transition"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-white/40 mt-1">Must be at least 6 characters.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., United States, Nigeria"
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Region / State</label>
          <input
            type="text"
            value={regionState}
            onChange={(e) => setRegionState(e.target.value)}
            placeholder="e.g., Lagos, Texas"
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-full transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p className="text-center text-white/60 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-amber-400 hover:text-amber-300">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}