import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProblemCards } from '@/components/landing/ProblemCards'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { SocialProof } from '@/components/landing/SocialProof'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { Footer } from '@/components/landing/Footer'

export function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemCards />
      <FeaturesGrid />
      <DashboardPreview />
      <SocialProof />
      <Footer />
    </div>
  )
}
