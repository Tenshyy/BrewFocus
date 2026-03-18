"use client";

import { Component, type ReactNode } from "react";
import LucideIcon from "@/components/ui/LucideIcon";

interface Props {
  featureName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary that catches crashes in individual features.
 * Instead of crashing the whole app, it shows a minimal fallback
 * and lets the user continue using other features.
 */
export default class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[BrewFocus] ${this.props.featureName} crashed:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-brew-border bg-brew-panel/50 text-[11px] text-brew-gray">
          <LucideIcon name="alert-triangle" size={14} className="text-brew-orange flex-shrink-0" />
          <span className="flex-1">{this.props.featureName}</span>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-[10px] text-brew-orange hover:text-brew-cream transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
