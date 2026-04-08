import { useEffect, useRef, useState } from 'react'
import { HiArrowLeft, HiOutlineEnvelope, HiOutlinePhone, HiOutlineClock } from "react-icons/hi2";
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createCustomSolution } from '../../api/customSolutions_api'
import Notifications from '../../components/Notifications'
import { useAuth } from '../../context/AuthContext'
import '../../../scss/main_shop.scss'

const initialFormData = {
  email: '',
  phone: '',
  description: '',
}
const MAX_IMAGES = 3

export default function CustomSolutions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState(initialFormData)
  const [images, setImages] = useState([])
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  // Se obtine el usuario para si tiene email y telefono añadirlo automaticamente al formulario
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone,
    }))
  }, [user])


  // Se muestra la notificacion si es que existe
  useEffect(() => {
    if (locationState?.notificationType || locationState?.notificationMessage) {
      setNotification({id: Date.now(), type: locationState.notificationType || 'info', message: locationState.notificationMessage || '', autoClose: locationState.autoClose ?? true})
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  const showMaxImagesNotification = () => {
    setNotification({
      id: Date.now(),
      type: 'error',
      message: `Només pots adjuntar fins a ${MAX_IMAGES} imatges.`,
    })
  }

  const updateImages = (fileList, syncInput = false) => {
    const selectedImages = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    const limitedImages = selectedImages.slice(0, MAX_IMAGES)
    setImages(limitedImages)

    if (syncInput && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      limitedImages.forEach((image) => {
        dataTransfer.items.add(image)
      })
      fileInputRef.current.files = dataTransfer.files
    }

    if (selectedImages.length > MAX_IMAGES) {
      showMaxImagesNotification()
    }
  }

  const handleChange = (event) => {
    const { name, value, type, files } = event.target

    if (type === 'file') {
      updateImages(files)
    } else {
      setFormData((prev) => ({...prev, [name]: value,}))
    }
  }

  const handleDragOver = (event) => {
    if (event.dataTransfer?.types?.includes('Files')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragEnter = (event) => {
    if (event.dataTransfer?.types?.includes('Files')) {
      event.preventDefault()
      setIsDraggingFiles(true)
    }
  }

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDraggingFiles(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDraggingFiles(false)
    updateImages(event.dataTransfer.files, true)
  }

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotification(null)

    const payload = new FormData()
    payload.append('email', formData.email)
    payload.append('phone', formData.phone)
    payload.append('description', formData.description)
    payload.append('status', 'pending')

    images.forEach((image) => {
      payload.append('images[]', image)
    })

    try {
      await createCustomSolution(payload)
      setFormData({
        email: user?.email || '',
        phone: user?.phone || '',
        description: '',
      })
      setImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
      navigate('/custom-solutions', {state: {notificationType: 'success', notificationMessage: "La teva solució personalitzada s'ha enviat correctament. Et contactarem tan aviat com la revisem.", autoClose: false}
      })
    } catch (err) {
      console.error(err)
      setNotification({id: Date.now(), type: 'error', message: "No hem pogut enviar la teva solució. Torna-ho a provar d'aquí a una estona.",})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="custom-solutions">
      {notification && (
        <Notifications key={notification.id} type={notification.type} message={notification.message} autoClose={notification.autoClose} onClose={() => setNotification(null)}/>
      )}
      <div className="custom-solutions__container">
        <div className="custom-solutions__back">
          <Link to="/" className="link link-hover text-primary flex items-center gap-2 cursor-pointer">
            <HiArrowLeft className="size-5" />
            <p>Tornar a l'inici</p>
          </Link>
        </div>
        <div className="custom-solutions__layout">
          <div className="custom-solutions__content">
            <div className="custom-solutions__intro">
              <h1 className="custom-solutions__title">
                Explica'ns què necessites i prepararem una <span className="custom-solutions__title-accent">proposta a mida.</span>
              </h1>

              <p className="custom-solutions__description">Si tens una necessitat especial de serralleria, materials o instal·lació, envia'ns els detalls i el nostre equip valorarà la millor solució per al teu cas.</p>
            </div>

            <div className="custom-solutions__features">
              <div className="custom-solutions__feature">
                <HiOutlineEnvelope className="custom-solutions__feature-icon" />
                <h2 className="custom-solutions__feature-title">Resposta clara</h2>
                <p className="custom-solutions__feature-text">Revisem la teva consulta i et responem amb una proposta adaptada.</p>
              </div>

              <div className="custom-solutions__feature">
                <HiOutlinePhone className="custom-solutions__feature-icon" />
                <h2 className="custom-solutions__feature-title">Contacte directe</h2>
                <p className="custom-solutions__feature-text">Deixa'ns el telèfon i t'ajudarem a concretar la millor opció.</p>
              </div>

              <div className="custom-solutions__feature custom-solutions__feature--wide">
                <HiOutlineClock className="custom-solutions__feature-icon" />
                <h2 className="custom-solutions__feature-title">Seguiment intern</h2>
                <p className="custom-solutions__feature-text">El nostre equip gestionara la petició per donar-te una resposta adequada.</p>
              </div>
            </div>
          </div>

          <div className="custom-solutions__card">
            <div className="custom-solutions__card-body">
              <div className="custom-solutions__card-header">
                <div>
                  <p className="custom-solutions__eyebrow">Formulari de contacte</p>
                  <h2 className="custom-solutions__card-title">Demana una solució personalitzada</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="custom-solutions__form">
                <div className="custom-solutions__field-grid">
                  <div>
                    <label className="label custom-solutions__field-label" htmlFor="email">
                      <span className="text-sm font-medium">Email</span>
                    </label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" className="input input-bordered w-full" required/>
                  </div>

                  <div>
                    <label className="label custom-solutions__field-label" htmlFor="phone">
                      <span className="text-sm font-medium">Telèfon</span>
                    </label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="600 123 123" className="input input-bordered w-full" required/>
                  </div>
                </div>

                <div>
                  <label className="label custom-solutions__field-label" htmlFor="description">
                    <span className="text-sm font-medium">Descripció</span>
                  </label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Explica'ns el tipus de solució que necessites, materials, mides, urgència o qualsevol detall important." className="textarea textarea-bordered w-full custom-solutions__textarea" required/>
                </div>

                <div>
                  <label className="label custom-solutions__field-label" htmlFor="images">
                    <span className="text-sm font-medium">Imatges</span>
                  </label>
                  <div className={`custom-solutions__upload-box ${isDraggingFiles ? 'custom-solutions__upload-box--dragging' : ''}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                    <input ref={fileInputRef} id="images" name="images" type="file" accept="image/*" multiple onChange={handleChange} className="custom-solutions__file-input"/>
                    <p className="custom-solutions__upload-text">Arrossega les imatges aquí</p>
                    <p className="custom-solutions__upload-separator">O</p>
                    <button type="button" className="btn btn-dash custom-solutions__upload-button" onClick={handleOpenFilePicker}>Pujar arxius</button>
                    {images.length > 0 ? (
                      <div className="custom-solutions__images-selected">
                        {images.map((image) => (
                          <p key={`${image.name}-${image.lastModified}`}>{image.name}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="custom-solutions__images-selected">Màxim {MAX_IMAGES} imatges.</p>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary custom-solutions__submit" disabled={loading}>
                  {loading ? 'Enviant sol·licitud...' : 'Enviar sol·licitud'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
