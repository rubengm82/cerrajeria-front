import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiTrash, HiArrowPath, HiEye } from 'react-icons/hi2'
import {deleteCustomSolution, forceDeleteCustomSolution, getCustomSolutionsWithTrashed, restoreCustomSolution, updateCustomSolution} from '../../api/customSolutions_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'

function formatDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ca-ES')
}

export default function AdminCustomSolutionsList() {
  const [customSolutions, setCustomSolutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  const loadCustomSolutions = async () => {
    try {
      const response = await getCustomSolutionsWithTrashed()
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

  const handleToggle = async (solution) => {
    try {
      if (solution.deleted_at) {
        await restoreCustomSolution(solution.id)
        setNotification({ id: Date.now(), type: 'success', message: 'Solucio personalitzada restaurada correctament' })
      } else {
        await deleteCustomSolution(solution.id)
        setNotification({ id: Date.now(), type: 'success', message: 'Solucio personalitzada desactivada correctament' })
      }

      await loadCustomSolutions()
    } catch (error) {
      console.error(error)
      setNotification({ id: Date.now(), type: 'error', message: "No s'ha pogut actualitzar la solucio personalitzada" })
    }
  }

  const handleForceDelete = async (solution) => {
    try {
      await forceDeleteCustomSolution(solution.id)
      await loadCustomSolutions()
      setNotification({ id: Date.now(), type: 'success', message: 'Solucio personalitzada eliminada permanentment' })
    } catch (error) {
      console.error(error)
      setNotification({ id: Date.now(), type: 'error', message: "No s'ha pogut eliminar permanentment la solucio personalitzada" })
    }
  }

  const handleStatusToggle = async (solution) => {
    const nextStatus = solution.status === 'pending' ? 'closed' : 'pending'
    const nextStatusLabel = nextStatus === 'pending' ? 'Pendent' : 'Tancada'

    try {
      await updateCustomSolution(solution.id, { status: nextStatus })
      await loadCustomSolutions()
      setNotification({ id: Date.now(), type: 'success', message: `Estat actualitzat a ${nextStatusLabel} correctament` })
    } catch (error) {
      console.error(error)
      setNotification({ id: Date.now(), type: 'error', message: "No s'ha pogut actualitzar l'estat de la solucio personalitzada" })
    }
  }

  return (
    <div>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
          {notification && ( <Notifications key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)}/>)}

          <div className='w-full flex flex-row justify-between mb-5'>
            <h1 className='text-2xl font-bold text-base-content'>Solucions personalitzades</h1>
          </div>

          <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
            <table className="table">
              <thead>
                <tr className='text-neutral'>
                  <th>Contacte</th>
                  <th>Telefon</th>
                  <th>Descripcio</th>
                  <th className='text-center'>Estat de la peticio</th>
                  <th>Data</th>
                  <th className='text-center'>Activa</th>
                  <th className='text-center'>Accions</th>
                </tr>
              </thead>
              <tbody>
                {customSolutions.length > 0 ? customSolutions.map((solution) => (
                  <tr key={solution.id} className='hover:bg-[#F9F6F5]'>
                    <td className='border-base-300'>{solution.email || '-'}</td>
                    <td className='border-base-300'>{solution.phone || '-'}</td>
                    <td className='border-base-300 max-w-md'>
                      <p className='line-clamp-3 whitespace-pre-wrap'>{solution.description || '-'}</p>
                    </td>
                    <td className='border-base-300 text-center'>
                      <ConfirmableModal title="Canviar estat de la peticio" message={`Segur que vols canviar l'estat de la peticio de "${solution.email || solution.phone || `#${solution.id}`}" de ${solution.status === 'pending' ? 'Pendent' : 'Tancada'} a ${solution.status === 'pending' ? 'Tancada' : 'Pendent'}?`} onConfirm={() => handleStatusToggle(solution)}>
                        <span className={`badge cursor-pointer hover:opacity-80 transition-opacity ${solution.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                          {solution.status === 'pending' ? 'Pendent' : 'Tancada'}
                        </span>
                      </ConfirmableModal>
                    </td>
                    <td className='border-base-300 text-base-400'>{formatDate(solution.created_at)}</td>
                    <td className='border-base-300'>
                      <div className='flex justify-center'>
                        <input type="checkbox" className="toggle toggle-primary" checked={!solution.deleted_at} onChange={() => handleToggle(solution)}/>
                      </div>
                    </td>
                    <td className='border-base-300'>
                      <div className='flex items-center justify-center gap-3'>
                        {solution.deleted_at ? (
                          <>
                            <button onClick={() => handleToggle(solution)} className="text-base-400 hover:text-primary transition-colors cursor-pointer" title="Restaurar">
                              <HiArrowPath className="size-6" />
                            </button>
                            <ConfirmableModal title="Eliminar solucio personalitzada permanentment" message={`Segur que vols eliminar permanentment la solucio de "${solution.email}"? Aquesta accio no es pot desfer.`} onConfirm={() => handleForceDelete(solution)}>
                              <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                                <HiTrash className="size-6" />
                              </button>
                            </ConfirmableModal>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleToggle(solution)} className="text-base-400 hover:text-error-content transition-colors cursor-pointer" title="Desactivar">
                              <HiTrash className="size-6" />
                            </button>
                            <Link to={`/admin/custom-solutions/${solution.id}/show`} className="text-base-400 hover:text-primary transition-colors cursor-pointer" title="Veure detall">
                              <HiEye className="size-6" />
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className='p-6'>
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
