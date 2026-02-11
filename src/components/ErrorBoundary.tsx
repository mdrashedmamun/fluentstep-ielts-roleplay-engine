import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-red-50 p-6">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl">
            <i className="fas fa-exclamation"></i>
          </div>
          <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-4xl font-black text-red-900">Something went wrong</h1>
            <p className="text-red-700 text-lg">{this.state.error.message}</p>
            <details className="mt-6 p-4 bg-red-100 rounded-lg text-left text-sm text-red-800 font-mono overflow-auto max-h-48">
              <summary className="cursor-pointer font-bold mb-2">Error Details</summary>
              <pre>{this.state.error.stack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 mt-6 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
