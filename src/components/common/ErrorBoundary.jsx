import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Erreur de rendu Atelier Naya :', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-ivory px-5 text-center">
          <div>
            <p className="font-display text-4xl">Atelier Naya</p>
            <h1 className="mt-6 font-display text-3xl">La page n’a pas pu s’afficher.</h1>
            <p className="mt-3 text-sm text-black/55">
              Actualisez la page pour reprendre votre visite.
            </p>
            <button
              className="mt-7 bg-ink px-6 py-3 text-sm font-semibold text-white"
              onClick={() => window.location.reload()}
            >
              Actualiser la page
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
