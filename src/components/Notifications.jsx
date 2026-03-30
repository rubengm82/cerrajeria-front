import { useEffect, useState, useCallback } from 'react'
import { HiCheckCircle, HiXCircle, HiExclamationTriangle, HiInformationCircle, HiXMark } from 'react-icons/hi2'

function Notifications({ type, title, message, errors, autoClose = true, onClose }) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    setIsClosing(true)
    // Llamar a onClose después de la transición
    setTimeout(() => {
      if (onClose) onClose()
    }, 500)
  }, [onClose])

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [autoClose, message, handleClose])
  const config = {
    success: {
      className: "alert alert-success border border-success-content/30 mt-5",
      title: "Operació completada correctament",
      icon: (
        <HiCheckCircle className="h-6 w-6 shrink-0 stroke-current" />
      )
    },
    error: {
      className: "alert alert-error border border-error-content/30 mt-5",
      title: "Si us plau, corregeix els errors següents:",
      icon: (
        <HiXCircle className="h-6 w-6 shrink-0 stroke-current" />
      )
    },
    warning: {
      className: "alert alert-warning border border-warning-content/30 mt-5",
      title: "Atención",
      icon: (
        <HiExclamationTriangle className="h-6 w-6 shrink-0 stroke-current" />
      )
    },
    info: {
      className: "alert alert-info border border-info-content/30 mt-5",
      title: "Información",
      icon: (
        <HiInformationCircle className="h-6 w-6 shrink-0 stroke-current" />
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
      <div className="flex-1">
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
      <button 
        onClick={handleClose}
        className="btn btn-sm btn-ghost"
      >
        <HiXMark className="h-5 w-5" />
      </button>
    </div>
  )
}

export default Notifications
