// pages/menatwork.js
import MusicHeader from "../components/MusicHeader";
import BottomTab from "../components/BottomTab";

export default function MenAtWork() {
  return (
    <>
      <MusicHeader />
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v3m0 12v3M3 12h3m12 0h3" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Work in Progress</h1>
          <p className="text-white/70 text-base md:text-lg mb-6">
            We’re diligently building the WorshipGate experience. This page is coming soon.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/50">
            <p>Thank you for your patience. Stay tuned for updates!</p>
          </div>
        </div>
      </main>
      <BottomTab />
    </>
  );
}