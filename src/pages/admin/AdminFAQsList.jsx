import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getFaqsWithTrashed, deleteFaq, restoreFaq, forceDeleteFaq } from '../../api/faq_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'
import { HiPencilSquare, HiTrash } from 'react-icons/hi2'

function AdminFAQsList() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  // Se obtiene la notificacion del historial si es que hay
  const location = useLocation()
  const locationState = location.state

  // Se limpia el historial despues de mostrar una notificacion
  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  // Se obtienen las FAQs
  useEffect(() => {
    getFaqsWithTrashed()
      .then(response => {
        setFaqs(response.data)
      })
      .catch(err => {
        console.error(err)
        setFaqs([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = (id, isActive) => {
    if (isActive) {
      // Si está activa, hacer softdelete (desactivar)
      deleteFaq(id)
        .then(() => {
          getFaqsWithTrashed()
            .then(response => {
              setFaqs(response.data)
            })
          setNotification({ id: Date.now(), type: "success", message: "Pregunta desactivada correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut desactivar la pregunta"})
        })
    } else {
      // Si está inactiva, restaurar (activar)
      restoreFaq(id)
        .then(() => {
          getFaqsWithTrashed()
            .then(response => {
              setFaqs(response.data)
            })
          setNotification({ id: Date.now(), type: "success", message: "Pregunta restaurada correctament"})
        })
        .catch(err => {
          console.error(err)
          setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut restaurar la pregunta"})
        })
    }
  }

  const handleForceDelete = (id) => {
    forceDeleteFaq(id)
      .then(() => {
        getFaqsWithTrashed()
          .then(response => {
            setFaqs(response.data)
          })
        setNotification({ id: Date.now(), type: "success", message: "Pregunta eliminada permanentment"})
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: "No s'ha pogut eliminar permanentment la pregunta"})
      })
  }

  return loading ?
    <LoadingAnimation />
    : (
    <div>
      {/* Notificaciones locales (borrado) */}
      {notification && (
        <Notifications key={notification.id} type={notification.type} title={notification.title} message={notification.message} onClose={() => setNotification(null)}/>
      )}

       {/* Se muestra la notificacion si es que hay del router */}
       {locationState && ( <Notifications type={locationState.notificationType || ""} title={locationState.title || ""} message={locationState.notificationMessage}/>)}

       <div className='w-full flex flex-row justify-between mb-5'>
         <div>
           <h1 className='text-2xl font-bold text-base-content'>Preguntes Freqüents</h1>
           <p className='text-sm text-base-content/60 mt-1'>
             {(() => {
               const total = faqs.length
               const activas = faqs.filter(f => !f.deleted_at).length
               return `Preguntes ${activas} de ${total}`
             })()}
           </p>
         </div>
         <button onClick={() => navigate('/admin/faqs/new')} className='btn btn-primary flex items-center'> Nova pregunta</button>
       </div>

       {/* Tabla de FAQs */}
       <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
         <table className="table">
           <thead>
               <tr className='text-neutral'>
                   <th>Pregunta</th>
                   <th>Resposta</th>
                   <th className='text-center'>Estat</th>
                   <th className='text-center'>Accions</th>
               </tr>
           </thead>
            <tbody>
              {faqs.length > 0 ? faqs.map((faq) => (
                <tr key={faq.id} className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-medium'>
                    <div className="tooltip" data-tip={faq.question || ''}>
                      {faq.question ? (
                        faq.question.length > 60 ? `${faq.question.substring(0, 60)}...` : faq.question
                      ) : ''}
                    </div>
                  </td>
                  <td className='border-base-300 text-sm text-base-content/70'>
                    <div className="tooltip" data-tip={faq.answer || ''}>
                      {faq.answer ? (
                        faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer
                      ) : ''}
                    </div>
                  </td>
                  <td className='border-base-300'>
                    <div className='flex justify-center'>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={!faq.deleted_at}
                        onChange={() => handleToggle(faq.id, !faq.deleted_at)}
                      />
                    </div>
                  </td>
                  <td className='border-base-300'>
                    <div className='flex items-center justify-center gap-3'>
                      {faq.deleted_at ? (
                        <>
                          <ConfirmableModal title="Eliminar pregunta permanentment" message={`Segur que vols eliminar permanentment aquesta pregunta? Aquesta acció no es pot desfer.`} onConfirm={() => handleForceDelete(faq.id)}>
                            <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                              <HiTrash className="size-6" />
                            </button>
                          </ConfirmableModal>
                        </>
                      ) : (
                        <button onClick={() => navigate(`/admin/faqs/${faq.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                          <HiPencilSquare className="size-6" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) :
                <tr>
                  <td colSpan={4} className='p-6'>
                    <div className='w-full flex justify-center items-center gap-2'>
                      <p>Actualment no hi ha preguntes freqüents creades</p>
                      <Link to="/admin/faqs/new" className='text-primary'>crea'n una de nova!</Link>
                    </div>
                  </td>
                </tr>}
            </tbody>
         </table>
       </div>
    </div>
  )
}

export default AdminFAQsList
