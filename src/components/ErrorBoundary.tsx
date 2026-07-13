import { Component, type ErrorInfo, type ReactNode } from "react";
import { toast } from "sonner";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
        }
        toast.error(error.message || 'Something went wrong');
        // Auto-recover: reset error state so the page stays visible
        setTimeout(() => {
            this.setState({ hasError: false });
        }, 0);
    }

    render() {
        return this.props.children;
    }
}

export default ErrorBoundary;
