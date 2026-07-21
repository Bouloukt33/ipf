import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';
import { getPlans } from '@/lib/plans';

export default async function Home() {
    const plans = await getPlans();

    return (
        <div className="min-h-screen font-nunito overflow-x-hidden">
            <Navbar />
            <Hero />
            <Stats />
            <Features />
            <Pricing plans={plans} />
            <CtaBanner />
            <Footer />
        </div>
    );
}
