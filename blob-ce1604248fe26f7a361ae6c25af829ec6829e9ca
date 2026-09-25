import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onError: () => void;
};

type State = { failed: boolean };

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
