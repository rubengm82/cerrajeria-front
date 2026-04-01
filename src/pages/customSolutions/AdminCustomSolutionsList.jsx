import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiTrash, HiEye } from 'react-icons/hi2'
import { forceDeleteCustomSolution, getCustomSolutions, updateCustomSolution } from '../../api/customSolutions_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import ConfirmableModal from '../../components/ConfirmableModal'

function formatDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ca-ES')
}

export default function AdminCustomSolutionsList() {
  const [customSolutions, setCustomSolutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

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
      setNotification({ id: Date.now(), type: 'success', message: 'Solucio personalitzada eliminada correctament' })
    } catch (error) {
      console.error(error)
      setNotification({ id: Date.now(), type: 'error', message: "No s'ha pogut eliminar la solucio personalitzada" })
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
                    <td className='border-base-300 text-base-400'>{solution.status === 'pending' ? "Encara no s'ha tancat" : formatDate(solution.updated_at)}</td>
                    <td className='border-base-300 text-center'>
                      <ConfirmableModal title="Canviar estat de la petició" message={`Segur que vols canviar l'estat de la petició #${solution.id} de ${solution.status === 'pending' ? 'Pendent' : 'Tancada'} a ${solution.status === 'pending' ? 'Tancada' : 'Pendent'}?`} onConfirm={() => handleStatusToggle(solution)}>
                        <span className={`badge cursor-pointer hover:opacity-80 transition-opacity ${solution.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                          {solution.status === 'pending' ? 'Pendent' : 'Tancada'}
                        </span>
                      </ConfirmableModal>
                    </td>
                    <td className='border-base-300'>
                      <div className='flex items-center justify-center gap-3'>
                        <ConfirmableModal title="Eliminar solucio personalitzada" message={`Segur que vols eliminar permanentment la solució #${solution.id}? Aquesta acció no es pot desfer.`} onConfirm={() => handleForceDelete(solution)}>
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
                    <td colSpan={6} className='p-6'>
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
