import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import BottomTab from '../components/BottomTab'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <BottomTab />
    </main>
  )
}