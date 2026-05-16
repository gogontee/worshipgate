import { useState } from "react";
import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset email sent. Check your inbox (and spam folder).");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Reset password">
      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black rounded-lg border border-white/20 px-4 py-2 text-white focus:border-amber-500 outline-none"
          />
        </div>
        {message && <p className="text-green-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-full transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="text-center text-white/60 text-sm">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-amber-400 hover:text-amber-300">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}