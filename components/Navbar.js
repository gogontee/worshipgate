// components/Navbar.js
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const { user, userAvatar, loading: authLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const authButtonRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        authButtonRef.current &&
        !authButtonRef.current.contains(event.target)
      ) {
        setIsAuthDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { name: "Music", href: "/music" },
    { name: "Videos", href: "/videos" },
    { name: "About", href: "/about" },
    { name: "Support", href: "/support" },
  ];

  const loggedOutActions = [
    { name: "Sign up", href: "/auth/signup", type: "link" },
    { name: "Log in", href: "/auth/login", type: "link" },
  ];

  const loggedInActions = [
    { name: "Dashboard", href: `/dashboard/${user?.id}`, type: "link" },
    { name: "Profile", href: "/profile", type: "link" },
    { name: "Log out", action: () => handleLogout(), type: "button" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setIsAuthDropdownOpen(false);
  };

  const isLoggedIn = !!user;

  // Show nothing while auth is loading (prevents flash of wrong UI)
  if (authLoading) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 mx-4 mt-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/30 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight cursor-pointer hover:text-amber-400 transition-colors">
              WORSHIPGATE
            </h1>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-amber-400 transition-colors duration-300 text-sm font-medium uppercase tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <button
                ref={authButtonRef}
                onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="User menu"
              >
                {isLoggedIn && userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              <AnimatePresence>
                {isAuthDropdownOpen && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-48 rounded-xl bg-black/90 backdrop-blur-md border border-amber-500/30 shadow-2xl overflow-hidden z-50"
                  >
                    {(isLoggedIn ? loggedInActions : loggedOutActions).map((item) =>
                      item.type === "link" ? (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsAuthDropdownOpen(false)}
                          className="block w-full text-left px-5 py-3 text-sm text-white/80 hover:text-amber-300 hover:bg-white/5 transition-colors duration-200 font-medium"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.action();
                            setIsAuthDropdownOpen(false);
                          }}
                          className="block w-full text-left px-5 py-3 text-sm text-white/80 hover:text-amber-300 hover:bg-white/5 transition-colors duration-200 font-medium"
                        >
                          {item.name}
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 right-0 top-full mt-2 mx-4 rounded-xl bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden z-50 md:hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-white/80 hover:text-amber-400 transition-colors duration-200 text-base font-medium py-3 px-2 rounded-lg hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}