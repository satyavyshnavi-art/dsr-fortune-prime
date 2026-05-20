"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-red-50 p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
          </div>
          <h2 className="text-[15px] font-semibold text-slate-800 mb-1">
            Something went wrong
          </h2>
          <p className="text-[12px] text-slate-500 max-w-sm mb-4">
            {this.state.error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="h-8 text-[12px] gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
