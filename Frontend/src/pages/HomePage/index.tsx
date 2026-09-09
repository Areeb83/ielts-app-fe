import { Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../store/authStore';
import { Hero } from './Hero';
import { ExamTypes } from './ExamTypes';
import { SkillsSection } from './SkillsSection';
import { FullMockCTA } from './FullMockCTA';

export function HomePage() {
  const user = useAtomValue(userAtom);

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ExamTypes />
      <SkillsSection />
      <FullMockCTA />
    </div>
  );
}
