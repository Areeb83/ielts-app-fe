import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import TestDetailContainer from '../../components/TestDetailComponents/TestDetailContainer';
import TestLoadingScreen from '../../components/TestDetailComponents/TestLoadingScreen';
import { isNavbarFooterVisibleAtom } from '../../store/uiStore';
import type { TestData } from '../../types/question';

// ─── Import experimental test JSON ──────────────────────────────────────────
import book11Test1Reading from '../../data/academic/book-11/reading/test-1.json';
import book11Test2Reading from '../../data/academic/book-11/reading/test-2.json';
import book11Test3Reading from '../../data/academic/book-11/reading/test-3.json';
import book11Test4Reading from '../../data/academic/book-11/reading/test-4.json';
import book12Test1Reading from '../../data/academic/book-12/reading/test-1.json';
import book12Test2Reading from '../../data/academic/book-12/reading/test-2.json';
import book12Test3Reading from '../../data/academic/book-12/reading/test-3.json';
import book12Test4Reading from '../../data/academic/book-12/reading/test-4.json';
import book13Test1Reading from '../../data/academic/book-13/reading/test-1.json';
import book13Test2Reading from '../../data/academic/book-13/reading/test-2.json';
import book13Test3Reading from '../../data/academic/book-13/reading/test-3.json';
import book13Test4Reading from '../../data/academic/book-13/reading/test-4.json';
import book14Test1Reading from '../../data/academic/book-14/reading/test-1.json';
import book14Test2Reading from '../../data/academic/book-14/reading/test-2.json';
import book14Test3Reading from '../../data/academic/book-14/reading/test-3.json';
import book14Test4Reading from '../../data/academic/book-14/reading/test-4.json';
import book15Test1Reading from '../../data/academic/book-15/reading/test-1.json';
import book15Test2Reading from '../../data/academic/book-15/reading/test-2.json';
import book15Test3Reading from '../../data/academic/book-15/reading/test-3.json';
import book15Test4Reading from '../../data/academic/book-15/reading/test-4.json';
import book16Test1Reading from '../../data/academic/book-16/reading/test-1.json';
import book16Test2Reading from '../../data/academic/book-16/reading/test-2.json';
import book16Test3Reading from '../../data/academic/book-16/reading/test-3.json';
import book16Test4Reading from '../../data/academic/book-16/reading/test-4.json';
import book17Test1Reading from '../../data/academic/book-17/reading/test-1.json';
import book17Test2Reading from '../../data/academic/book-17/reading/test-2.json';
import book17Test3Reading from '../../data/academic/book-17/reading/test-3.json';
import book17Test4Reading from '../../data/academic/book-17/reading/test-4.json';
import book18Test1Reading from '../../data/academic/book-18/reading/test-1.json';
import book18Test2Reading from '../../data/academic/book-18/reading/test-2.json';
import book18Test3Reading from '../../data/academic/book-18/reading/test-3.json';
import book18Test4Reading from '../../data/academic/book-18/reading/test-4.json';
import book19Test1Reading from '../../data/academic/book-19/reading/test-1.json';
import book19Test2Reading from '../../data/academic/book-19/reading/test-2.json';
import book19Test3Reading from '../../data/academic/book-19/reading/test-3.json';
import book19Test4Reading from '../../data/academic/book-19/reading/test-4.json';

// Map of testId → JSON data (will be replaced by API calls later)
const testDataMap: Record<string, TestData> = {
    "book-11-test-1": book11Test1Reading as unknown as TestData,
    "book-11-test-2": book11Test2Reading as unknown as TestData,
    "book-11-test-3": book11Test3Reading as unknown as TestData,
    "book-11-test-4": book11Test4Reading as unknown as TestData,
    "book-12-test-1": book12Test1Reading as unknown as TestData,
    "book-12-test-2": book12Test2Reading as unknown as TestData,
    "book-12-test-3": book12Test3Reading as unknown as TestData,
    "book-12-test-4": book12Test4Reading as unknown as TestData,
    "book-13-test-1": book13Test1Reading as unknown as TestData,
    "book-13-test-2": book13Test2Reading as unknown as TestData,
    "book-13-test-3": book13Test3Reading as unknown as TestData,
    "book-13-test-4": book13Test4Reading as unknown as TestData,
    "book-14-test-1": book14Test1Reading as unknown as TestData,
    "book-14-test-2": book14Test2Reading as unknown as TestData,
    "book-14-test-3": book14Test3Reading as unknown as TestData,
    "book-14-test-4": book14Test4Reading as unknown as TestData,
    "book-15-test-1": book15Test1Reading as unknown as TestData,
    "book-15-test-2": book15Test2Reading as unknown as TestData,
    "book-15-test-3": book15Test3Reading as unknown as TestData,
    "book-15-test-4": book15Test4Reading as unknown as TestData,
    "book-16-test-1": book16Test1Reading as unknown as TestData,
    "book-16-test-2": book16Test2Reading as unknown as TestData,
    "book-16-test-3": book16Test3Reading as unknown as TestData,
    "book-16-test-4": book16Test4Reading as unknown as TestData,
    "book-17-test-1": book17Test1Reading as unknown as TestData,
    "book-17-test-2": book17Test2Reading as unknown as TestData,
    "book-17-test-3": book17Test3Reading as unknown as TestData,
    "book-17-test-4": book17Test4Reading as unknown as TestData,
    "book-18-test-1": book18Test1Reading as unknown as TestData,
    "book-18-test-2": book18Test2Reading as unknown as TestData,
    "book-18-test-3": book18Test3Reading as unknown as TestData,
    "book-18-test-4": book18Test4Reading as unknown as TestData,
    "book-19-test-1": book19Test1Reading as unknown as TestData,
    "book-19-test-2": book19Test2Reading as unknown as TestData,
    "book-19-test-3": book19Test3Reading as unknown as TestData,
    "book-19-test-4": book19Test4Reading as unknown as TestData,
};

export function ReadingTestActualPage() {
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
                <p>No reading test data found for ID: <code>{testId}</code></p>
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
                testType="reading"
            />
        </div>
    );
}

export default ReadingTestActualPage;
