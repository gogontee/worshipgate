import Image from 'next/image'

const links = [
  {
    name: 'Spotify',
    description: 'Stream King of Glory – EP',
    url: 'https://open.spotify.com/album/5uTo4lA8gA3xJIW5sgbnyU',
    logo: '/spotifylogo.webp',
    color: 'hover:border-green-500 hover:bg-green-500/10',
  },
  {
    name: 'Boomplay',
    description: 'Listen on Boomplay',
    url: 'https://www.boomplay.com/albums/EQWzmdUOKjt6pNc_JZxqkOfJ',
    logo: '/boomplaylogo.png',
    color: 'hover:border-blue-300 hover:bg-orange-500/10',
  },
  {
    name: 'Amazon Music',
    description: 'Stream on Amazon Music',
    url: 'https://music.amazon.com/albums/B0HDDBVYR2',
    logo: '/amazonmusiclogo.webp',
    color: 'hover:border-sky-500 hover:bg-sky-500/10',
  },
  {
    name: 'YouTube Music',
    description: 'Listen on YouTube Music',
    url: 'https://music.youtube.com/playlist?list=OLAK5uy_mlZ06o3viHokm38W1c_KJpTwhE5wf2104',
    logo: '/youtubemusiclogo.webp',
    color: 'hover:border-red-500 hover:bg-red-500/10',
  },
  {
    name: 'Watch Lyric Videos',
    description: 'Full lyric videos on YouTube',
    url: 'https://www.youtube.com/@worshipgate_music/videos',
    logo: '/youtubelogo.webp',
    color: 'hover:border-red-600 hover:bg-red-600/10',
  },
]

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-white flex flex-col items-center px-5 py-12">
      {/* Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg ring-2 ring-zinc-700">
        <Image
          src="/avatar.jpg"
          alt="Universalgozt"
          fill
          sizes="96px"
          className="object-cover"
          priority
        />
      </div>

      {/* Name + tagline */}
      <h1 className="text-2xl font-bold tracking-tight">Universalgozt</h1>
      <p className="text-zinc-400 text-sm mt-1 mb-8 text-center">
        Listen to{' '}
        <span className="text-amber-400">King of Glory – EP</span>
      </p>

      {/* Links */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-4 w-full rounded-2xl border border-zinc-700 bg-zinc-900/60 backdrop-blur px-4 py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${link.color}`}
          >
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src={link.logo}
                alt={`${link.name} logo`}
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[15px]">{link.name}</p>
              <p className="text-xs text-zinc-400">{link.description}</p>
            </div>
            <span className="text-zinc-500 group-hover:text-white transition-colors">
              →
            </span>
          </a>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-xs text-zinc-500 text-center">
        © {new Date().getFullYear()} Universalgozt · Worship Gate Music
      </footer>
    </main>
  )
}