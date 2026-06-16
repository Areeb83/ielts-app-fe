import { useState, useCallback } from "react";
import { GoAlert } from "react-icons/go";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter, DialogClose,
} from "../ui/dialog";

const ReportMistakeButton = () => {
    const [reportOpen, setReportOpen] = useState(false);
    const [reportType, setReportType] = useState("");
    const [reportQuestion, setReportQuestion] = useState("");
    const [reportDescription, setReportDescription] = useState("");

    const handleReportSubmit = useCallback(() => {
        // TODO: wire up to the report API endpoint when backend is ready
        if (import.meta.env.DEV) {
            console.log("Report submitted:", { reportType, reportQuestion, reportDescription });
        }
        setReportType("");
        setReportQuestion("");
        setReportDescription("");
        setReportOpen(false);
    }, [reportType, reportQuestion, reportDescription]);

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
                            disabled={!reportType || !reportDescription}
                        >
                            Submit Report
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ReportMistakeButton;
