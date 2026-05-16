import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { Stats } from '@/components/stats';
import { PhotoStrip } from '@/components/photo-strip';
import { Services } from '@/components/services';
import { TagsMarquee } from '@/components/tags-marquee';
import { About } from '@/components/about';
import { Gallery } from '@/components/gallery';
import { HowItWorks } from '@/components/how-it-works';
import { Testimonials } from '@/components/testimonials';
import { CTA } from '@/components/cta';
import { Footer } from '@/components/footer';

export default function Page() {
  return (
    <>
      <Nav />
      <Hero />
      <Stats />
      <PhotoStrip />
      <Services />
      <TagsMarquee />
      <About />
      <Gallery />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
