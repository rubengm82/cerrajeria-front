import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiTrash, HiEye } from 'react-icons/hi2'
import { forceDeleteCustomSolution, getCustomSolutions, updateCustomSolution } from '../../api/customSolutions_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendent', selectClassName: 'bg-warning border-warning-content text-warning-content' },
  { value: 'contacted', label: 'Contactada', selectClassName: 'bg-info border-info-content text-info-content' },
  { value: 'waiting_installation', label: 'Esperant instal·lació', selectClassName: 'bg-secondary border-secondary-content text-secondary-content' },
  { value: 'installed', label: 'Instal·lada', selectClassName: 'bg-success border-success-content text-success-content' },
  { value: 'rejected', label: 'Rebutjada', selectClassName: 'bg-error border-error-content text-error-content' },
]

function getStatusOption(status) {
  return STATUS_OPTIONS.find((option) => option.value === status) || STATUS_OPTIONS[0]
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ca-ES')
}

export default function AdminCustomSolutionsList() {
  const [customSolutions, setCustomSolutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

  const loadCustomSolutions = async () => {
    try {
      const response = await getCustomSolutions()
      const sortedSolutions = (response.data || []).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
      setCustomSolutions(sortedSolutions)

    } catch (error) {
      console.error(error)
      setCustomSolutions([])
      setNotification({ id: Date.now(), type: 'error', message: "No s'han pogut carregar les solucions personalitzades" })
    } finally {
      setLoading(false)
    }
  }

  // Se obtienen las soluciones personalizadas
  useEffect(() => {
    loadCustomSolutions()
  }, [])

  const handleForceDelete = async (solution) => {
    try {
      await forceDeleteCustomSolution(solution.id)
      await loadCustomSolutions()
      setNotification({ id: Date.now(), type: 'success', message: 'Solució personalitzada eliminada correctament' })
    } catch (error) {
      console.error(error)
      setNotification({ id: Date.now(), type: 'error', message: "No s'ha pogut eliminar la solució personalitzada" })
    }
  }

  const handleStatusChange = async (solution, nextStatus) => {
    if (solution.status !== nextStatus) {
      try {
        setUpdatingStatusId(solution.id)
        await updateCustomSolution(solution.id, { status: nextStatus })
        setCustomSolutions((currentSolutions) => currentSolutions.map((currentSolution) => (
          currentSolution.id === solution.id
            ? { ...currentSolution, status: nextStatus, updated_at: new Date().toISOString() }
            : currentSolution
        )))
        setNotification({ id: Date.now(), type: 'success', message: `Estat actualitzat a ${getStatusOption(nextStatus).label} correctament` })
      } catch (error) {
        console.error(error)
        setNotification({ id: Date.now(), type: 'error', message: "No s'ha pogut actualitzar l'estat de la solució personalitzada" })
      } finally {
        setUpdatingStatusId(null)
      }
    }
  }

  return (
    <div>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
          {notification && (<Notifications key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)} />)}

          <div className='w-full flex flex-row justify-between mb-5'>
            <h1 className='text-2xl font-bold text-base-content'>Solucions personalitzades</h1>
          </div>

          <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
            <table className="table">
              <thead>
                <tr className='text-neutral'>
                  <th>ID (identificador)</th>
                  <th>Contacte</th>
                  <th>Telèfon</th>
                  <th>Descripció</th>
                  <th>Data de creació</th>
                  <th>Data de tancament</th>
                  <th className='text-center'>Estat de la petició</th>
                  <th className='text-center'>Accions</th>
                </tr>
              </thead>
              <tbody>
                {customSolutions.length > 0 ? customSolutions.map((solution) => (
                  <tr key={solution.id} className='hover:bg-[#F9F6F5]'>
                    <td className='border-base-300 font-bold'>#{solution.id}</td>
                    <td className='border-base-300'>
                      <a className='link link-hover' href={`mailto:${solution.email}`}>{solution.email || ''}</a>
                    </td>
                    <td className='border-base-300'>
                      <a className='link link-hover' href={`tel:${solution.phone}`}>{solution.phone || ''}</a>
                    </td>
                    <td className='border-base-300 max-w-md'>
                      <p className='line-clamp-3 whitespace-pre-wrap'>{solution.description || ''}</p>
                    </td>
                    <td className='border-base-300 text-base-400'>{formatDate(solution.created_at)}</td>
                    <td className='border-base-300 text-base-400'>{solution.status === 'installed' || solution.status === 'rejected' ? formatDate(solution.updated_at) : "Encara no s'ha tancat"}</td>
                    <td className='border-base-300 text-center'>
                        <select value={solution.status} onChange={(event) => handleStatusChange(solution, event.target.value)} className="select select-sm select-bordered text-center" disabled={updatingStatusId === solution.id}>
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                    </td>
                    <td className='border-base-300'>
                      <div className='flex items-center justify-center gap-3'>
                        <ConfirmableModal title="Eliminar solució personalitzada" message={`Segur que vols eliminar permanentment la solució #${solution.id}? Aquesta acció no es pot desfer.`} onConfirm={() => handleForceDelete(solution)}>
                          <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer" title="Eliminar">
                            <HiTrash className="size-6" />
                          </button>
                        </ConfirmableModal>
                        <Link to={`/admin/custom-solutions/${solution.id}/show`} className="text-base-400 hover:text-primary transition-colors cursor-pointer" title="Veure detall">
                          <HiEye className="size-6" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className='p-6'>
                      <div className='w-full flex justify-center items-center gap-2'>
                        <p>Actualment no hi ha solucions personalitzades registrades</p>
                        <Link to="/custom-solutions" className='text-primary'>anar al formulari</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
