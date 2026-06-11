import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import TestDetailContainer from '../../components/TestDetailComponents/TestDetailContainer';
import TestLoadingScreen from '../../components/TestDetailComponents/TestLoadingScreen';
import { isNavbarFooterVisibleAtom } from '../../store/uiStore';
import type { TestData } from '../../types/question';

// ─── Import experimental test JSON ──────────────────────────────────────────
import book11Test1Listening from '../../data/academic/book-11/listening/test-1.json';
import book11Test2Listening from '../../data/academic/book-11/listening/test-2.json';
import book11Test3Listening from '../../data/academic/book-11/listening/test-3.json';
import book11Test4Listening from '../../data/academic/book-11/listening/test-4.json';
import book12Test1Listening from '../../data/academic/book-12/listening/test-1.json';
import book12Test2Listening from '../../data/academic/book-12/listening/test-2.json';
import book12Test3Listening from '../../data/academic/book-12/listening/test-3.json';
import book12Test4Listening from '../../data/academic/book-12/listening/test-4.json';
import book13Test1Listening from '../../data/academic/book-13/listening/test-1.json';
import book13Test2Listening from '../../data/academic/book-13/listening/test-2.json';
import book13Test3Listening from '../../data/academic/book-13/listening/test-3.json';
import book13Test4Listening from '../../data/academic/book-13/listening/test-4.json';
import book14Test1Listening from '../../data/academic/book-14/listening/test-1.json';
import book14Test2Listening from '../../data/academic/book-14/listening/test-2.json';
import book14Test3Listening from '../../data/academic/book-14/listening/test-3.json';
import book14Test4Listening from '../../data/academic/book-14/listening/test-4.json';
import book15Test1Listening from '../../data/academic/book-15/listening/test-1.json';
import book15Test2Listening from '../../data/academic/book-15/listening/test-2.json';
import book15Test3Listening from '../../data/academic/book-15/listening/test-3.json';
import book15Test4Listening from '../../data/academic/book-15/listening/test-4.json';
import book16Test1Listening from '../../data/academic/book-16/listening/test-1.json';
import book16Test2Listening from '../../data/academic/book-16/listening/test-2.json';
import book16Test3Listening from '../../data/academic/book-16/listening/test-3.json';
import book16Test4Listening from '../../data/academic/book-16/listening/test-4.json';
import book17Test1Listening from '../../data/academic/book-17/listening/test-1.json';
import book17Test2Listening from '../../data/academic/book-17/listening/test-2.json';
import book17Test3Listening from '../../data/academic/book-17/listening/test-3.json';
import book17Test4Listening from '../../data/academic/book-17/listening/test-4.json';
import book18Test1Listening from '../../data/academic/book-18/listening/test-1.json';
import book18Test2Listening from '../../data/academic/book-18/listening/test-2.json';
import book18Test3Listening from '../../data/academic/book-18/listening/test-3.json';
import book18Test4Listening from '../../data/academic/book-18/listening/test-4.json';
import book19Test1Listening from '../../data/academic/book-19/listening/test-1.json';
import book19Test2Listening from '../../data/academic/book-19/listening/test-2.json';
import book19Test3Listening from '../../data/academic/book-19/listening/test-3.json';
import book19Test4Listening from '../../data/academic/book-19/listening/test-4.json';

// Map of testId → JSON data (will be replaced by API calls later)
const testDataMap: Record<string, TestData> = {
    "book-11-test-1": book11Test1Listening as unknown as TestData,
    "book-11-test-2": book11Test2Listening as unknown as TestData,
    "book-11-test-3": book11Test3Listening as unknown as TestData,
    "book-11-test-4": book11Test4Listening as unknown as TestData,
    "book-12-test-1": book12Test1Listening as unknown as TestData,
    "book-12-test-2": book12Test2Listening as unknown as TestData,
    "book-12-test-3": book12Test3Listening as unknown as TestData,
    "book-12-test-4": book12Test4Listening as unknown as TestData,
    "book-13-test-1": book13Test1Listening as unknown as TestData,
    "book-13-test-2": book13Test2Listening as unknown as TestData,
    "book-13-test-3": book13Test3Listening as unknown as TestData,
    "book-13-test-4": book13Test4Listening as unknown as TestData,
    "book-14-test-1": book14Test1Listening as unknown as TestData,
    "book-14-test-2": book14Test2Listening as unknown as TestData,
    "book-14-test-3": book14Test3Listening as unknown as TestData,
    "book-14-test-4": book14Test4Listening as unknown as TestData,
    "book-15-test-1": book15Test1Listening as unknown as TestData,
    "book-15-test-2": book15Test2Listening as unknown as TestData,
    "book-15-test-3": book15Test3Listening as unknown as TestData,
    "book-15-test-4": book15Test4Listening as unknown as TestData,
    "book-16-test-1": book16Test1Listening as unknown as TestData,
    "book-16-test-2": book16Test2Listening as unknown as TestData,
    "book-16-test-3": book16Test3Listening as unknown as TestData,
    "book-16-test-4": book16Test4Listening as unknown as TestData,
    "book-17-test-1": book17Test1Listening as unknown as TestData,
    "book-17-test-2": book17Test2Listening as unknown as TestData,
    "book-17-test-3": book17Test3Listening as unknown as TestData,
    "book-17-test-4": book17Test4Listening as unknown as TestData,
    "book-18-test-1": book18Test1Listening as unknown as TestData,
    "book-18-test-2": book18Test2Listening as unknown as TestData,
    "book-18-test-3": book18Test3Listening as unknown as TestData,
    "book-18-test-4": book18Test4Listening as unknown as TestData,
    "book-19-test-1": book19Test1Listening as unknown as TestData,
    "book-19-test-2": book19Test2Listening as unknown as TestData,
    "book-19-test-3": book19Test3Listening as unknown as TestData,
    "book-19-test-4": book19Test4Listening as unknown as TestData,
};

export function ListeningTestActualPage() {
    const { examType, testId } = useParams<{ examType: string; testId: string }>();
    const bookId = testId?.split('-test-')[0];
    const navigate = useNavigate();
    const setNavbarFooterVisible = useSetAtom(isNavbarFooterVisibleAtom);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setNavbarFooterVisible(false);
        return () => setNavbarFooterVisible(true);
    }, [setNavbarFooterVisible]);

    // Simulate loading (will be replaced by real API call later)
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Look up the test data
    const testData = testId ? testDataMap[testId] : undefined;

    if (loading) return <TestLoadingScreen />;

    if (!testData) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h2>Test not found</h2>
                <p>No test data found for ID: <code>{testId}</code></p>
                <button onClick={() => navigate(-1)} style={{ marginTop: 16, padding: "8px 20px", cursor: "pointer" }}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            <TestDetailContainer
                candidateId={`Student-${bookId}-${testId}`}
                testData={testData}
            />
        </div>
    );
}

export default ListeningTestActualPage;
