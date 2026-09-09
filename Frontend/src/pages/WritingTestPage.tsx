import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { FaCheck } from 'react-icons/fa';
import { toast } from 'sonner';
import { userAtom } from '../store/authStore';
import Header from '../components/TestDetailComponents/Header';
import SplitPane from '../components/ui/SplitPane/SplitPane';
import axiosInstance from '../api/axiosInstance';
import '../styles/TestPagesStyle.css';

// Sample writing prompts — Task 1 and Task 2
const WRITING_PROMPTS: Record<string, { task1: string; task2: string; task1Image?: string }> = {
  'book-11-test-1': {
    task1: 'The charts below show the percentage of water used for different purposes in six areas of the world. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    task1Image: '/images/book-11-test-1-passage2-falkirk-wheel.jpg',
    task2: 'Governments should spend money on railways rather than roads. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
  },
};

const DEFAULT_PROMPTS = {
  task1: 'The graph below shows information about a topic. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
  task1Image: '/images/book-11-test-1-passage2-falkirk-wheel.jpg',
  task2: 'Some people believe that technology has made our lives more complex, while others think it has made life simpler. Discuss both views and give your own opinion. Write at least 250 words.',
};

export function WritingTestPage() {
  const { examType, testId } = useParams<{ examType: string; testId: string }>();
  const navigate = useNavigate();
  const user = useAtomValue(userAtom);

  const [activeTask, setActiveTask] = useState<1 | 2>(1);
  const [task1Response, setTask1Response] = useState('');
  const [task2Response, setTask2Response] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef(Date.now());

  const prompts = WRITING_PROMPTS[testId || ''] || DEFAULT_PROMPTS;
  const task1Image = (WRITING_PROMPTS[testId || ''] || DEFAULT_PROMPTS).task1Image;
  const currentResponse = activeTask === 1 ? task1Response : task2Response;
  const setCurrentResponse = activeTask === 1 ? setTask1Response : setTask2Response;
  const wordCount = currentResponse.trim() ? currentResponse.trim().split(/\s+/).length : 0;
  const minWords = activeTask === 1 ? 150 : 250;
  const handleSubmitTask = async () => {
    if (!user) {
      toast.error('Please sign in to submit');
      return;
    }

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const task1WC = task1Response.trim() ? task1Response.trim().split(/\s+/).length : 0;
      const task2WC = task2Response.trim() ? task2Response.trim().split(/\s+/).length : 0;

      await axiosInstance.post('/writing/submit', {
        testId: testId || 'unknown',
        tasks: [
          { taskNumber: 1, prompt: prompts.task1, response: task1Response, wordCount: task1WC },
          { taskNumber: 2, prompt: prompts.task2, response: task2Response, wordCount: task2WC },
        ],
        timeSpent,
      });
      setSubmitted(true);
      toast.success('Writing test submitted! Your tutor will review it soon.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  // Timer — countdown from 60 minutes
  const totalDuration = 60 * 60;
  const [elapsedTime, setElapsedTime] = useState('60');

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalDuration - elapsed);
      if (remaining <= 180) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        setElapsedTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      } else {
        setElapsedTime(String(Math.floor(remaining / 60)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const task1HasContent = submitted || task1Response.trim().length > 0;
  const task2HasContent = submitted || task2Response.trim().length > 0;

  return (
    <div className="listening-test-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Reuse the same Header as listening/reading */}
      <Header
        candidateId={user?.name || 'Guest'}
        testType="writing"
        elapsedTime={elapsedTime}
      />

      {/* Main Content */}
      <main className="test-content" style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="section-header-banner">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#333", margin: 0, display: 'inline' }}>
            Part {activeTask}
          </h2>
          <span style={{ fontSize: 14, color: "#555", marginLeft: 12 }}>
            {activeTask === 1
              ? 'You should spend about 20 minutes on this task. Write at least 150 words.'
              : 'You should spend about 40 minutes on this task. Write at least 250 words.'}
          </span>
        </div>
        <div style={{ flexGrow: 1, overflow: 'hidden' }}>
          <SplitPane
            leftPane={
              <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed text-[15px]">
                    {activeTask === 1 ? prompts.task1 : prompts.task2}
                  </p>
                  {activeTask === 1 && task1Image && (
                    <img
                      src={task1Image}
                      alt="Task 1 visual"
                      style={{ width: '550px', maxWidth: '100%', marginTop: '20px', borderRadius: '4px' }}
                    />
                  )}
                </div>
              </div>
            }
            rightPane={
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 16px' }}>
                {submitted ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Writing Test Submitted</h3>
                      <p className="text-gray-500 text-sm">
                        Your answer is being reviewed by our tutor. You'll receive detailed feedback and a band score soon.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = Math.max(250, el.scrollHeight) + 'px';
                        }
                      }}
                      value={currentResponse}
                      onChange={(e) => {
                        setCurrentResponse(e.target.value);
                        const el = e.target;
                        el.style.height = 'auto';
                        el.style.height = Math.max(250, el.scrollHeight) + 'px';
                      }}
                      placeholder=""
                      style={{ minHeight: '250px', width: '100%', padding: '16px', fontSize: '15px', lineHeight: '1.8', color: '#1f2937', backgroundColor: '#fff', border: '1.5px solid #1a1a1a', borderRadius: '8px', resize: 'none', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                      <span className={`text-sm font-medium ${wordCount >= minWords ? 'text-green-600' : 'text-gray-500'}`}>
                        {wordCount} / {minWords} words
                      </span>
                    </div>
                  </>
                )}
              </div>
            }
          />
        </div>
      </main>

      {/* Footer — same style as listening/reading */}
      <footer className="ielts-footer" style={{ position: 'fixed' }}>
        <div className="ielts-footer__parts-row">
          {[1, 2].map((task, idx) => {
            const isActive = activeTask === task;
            const hasContent = task === 1 ? task1HasContent : task2HasContent;
            const barColor = hasContent ? '#2f9e44' : '#d4d8dd';
            return (
              <React.Fragment key={task}>
                {idx > 0 && <div className="ielts-footer__divider" />}
                <button
                  type="button"
                  onClick={() => setActiveTask(task as 1 | 2)}
                  style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0 16px 10px', display: 'flex', alignItems: 'flex-start', gap: '8px', position: 'relative', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Full-width bar at top */}
                  <div style={{ position: 'absolute', top: 0, left: '16px', right: '16px', height: '3px', backgroundColor: barColor }} />
                  <span style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#1a1a1a',
                    whiteSpace: 'nowrap',
                    paddingTop: '16px',
                  }}>
                    Task {task}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Submit button */}
        <button
          className="ielts-footer__submit-btn"
          onClick={handleSubmitTask}
          disabled={submitting}
          title="Submit"
          aria-label="Submit"
        >
          <FaCheck size={20} />
        </button>
      </footer>
    </div>
  );
}

export default WritingTestPage;
