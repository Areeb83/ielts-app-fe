import { Hero } from '../components/Hero';
import { ExamTypes } from '../components/ExamTypes';
import { SkillsSection } from '../components/SkillsSection';
import { FullMockCTA } from '../components/FullMockCTA';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ExamTypes />
      <SkillsSection />
      <FullMockCTA />
      <Footer />
    </div>
  );
}
