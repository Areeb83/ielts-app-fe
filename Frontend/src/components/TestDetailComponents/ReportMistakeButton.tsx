import { useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { GoAlert } from "react-icons/go";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from "../ui/dialog";
import axiosInstance from "../../api/axiosInstance";
import { getAccessToken } from "../../api/axiosInstance";

const ReportMistakeButton = () => {
    const { testId } = useParams<{ testId: string }>();
    const { pathname } = useLocation();
    const module = pathname.includes('/listening') ? 'listening' : pathname.includes('/reading') ? 'reading' : pathname.includes('/writing') ? 'writing' : 'unknown';
    const [reportOpen, setReportOpen] = useState(false);
    const [reportType, setReportType] = useState("");
    const [reportQuestion, setReportQuestion] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleReportSubmit = useCallback(async () => {
        if (!getAccessToken()) {
            toast.error('Please sign in to submit a report');
            setReportOpen(false);
            return;
        }

        setSubmitting(true);
        try {
            await axiosInstance.post('/reports', {
                testId: testId || '',
                module,
                reportType,
                questionNumber: reportQuestion,
                description: reportDescription,
            });
            toast.success('Report submitted. Thank you!');
            setReportType("");
            setReportQuestion("");
            setReportDescription("");
            setReportOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    }, [testId, reportType, reportQuestion, reportDescription]);

    return (
        <>
            <button
                onClick={() => setReportOpen(true)}
                aria-label="Report a mistake"
                className="header__report-btn"
            >
                <GoAlert size={20} />
            </button>

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Found a mistake? Let us know!</DialogTitle>
                        <DialogDescription>
                            Help us improve by reporting errors in questions, answers, or audio.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="report-form">
                        <div className="report-form__field">
                            <label htmlFor="report-type">Issue Type</label>
                            <select
                                id="report-type"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="">Select an issue type</option>
                                <option value="wrong-answer">Wrong Answer</option>
                                <option value="typo">Typo / Spelling Error</option>
                                <option value="audio-issue">Audio Issue</option>
                                <option value="missing-content">Missing Content</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="report-form__field">
                            <label htmlFor="report-question">Question Number (optional)</label>
                            <input
                                id="report-question"
                                type="text"
                                placeholder="e.g. 14"
                                value={reportQuestion}
                                onChange={(e) => setReportQuestion(e.target.value)}
                            />
                        </div>

                        <div className="report-form__field">
                            <label htmlFor="report-description">Description</label>
                            <textarea
                                id="report-description"
                                rows={4}
                                placeholder="Describe the issue..."
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button className="report-form__cancel-btn">Cancel</button>
                        </DialogClose>
                        <button
                            className="report-form__submit-btn"
                            onClick={handleReportSubmit}
                            disabled={!reportType || !reportDescription || submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ReportMistakeButton;
