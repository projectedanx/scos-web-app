import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public componentDidMount() {
    window.addEventListener('firestore-error', this.handleFirestoreErrorEvent as EventListener);
  }

  public componentWillUnmount() {
    window.removeEventListener('firestore-error', this.handleFirestoreErrorEvent as EventListener);
  }

  private handleFirestoreErrorEvent = (event: CustomEvent<Error>) => {
    this.setState({ hasError: true, error: event.detail });
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Firestore Permission Denied during ${parsed.operationType} operation on path: ${parsed.path || 'unknown'}. Please check your Firebase Security Rules.`;
          }
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-950/50 rounded-full flex items-center justify-center border border-red-900/50">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Application Error</h1>
                <p className="text-zinc-400">The system encountered an unrecoverable state.</p>
              </div>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-red-400 border border-red-900/30 overflow-x-auto mb-6">
              {errorMessage}
            </div>

            {isFirestoreError && (
              <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-500 font-bold mb-2">Security Rules Issue Detected</h3>
                <p className="text-zinc-300 text-sm">
                  The application attempted to access Firestore but was denied. This usually means the Firebase Security Rules for this project are not configured correctly to allow this operation.
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
