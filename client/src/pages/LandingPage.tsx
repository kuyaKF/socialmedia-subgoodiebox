import { BlogPreview } from '../components/landing/BlogPreview'
import { FAQ } from '../components/landing/FAQ'
import { Hero } from '../components/landing/Hero'
import { Introduction } from '../components/landing/Introduction'
import { LandingFooter } from '../components/landing/LandingFooter'
import { Newsletter } from '../components/landing/Newsletter'
import { SubscriptionTiers } from '../components/landing/SubscriptionTiers'
import { WhyJoin } from '../components/landing/WhyJoin'

export function LandingPage() {
  return (
    <div>
      <Hero />
      <Introduction />
      <WhyJoin />
      <SubscriptionTiers />
      <FAQ />
      <BlogPreview />
      <Newsletter />
      <LandingFooter />
    </div>
  )
}
