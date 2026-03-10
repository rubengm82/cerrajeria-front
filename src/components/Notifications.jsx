import { useEffect, useState } from 'react'
import { HiCheckCircle, HiExclamationCircle, HiExclamationTriangle, HiInformationCircle } from 'react-icons/hi2'

function Notifications({ type, title, message, errors, autoClose = true }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsClosing(true)
        // Remover del DOM después de la transición (500ms)
        setTimeout(() => {
          const element = document.getElementById('notification-root')
          if (element) element.remove()
        }, 500)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [autoClose])
  const config = {
    success: {
      className: "alert alert-success border border-success-content/30 mt-5",
      title: "Operación realizada correctamente",
      icon: (
        <HiCheckCircle className="h-6 w-6 shrink-0" />
      )
    },
    error: {
      className: "alert alert-error border border-error-content/30 mt-5",
      title: "Por favor, corrige los siguientes errores:",
      icon: (
        <HiExclamationCircle className="h-6 w-6 shrink-0" />
      )
    },
    warning: {
      className: "alert alert-warning border border-warning-content/30 mt-5",
      title: "Atención",
      icon: (
        <HiExclamationTriangle className="h-6 w-6 shrink-0" />
      )
    },
    info: {
      className: "alert alert-info border border-info-content/30 mt-5",
      title: "Información",
      icon: (
        <HiInformationCircle className="h-6 w-6 shrink-0" />
      )
    }
  }

  const currentNotification = config[type] || config.info
  
  return (
    <div 
      id="notification-root"
      role="alert" 
      className={`fixed bottom-12 right-2 w-102 shadow-lg z-10 animate-slide-in ${currentNotification.className}`}
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