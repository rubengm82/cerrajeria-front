import { useEffect, useState } from "react"
import { deletePack, getPack } from "../../api/packs_api"
import { useNavigate, useParams } from "react-router-dom"
import LoadingAnimation from "../../components/LoadingAnimation"
import ConfirmableModal from "../../components/ConfirmableModal"

function AdminShowPack() {
  const navigate = useNavigate()
  const [pack, setPack] = useState({})
  const [loading, setLoading] = useState(true)

  const {id} = useParams()

  useEffect(() => {
    setLoading(true)
    getPack(id)
    .then(response => setPack(response.data))
    .catch(error => {
      console.error(error);
      setPack(null)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [id])

  const handleDelete = () => {
    setLoading(true)
    deletePack(pack.id)
    .then(() => {
        navigate("/admin/packs", { state: { notificationType: "success", notificationMessage: "Pack eliminado correctamente" }})
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return loading ? <LoadingAnimation/> : (
    <div className="flex flex-col items-center p-4 lg:p-0">
      <div className="lg:w-[80%] lg:min-w-150 w-full">
        <button onClick={() => navigate("/admin/packs")} className="text-primary mb-2 flex items-center gap-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <p>Volver atrás</p>
        </button>

        <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5'>
          <h1 className='text-2xl md:text-3xl font-bold text-base-content'>{pack.name}</h1>
          <div className="flex flex-row w-full md:w-auto justify-end">
            <button onClick={() => navigate(`/admin/packs/${pack.id}/edit`)} className="btn btn-secondary mr-2">Editar</button>
            <ConfirmableModal title="Eliminar pack" message={`¿Seguro que quieres eliminar el pack "${pack.name}"?`} onConfirm={() => handleDelete()} >
              <button className="btn btn-error">Eliminar</button>
            </ConfirmableModal>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10">
          <div className="w-full lg:w-[70%] flex flex-col gap-5">

            {/* Imágenes del Pack */}
            <div className="simple-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center gap-6">
              <h3 className="text-[18px] font-semibold col-span-full">Imágenes</h3>
              {pack.images?.length > 0 ?
                pack.images.map((image, number) => (
                  <div key={image.id || number} className="flex justify-center">
                    <img src={`http://127.0.0.1:8000/storage/${image.path}`} alt={`Imagen del pack ${number}`} className="rounded-lg aspect-square object-cover w-full max-w-60 border border-base-300"/>
                  </div>
                ))
              : <p className="col-span-full">Este pack no tiene imágenes asociadas</p> }
            </div>

            <div className="simple-container">
              <h3 className="text-[18px] font-semibold mb-4">Descripción</h3>
              <p className="text-base-400">{pack.description ? pack.description : "Este pack no tiene descripción"}</p>
            </div>

            <div className="simple-container">
              <h3 className="text-[18px] font-semibold mb-4">Productos incluidos</h3>
              {pack.products?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pack.products.map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-3 border border-base-300 rounded-lg bg-base-100">
                      <div className="flex flex-col">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-base-400">Código: {product.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base-400">No hay productos asociados a este pack</p>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[30%] flex flex-col gap-5">
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold">Precio Total</h3>
              <p className="text-primary font-bold text-4xl mt-4">{pack.total_price}€</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminShowPack
