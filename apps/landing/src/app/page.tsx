import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';

export default function Home() {
    return (
        <div className="min-h-screen font-nunito overflow-x-hidden">
            <Navbar />
            <Hero />
            <Stats />
            <Features />
            <Pricing />
            <CtaBanner />
            <Footer />
        </div>
    );
}
