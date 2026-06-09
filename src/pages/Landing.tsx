import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProblemCards } from '@/components/landing/ProblemCards'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { SocialProof } from '@/components/landing/SocialProof'
import { WaitlistForm } from '@/components/landing/WaitlistForm'
import { InterestSurvey } from '@/components/landing/InterestSurvey'
import { GoalsForm } from '@/components/landing/GoalsForm'
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
      <WaitlistForm />
      <InterestSurvey />
      <GoalsForm />
      <Footer />
    </div>
  )
}
