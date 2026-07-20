import Navbar      from '@/components/landing/Navbar'
import Hero        from '@/components/landing/Hero'
import Stats       from '@/components/landing/Stats'
import Features    from '@/components/landing/Features'
import HowItWorks  from '@/components/landing/HowItWorks'
import About       from '@/components/landing/About'
import Footer      from '@/components/landing/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <About />
      <Footer />
    </main>
  )
}
