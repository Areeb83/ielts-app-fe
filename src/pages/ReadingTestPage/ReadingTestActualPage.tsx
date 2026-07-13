import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import TestDetailContainer from '../../components/TestDetailComponents/TestDetailContainer';
import TestLoadingScreen from '../../components/TestDetailComponents/TestLoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';
import { isNavbarFooterVisibleAtom } from '../../store/uiStore';
import type { TestData } from '../../types/question';
import axiosInstance from '../../api/axiosInstance';

export function ReadingTestActualPage() {
    const { examType, testId } = useParams<{ examType: string; testId: string }>();
    const bookId = testId?.split('-test-')[0];
    const testSlug = testId ? `test-${testId.split('-test-')[1]}` : '';
    const navigate = useNavigate();
    const setNavbarFooterVisible = useSetAtom(isNavbarFooterVisibleAtom);

    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<TestData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setNavbarFooterVisible(false);
        return () => setNavbarFooterVisible(true);
    }, [setNavbarFooterVisible]);

    useEffect(() => {
        if (!testId || !bookId || !examType) return;

        axiosInstance
            .get(`/reading/${examType}/books/${bookId}/tests/${testSlug}`)
            .then((res) => {
                setTestData(res.data.data as TestData);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch reading test from API:', err);
                setError(`Failed to load test: ${testId}`);
                setLoading(false);
            });
    }, [testId, bookId, examType, testSlug]);

    if (loading) return <TestLoadingScreen />;

    if (error || !testData) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>Test not found</h2>
                <p>{error || `No reading test data found for ID: ${testId}`}</p>
                <button onClick={() => navigate(-1)} style={{ marginTop: 16, padding: "8px 20px", cursor: "pointer" }}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            <ErrorBoundary>
                <TestDetailContainer
                    candidateId={`Student-${bookId}-${testId}`}
                    testData={testData}
                    testType="reading"
                />
            </ErrorBoundary>
        </div>
    );
}

export default ReadingTestActualPage;
