import { useState } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProblemCards } from '@/components/landing/ProblemCards'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { SocialProof } from '@/components/landing/SocialProof'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { Footer } from '@/components/landing/Footer'
import { WaitlistSection } from '@/components/landing/WaitlistSection'
import { InterestSurvey } from '@/components/landing/InterestSurvey'
import { GoalsForm } from '@/components/landing/GoalsForm'

export function Landing() {
  const [waitlisted, setWaitlisted] = useState(!!localStorage.getItem('algocoach_email'))

  return (
    <div className="min-h-screen dark">
      <Navbar />
      <Hero />
      <ProblemCards />
      <FeaturesGrid />
      <DashboardPreview />
      {!waitlisted && <WaitlistSection onComplete={() => setWaitlisted(true)} />}
      {waitlisted && <InterestSurvey />}
      {waitlisted && <GoalsForm />}
      <SocialProof />
      <Footer />
    </div>
  )
}
