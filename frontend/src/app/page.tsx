import { NavBar } from '@/components/landing/nav-bar';
import { HeroSection } from '@/components/landing/hero-section';
import { ServicesSection } from '@/components/landing/services-section';
import { GallerySection } from '@/components/landing/gallery-section';
import { BookingSection } from '@/components/landing/booking-section';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
}
