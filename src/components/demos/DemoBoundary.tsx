"use client";

import { Component, type ReactNode } from "react";

/** Si una demo falla, muestra un aviso en lugar de romper toda la página. */
export default class DemoBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(err: unknown) {
    console.error("Error en la demostración:", err);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="demo-error" role="alert">
          <strong>La demostración no pudo cargarse.</strong>
          <p>Recarga la página para intentarlo de nuevo.</p>
          <button className="btn btn-sm" onClick={() => this.setState({ error: false })}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
