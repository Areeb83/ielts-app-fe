import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import TestDetailContainer from '../../components/TestDetailComponents/TestDetailContainer';
import { isNavbarFooterVisibleAtom } from '../../store/uiStore';
import type { TestData } from '../../types/question';

// ─── Import experimental test JSON ──────────────────────────────────────────
import book11Test1Reading from '../../data/academic/book-11/reading/test-1.json';

// Map of testId → JSON data (will be replaced by API calls later)
const testDataMap: Record<string, TestData> = {
    "book-11-test-1": book11Test1Reading as unknown as TestData,
};

export function ReadingTestActualPage() {
    const { examType, bookId, testId } = useParams<{ examType: string; bookId: string; testId: string }>();
    const navigate = useNavigate();
    const setNavbarFooterVisible = useSetAtom(isNavbarFooterVisibleAtom);

    useEffect(() => {
        setNavbarFooterVisible(false);
        return () => setNavbarFooterVisible(true);
    }, [setNavbarFooterVisible]);

    // Look up the test data
    const testData = testId ? testDataMap[testId] : undefined;

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
