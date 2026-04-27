import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { RiKeyFill } from 'react-icons/ri'

function ClockIcon() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  return (
    <div className="font-mono text-2xl tracking-widest text-base-content/60 flex items-center gap-2">
      <RiKeyFill className="text-warning animate-pulse" />
      <span>{hours}:{minutes}:{seconds}</span>
    </div>
  )
}

function AnimatedKey({ style, delay }) {
  return (
    <div
      className="absolute text-warning/30 animate-pulse"
      style={{ ...style, animationDelay: `${delay}s` }}
    >
      <RiKeyFill className="w-10 h-10" />
    </div>
  )
}

function Error419() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedKey style={{ top: '15%', left: '10%' }} delay={0} />
      <AnimatedKey style={{ top: '25%', right: '15%' }} delay={0.5} />
      <AnimatedKey style={{ bottom: '20%', left: '20%' }} delay={1} />
      <AnimatedKey style={{ bottom: '30%', right: '10%' }} delay={1.5} />
      <AnimatedKey style={{ top: '60%', left: '5%' }} delay={2} />
      <AnimatedKey style={{ top: '10%', right: '25%' }} delay={2.5} />

      <div className={`text-center max-w-lg transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative mb-10">
          <div className="text-[8rem] sm:text-[12rem] font-black leading-none select-none tracking-tighter">
            <span className="absolute inset-0 text-transparent bg-clip-text bg-linear-to-br from-warning/20 to-warning/5 transform -rotate-6 blur-sm">
              419
            </span>
            <span className="relative text-transparent bg-clip-text bg-linear-to-br from-warning via-warning to-warning/80">
              419
            </span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36">
            <div className="absolute inset-0 rounded-full bg-warning/10 animate-ping"></div>
            <div className="absolute inset-4 rounded-full bg-warning/20 animate-pulse"></div>
            <div className="absolute inset-8 rounded-full bg-warning/30 flex items-center justify-center">
              <RiKeyFill className="w-8 h-8 sm:w-10 sm:h-10 text-warning" />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
            Pàgina expirada
          </h2>
          <p className="text-base-content/60 text-lg">
            La teva sessió ha expirat per inactivitat.
          </p>
          <p className="text-base-content/40 text-sm">
            Si us plau, inicia sessió de nou per continuar.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <ClockIcon />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="btn btn-warning btn-lg gap-2 shadow-lg shadow-warning/25 hover:shadow-warning/40 transition-shadow"
          >
            <RiKeyFill className="w-5 h-5" />
            Iniciar sessió
          </Link>
          <Link
            to="/"
            className="btn btn-ghost btn-lg gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Anar a l'inici
          </Link>
        </div>

        <div className="mt-10 p-4 bg-base-100/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-base-content/50 text-sm">
            <RiKeyFill className="w-4 h-4" />
            <span>La teva sessió expira per seguretat després de 2 hores d'inactivitat.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Error419