import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Story } from '@/components/story'
import { Stats } from '@/components/stats'
import { Rooms } from '@/components/rooms'
import { Amenities } from '@/components/amenities'
import { Offers } from '@/components/offers'
import { Gallery } from '@/components/gallery'
import { Dining } from '@/components/dining'
import { Experiences } from '@/components/experiences'
import { Reviews } from '@/components/reviews'
import { Blog } from '@/components/blog'
import { Location } from '@/components/location'
import { Faq } from '@/components/faq'
import { Newsletter } from '@/components/newsletter'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'

export default function Page() {
  return (
    <main id="top">
      <Navbar />
      <Hero />
      <About viewAllHref="/about" />
      <Story />
      <Stats />
      <Rooms viewAllHref="/rooms" />
      <Amenities />
      <Offers viewAllHref="/offers" />
      <Gallery viewAllHref="/gallery" />
      <Dining viewAllHref="/dining" />
      <Experiences viewAllHref="/experiences" />
      <Reviews viewAllHref="/reviews" />
      <Blog />
      <Location viewAllHref="/location" />
      <Faq />
      <Newsletter />
      <Contact />
      <Footer />
      <BackToTop />
    </main>
  )
}
