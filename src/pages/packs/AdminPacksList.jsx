import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getPacks } from '../../api/packs_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import Notifications from '../../components/Notifications'
import { HiPhoto, HiEye, HiPencilSquare } from 'react-icons/hi2'

function AdminPacksList() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Se obtiene la notificacion del historial si es que hay
  const location = useLocation()
  const locationState = location.state

  useEffect(() => {
    if (locationState) {
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  // Se obtienen los packs
  useEffect(() => {
    getPacks()
      .then(response => setPacks(response.data))
      .catch(err => {
        console.error(err)
        setPacks([])
      })
      .finally(() => setLoading(false))
  }, [])

  return loading ?
  <LoadingAnimation />
  : (
    <div>
      {locationState && ( <Notifications type={locationState.notificationType || ""} title={locationState.title || ""} message={locationState.notificationMessage}/>)}
      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Packs</h1>
        <button onClick={() => navigate('/admin/packs/new')} className='btn btn-primary flex items-center'> Nou pack</button>
      </div>

      <div className='flex flex-col md:flex-row gap-4 w-full mb-5'>
          <input type="search" name="search" id="search" placeholder='Buscar pack per nom...' className='w-full p-2 rounded-lg bg-base-100 border border-base-300'/>
      </div>

      <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
        <table className="table">
          <thead>
              <tr className='text-neutral'>
                  <th>Imatge</th>
                  <th>Nom</th>
                  <th>Descripció</th>
                  <th className='text-center'>Productes</th>
                  <th className='text-right'>Preu Total</th>
                  <th className='text-center'>Accions</th>
              </tr>
          </thead>
          <tbody>
            {packs.length > 0 ? packs.map((pack) => (
              <tr key={pack.id} className='hover:bg-[#F9F6F5]'>
                <td className='border-base-300'>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className={`mask h-12 w-12 rounded-lg ${pack.images?.[0] ? "" : "flex items-center justify-center bg-primary/15"}`}>
                        {pack.images?.[0] ?
                          <img src={`http://127.0.0.1:8000/storage/${pack.images[0].path}`} alt="Pack" /> 
                          : <HiPhoto className="size-6 text-base-400" />
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className='border-base-300 font-medium'>{pack.name || '-'}</td>
                <td className='border-base-300 text-base-400 max-w-xs truncate'>{pack.description || '-'}</td>
                <td className='border-base-300 text-center'>{pack.products?.length || 0}</td>
                <td className='border-base-300 text-right font-bold text-primary'>{pack.total_price || '-'}€</td>
                <td className='border-base-300'>
                  <div className='flex items-center justify-center gap-3'>
                    <button onClick={() => navigate(`/admin/packs/${pack.id}/show`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                      <HiEye className="size-6" />
                    </button>
                    <button onClick={() => navigate(`/admin/packs/${pack.id}/edit`)} className="text-base-400 hover:text-primary transition-colors cursor-pointer">
                      <HiPencilSquare className="size-6" />
                    </button>
                  </div>
                </td>
              </tr>
            )) :
              <tr>
                <td colSpan={6} className='p-6'>
                  <div className='w-full flex justify-center items-center gap-2'>
                    <p>Actualment no hi ha packs creats</p>
                    <Link to="/admin/packs/new" className='text-primary'>crea'n un de nou!</Link>
                  </div>
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AdminPacksList
