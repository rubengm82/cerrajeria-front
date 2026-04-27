import { Link } from 'react-router-dom'
import { RiKeyFill } from 'react-icons/ri'

function Error403() {
  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="relative mb-10">
          <div className="text-[8rem] sm:text-[10rem] font-black leading-none select-none tracking-tighter">
            <span className="absolute inset-0 text-transparent bg-clip-text bg-linear-to-br from-error/20 to-error/5 transform -rotate-6">403</span>
            <span className="relative text-transparent bg-clip-text bg-linear-to-br from-error via-error to-error/80">403</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36">
            <div className="absolute inset-0 rounded-full bg-error/10 animate-ping"></div>
            <div className="absolute inset-4 rounded-full bg-error/20"></div>
            <div className="absolute inset-8 rounded-full bg-error/30 flex items-center justify-center">
              <RiKeyFill className="w-10 h-10 sm:w-14 sm:h-14 text-error" />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content tracking-tight">Accés prohibit</h2>
          <p className="text-base-content/60 text-lg">No tens permisos per accedir a aquesta pàgina</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn btn-primary btn-lg gap-2 shadow-lg shadow-error/25 hover:shadow-error/40 transition-shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Tornar a l'inici
          </Link>
          <Link
            to="/contact"
            className="btn btn-outline btn-lg gap-2"
          >
            <RiKeyFill className="w-5 h-5" />
            Contactar suport
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Error403