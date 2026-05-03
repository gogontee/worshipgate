// components/AuthLayout.js
import Link from "next/link"

export default function AuthLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex w-16 h-16 rounded-full bg-white items-center justify-center cursor-pointer mx-auto">
              <span className="text-black font-black text-xl">WG</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">{title}</h1>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          {children}
        </div>
        <p className="text-white/40 text-xs text-center mt-8">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  )
}