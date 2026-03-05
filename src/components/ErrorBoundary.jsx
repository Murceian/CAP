import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    if (import.meta.env.MODE === "development") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-alert" role="alert">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or try again later.</p>
          {import.meta.env.MODE === "development" && this.state.error && (
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error.toString()}</pre>
              {this.state.errorInfo && (
                <pre>{this.state.errorInfo.componentStack}</pre>
              )}
            </details>
          )}
          <button
            className="cta ghost"
            onClick={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
