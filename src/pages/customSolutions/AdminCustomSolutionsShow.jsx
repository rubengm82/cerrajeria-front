import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi2'
import { getCustomSolution } from '../../api/customSolutions_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'

function formatDate(dateString) {
  const date = new Date(dateString)

  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ca-ES')
}

export default function AdminCustomSolutionsShow() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [customSolution, setCustomSolution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCustomSolution = async () => {
      try {
        const response = await getCustomSolution(id)
        setCustomSolution(response.data)
      } catch (loadError) {
        console.error(loadError)
        setError("No s'ha pogut carregar la solucio personalitzada")
      } finally {
        setLoading(false)
      }
    }

    loadCustomSolution()
  }, [id])

  return (
    <div className="flex flex-col items-center p-4 lg:p-0">
      {loading ? (
        <LoadingAnimation />
      ) : error || !customSolution ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Notifications type="error" message={error || "Solucio personalitzada no trobada"} />
          <button onClick={() => navigate('/admin/custom-solutions')} className="btn btn-primary mt-4">
            Tornar a la llista
          </button>
        </div>
      ) : (
        <div className="w-full max-w-6xl lg:w-[80%] lg:min-w-0">
          <button
            onClick={() => navigate('/admin/custom-solutions')}
            className="link link-hover text-primary mb-2 flex items-center gap-2 cursor-pointer"
          >
            <HiArrowLeft className="size-5" />
            <p>Tornar enrere</p>
          </button>

          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-base-content">
                Solucio personalitzada #{customSolution.id}
              </h1>
              <p className="text-base-400 text-md md:text-lg mt-1">
                {customSolution.email || 'Sense correu'}
              </p>
            </div>
            <span className={`badge ${customSolution.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
              {customSolution.status === 'pending' ? 'Pendent' : 'Tancada'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-5">
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold mb-4">Descripcio</h3>
              <p className="text-base-400 whitespace-pre-wrap break-all">
                {customSolution.description || 'Aquesta solucio personalitzada no te descripcio'}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="simple-container">
                <h3 className="text-[18px] font-semibold mb-4">Contacte</h3>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2 border-b border-base-300">
                  <p className="font-semibold text-base-400">Correu</p>
                  <p className="text-left sm:text-right break-all sm:max-w-[65%]">{customSolution.email || '-'}</p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2">
                  <p className="font-semibold text-base-400">Telefon</p>
                  <p className="text-left sm:text-right break-all sm:max-w-[65%]">{customSolution.phone || '-'}</p>
                </div>
              </div>

              <div className="simple-container">
                <h3 className="text-[18px] font-semibold mb-4">Seguiment</h3>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2 border-b border-base-300">
                  <p className="font-semibold text-base-400">Data de creacio</p>
                  <p className="text-left sm:text-right">{formatDate(customSolution.created_at)}</p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2 border-b border-base-300">
                  <p className="font-semibold text-base-400">Ultima actualitzacio</p>
                  <p className="text-left sm:text-right">{formatDate(customSolution.updated_at)}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2">
                  <p className="font-semibold text-base-400">Activa</p>
                  <p className="text-left sm:text-right">
                    {customSolution.deleted_at ? 'No' : 'Si'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
