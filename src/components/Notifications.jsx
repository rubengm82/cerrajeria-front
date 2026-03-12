import { useEffect, useState } from 'react'

function Notifications({ type, title, message, errors, autoClose = true }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsClosing(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [autoClose, message])
  const config = {
    success: {
      className: "alert alert-success border border-success-content/30 mt-5",
      title: "Operación realizada correctamente",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      className: "alert alert-error border border-error-content/30 mt-5",
      title: "Por favor, corrige los siguientes errores:",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      className: "alert alert-warning border border-warning-content/30 mt-5",
      title: "Atención",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-.01-12a9 9 0 110 18 9 9 0 010-18z" />
        </svg>
      )
    },
    info: {
      className: "alert alert-info border border-info-content/30 mt-5",
      title: "Información",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
      )
    }
  }

  const currentNotification = config[type] || config.info
  
  return (
    <div 
      role="alert" 
      className={`fixed bottom-12 right-2 w-102 shadow-lg z-50 animate-slide-in ${currentNotification.className}`}
      style={{
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.5s ease'
      }}
    >
      {currentNotification.icon}
      <div>
        <h3 className="font-bold mb-1">{title || currentNotification.title}</h3>
        {message && <p>{message}</p>}
        
        {/* Si son errores se muestran en lista */}
        {errors && (
          <ul className="list-disc list-inside">
            {Object.entries(errors).map(([field, messages]) =>
              messages.map((msg, index) => (
                <li key={`${field}-${index}`}>{msg}</li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Notifications