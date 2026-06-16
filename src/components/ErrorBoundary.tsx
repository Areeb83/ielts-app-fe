import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    /** Optional custom fallback. If omitted, the default fallback UI is shown. */
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * React error boundary — catches render errors anywhere in the component tree
 * below it and shows a fallback UI instead of a blank screen.
 *
 * Must be a class component (React requirement for error boundaries).
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // TODO: send to an error reporting service (e.g. Sentry) when available
        if (import.meta.env.DEV) {
            console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            An unexpected error occurred. Please try again or go back to the home page.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs bg-gray-100 rounded-lg p-4 mb-6 overflow-auto text-red-600">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
