/**
 * ErrorBoundary Component
 * Catches React errors and displays user-friendly fallback UI
 * Prevents entire app from crashing due to a single component error
 */

import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactElement {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return <>{this.props.fallback(this.state.error, this.reset)}</>;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
            {/* Error Icon */}
            <div className="text-6xl">⚠️</div>

            {/* Error Heading */}
            <h1 className="text-2xl font-bold text-red-600">Oops! Something went wrong</h1>

            {/* Error Message */}
            <div className="space-y-2">
              <p className="text-neutral-600">We encountered an unexpected error. Don't worry, your progress is saved.</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-mono text-red-500 hover:text-red-600">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 p-3 bg-red-50 rounded border border-red-200 text-xs overflow-auto max-h-48 text-red-800">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={this.reset}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Go Home
              </button>
            </div>

            {/* Support Message */}
            <p className="text-xs text-neutral-500 pt-2">
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary;
