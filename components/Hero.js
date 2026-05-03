import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

export default function Hero() {
  const slides = [
    {
      title: "MUSIC. SOUL. ATMOSPHERE.",
      description: "Welcome to the sacred home for worship and soul edification.",
      button: "Listen Now",
    },
    {
      title: "WORSHIP. GLORY. PRESENCE.",
      description: "Sounds that draw hearts closer to God.",
      button: "Enter Worship",
    },
    {
      title: "PRAISE. FAITH. EDIFICATION.",
      description: "Spirit-filled music created to uplift souls.",
      button: "Start Listening",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const clearSlideInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSlideInterval = useCallback(() => {
    clearSlideInterval();
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 8000);
    }
  }, [isPaused, slides.length, clearSlideInterval]);

  useEffect(() => {
    startSlideInterval();
    return () => clearSlideInterval();
  }, [startSlideInterval, clearSlideInterval]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    clearSlideInterval();
  }, [clearSlideInterval]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      startSlideInterval();
    }
  }, [isPaused, startSlideInterval]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section
      className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center text-center px-4 sm:px-6 overflow-hidden bg-black group"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-amber-500/50 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-amber-500/50 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="relative min-h-[280px] sm:min-h-[360px] md:min-h-[420px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full"
            >
              {/* Increased heading font size on mobile: was text-3xl, now text-5xl */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-3 sm:mb-5 leading-tight tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
                {slides[current].title}
              </h1>

              <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4 sm:mb-6 px-2 font-medium">
                {slides[current].description}
              </p>

              <button className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-5 py-2 sm:px-7 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  {slides[current].button}
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
    </section>
  );
}