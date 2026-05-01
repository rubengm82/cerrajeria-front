import { Link } from 'react-router-dom'
import './error404.css'

function Error404() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-200 px-6 py-12">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
          <div className="error-404-door-scene relative flex h-80 w-72 items-center justify-center">
            <div className="absolute bottom-0 h-5 w-64 rounded-full bg-base-content/10 blur-sm" />
            <div className="relative h-72 w-52 rounded-t-[1.75rem] border-[12px] border-base-content/80 bg-base-content/10 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-t-2xl bg-base-content">
                <span className="select-none text-7xl font-black text-primary">
                  404
                </span>
              </div>

              <div className="error-404-door absolute -left-1 top-0 h-full w-full origin-left rounded-t-xl border border-primary/25 bg-primary shadow-2xl shadow-primary/25">
                <div className="absolute inset-4 rounded-lg border-2 border-primary-content/35" />
                <div className="absolute inset-x-8 top-10 h-16 rounded-md border-2 border-primary-content/30" />
                <div className="absolute inset-x-8 bottom-10 h-24 rounded-md border-2 border-primary-content/30" />

                <div className="absolute right-8 top-34 flex items-center gap-2">
                  <span className="error-404-handle h-4 w-10 rounded-full bg-base-content/70" />
                  <span className="h-7 w-7 rounded-full border-4 border-base-content/70 bg-primary-content" />
                </div>

                <div className="absolute bottom-5 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-primary-content/30" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left">
          <h1 className="text-8xl font-black leading-none text-primary sm:text-9xl">
            404
          </h1>
          <p className="mt-4 text-2xl font-bold leading-tight text-base-content sm:text-3xl">
            Aquesta clau no obre cap porta
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-base-content/65 lg:mx-0">
            Hem provat la còpia, hem revisat el pany i aquesta ruta no existeix o ha canviat de lloc.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/"
              className="btn btn-primary"
            >
              Tornar a l'inici
            </Link>
            <Link
              to="/products"
              className="btn btn-outline"
            >
              Veure productes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Error404
