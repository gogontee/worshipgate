// components/MusicHeader.js
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  Search,
  Home,
  Download,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export default function MusicHeader() {
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

  const navLinks = [
    { name: "Premium", href: "/premium" },
    { name: "Support", href: "/support" },
    { name: "Download", href: "/download" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isLoggedIn = !!user;

  // Show nothing while auth is loading (prevents flash of wrong UI)
  if (authLoading) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-black px-2 md:px-4 py-2 md:py-3">
      <div className="flex items-center justify-between gap-2 md:gap-3">
        {/* Logo */}
        <Link href="/">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center cursor-pointer flex-shrink-0">
            <span className="text-black font-black text-xs md:text-base">WG</span>
          </div>
        </Link>

        {/* Desktop: Home button + search bar */}
        <div className="hidden md:flex items-center gap-2 md:gap-3">
          <Link href="/">
            <button className="w-10 h-10 rounded-full bg-[#1d1d1d] flex items-center justify-center hover:bg-[#2a2a2a] transition">
              <Home size={20} className="text-white" />
            </button>
          </Link>
          <div className="flex items-center bg-[#1d1d1d] rounded-full h-10 px-4 min-w-[320px] border border-white/5">
            <Search className="text-white/50 mr-2" size={18} />
            <input
              type="text"
              placeholder="What do you want to play?"
              className="bg-transparent outline-none text-white placeholder:text-white/40 text-sm w-full"
            />
            <div className="w-[1px] h-5 bg-white/10 mx-3"></div>
            <button>
              <User className="text-white/50" size={18} />
            </button>
          </div>
        </div>

        {/* Mobile: Search input */}
        <div className="flex-1 flex md:hidden items-center bg-[#1d1d1d] rounded-full h-9 px-3 border border-white/5 mx-2">
          <Search className="text-white/50 mr-2" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white placeholder:text-white/40 text-xs w-full"
          />
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-white transition text-sm font-semibold"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <button className="flex items-center gap-1 text-white/70 hover:text-white transition text-sm font-medium">
            <Download size={16} />
            Install App
          </button>
          {!isLoggedIn ? (
            <>
              <Link href="/auth/signup" className="text-white/70 hover:text-white transition text-sm font-semibold">
                Sign up
              </Link>
              <Link href="/auth/login" className="bg-white hover:scale-105 transition text-black px-5 py-2 rounded-full font-bold text-sm">
                Log in
              </Link>
            </>
          ) : (
            <>
              <Link href={`/dashboard/${user.id}`} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
              </Link>
              <button onClick={handleLogout} className="text-white/70 hover:text-white transition text-sm font-medium flex items-center gap-1">
                <LogOut size={16} /> Log out
              </button>
            </>
          )}
        </div>

        {/* Mobile right side: user circle + menu */}
        <div className="flex md:hidden items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              ref={authButtonRef}
              onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
              className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={16} className="text-white" />
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
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-[#111] border border-white/10 overflow-hidden shadow-2xl z-50"
                >
                  {!isLoggedIn ? (
                    <>
                      <Link href="/auth/signup" onClick={() => setIsAuthDropdownOpen(false)} className="block w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-amber-400 transition">
                        Sign Up
                      </Link>
                      <Link href="/auth/login" onClick={() => setIsAuthDropdownOpen(false)} className="block w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-amber-400 transition">
                        Log In
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/dashboard/${user.id}`} onClick={() => setIsAuthDropdownOpen(false)} className="block w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-amber-400 transition">
                        Dashboard
                      </Link>
                      <button onClick={() => { handleLogout(); setIsAuthDropdownOpen(false); }} className="block w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-amber-400 transition">
                        Log Out
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 rounded-full bg-[#1d1d1d] flex items-center justify-center"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 right-0 top-full mt-1 mx-2 rounded-xl bg-[#111] border border-white/20 shadow-2xl overflow-hidden z-50 md:hidden"
          >
            <div className="flex flex-col p-2">
              <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                <Home size={18} /> Home
              </Link>
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="px-3 py-3 rounded-lg hover:bg-white/5 transition text-white/80 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <button className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-white/5 transition text-white/80 text-sm">
                <Download size={16} /> Install App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}