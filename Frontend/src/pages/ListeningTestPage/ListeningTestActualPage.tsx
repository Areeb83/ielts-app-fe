import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import TestDetailContainer from '../../components/TestDetailComponents/TestDetailContainer';
import TestLoadingScreen from '../../components/TestDetailComponents/TestLoadingScreen';
import ErrorBoundary from '../../components/ErrorBoundary';
import { userAtom } from '../../store/authStore';
import type { TestData } from '../../types/question';
import axiosInstance from '../../api/axiosInstance';

export function ListeningTestActualPage() {
    const { examType, testId } = useParams<{ examType: string; testId: string }>();
    const bookId = testId?.split('-test-')[0];
    const testSlug = testId ? `test-${testId.split('-test-')[1]}` : '';
    const navigate = useNavigate();
    const user = useAtomValue(userAtom);

    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<TestData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!testId || !bookId || !examType) return;

        axiosInstance
            .get(`/listening/${examType}/books/${bookId}/tests/${testSlug}`)
            .then((res) => {
                setTestData(res.data.data as TestData);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch test from API:', err);
                setError(`Failed to load test: ${testId}`);
                setLoading(false);
            });
    }, [testId, bookId, examType, testSlug]);

    if (loading) return <TestLoadingScreen />;

    if (error || !testData) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>Test not found</h2>
                <p>{error || `No test data found for ID: ${testId}`}</p>
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
                    candidateId={user?.name || 'Guest'}
                    testData={testData}
                />
            </ErrorBoundary>
        </div>
    );
}

export default ListeningTestActualPage;
