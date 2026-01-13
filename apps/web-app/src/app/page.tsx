import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import Features from '@/app/components/Features';
import Pricing from '@/app/components/Pricing';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-dark overflow-x-hidden font-nunito text-white">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}