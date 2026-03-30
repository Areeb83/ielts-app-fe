import { Hero } from './Hero';
import { ExamTypes } from './ExamTypes';
import { SkillsSection } from './SkillsSection';
import { FullMockCTA } from './FullMockCTA';
import { Footer } from '../../components/Footer';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ExamTypes />
      <SkillsSection />
      <FullMockCTA />
    </div>
  );
}
