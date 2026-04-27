import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { RiKeyFill } from 'react-icons/ri'

function FloatingKey({ delay, duration, startX, startY }) {
  return (
    <div
      className="absolute text-primary/20 animate-bounce"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <RiKeyFill className="w-8 h-8" />
    </div>
  )
}

function Error404() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const floatingKeys = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      delay: i * 0.5,
      duration: 3 + (i * 0.3) % 2,
      startX: 10 + i * 15,
      startY: 20 + (i * 17) % 60
    }))
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 via-base-300 to-base-200 overflow-hidden relative">
      {floatingKeys.map((key) => (
        <FloatingKey
          key={key.id}
          delay={key.delay}
          duration={key.duration}
          startX={key.startX}
          startY={key.startY}
        />
      ))}

      <div
        className="flex items-center justify-center min-h-screen p-4 transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="text-center max-w-2xl relative z-10">
          <div className="relative mb-10">
            <div className="text-[8rem] sm:text-[12rem] font-black leading-none select-none tracking-tighter">
              <span
                className="absolute inset-0 text-transparent bg-clip-text bg-linear-to-br from-primary/20 to-primary/5 transform -rotate-3 blur-sm"
                style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) rotate(-3deg)` }}
              >
                404
              </span>
              <span
                className="relative text-transparent bg-clip-text bg-linear-to-br from-primary via-primary to-primary/80"
                style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
              >
                404
              </span>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
              <div className="absolute inset-3 rounded-full bg-primary/20"></div>
              <div className="absolute inset-6 rounded-full bg-primary/30 flex items-center justify-center">
                <RiKeyFill className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-base-content tracking-tight">
              Pàgina no trobada
            </h2>
            <p className="text-base-content/60 text-lg max-w-md mx-auto">
              La ruta a la qual tries accedir no existeix. Potser s'ha mogut o eliminat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Tornar a l'inici
            </Link>
            
          </div>

          
        </div>
      </div>
    </div>
  )
}

export default Error404