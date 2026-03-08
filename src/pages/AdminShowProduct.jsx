import { useEffect, useState } from "react"
import { deleteProduct, getProduct } from "../api/products_api"
import { useNavigate, useParams } from "react-router-dom"
import LoadingAnimation from "../components/LoadingAnimation"
import ConfirmableModal from "../components/ConfirmableModal"

function AdminShowProduct() {
  const navigate = useNavigate()
  // Se obtiene el producto y el ID
  const [product, setProduct] = useState({})
  const [loading, setLoading] = useState({})

  const {id} = useParams()

  useEffect(() => {
    setLoading(true)
    getProduct(id)
    .then(response => setProduct(response.data))
    .catch(error => {
      console.error(error);
      setProduct(null)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [])

  const handleDelete = (event) => {
    setLoading(true)
    try {
      deleteProduct(product.id)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
    // Se redirecciona al index de productos
    navigate("/admin/products", { state: { notificationType: "success", notificationMessage: "Producto eliminado correctamente" }})
  }

  return loading ? <LoadingAnimation/> : (
    <div className="flex flex-col items-center p-4 lg:p-0">
      <div className="lg:w-[80%] lg:min-w-150 w-full">
        <button onClick={() => navigate("/admin/products")} className="text-primary mb-2 flex items-center gap-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <p>Volver atrás</p>
        </button>

        {/* Header del show */}
        <div className='w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5'>
          <div className="flex items-center gap-4 md:gap-10">
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-base-content'>{product.name}</h1>
              <p className="text-base-400 text-md md:text-lg">Codigo: {product.code}</p>
            </div>
            <p className={`p-1 text-center border rounded-lg w-16 font-medium ${product.is_active == null ? "" : product.is_active == 1 ? "bg-success text-success-content" : "bg-error text-error-content"}`}>{product.is_active == null ? "-" : product.is_active == 1 ? "Actiu" : "Inactiu"}</p>
          </div>
          <div className="flex flex-row w-full md:w-auto justify-end">
            <button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="btn btn-secondary mr-2">Editar</button>
            <ConfirmableModal title="Eliminar producto" message={`¿Seguro que quieres eliminar el producto "${product.name}"?`} onConfirm={() => handleDelete(product.id)} >
              <button className="btn btn-error">Eliminar</button>
            </ConfirmableModal>
          </div>
        </div>

        {/* Cuerpo del show */}
        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* Contenedor de la izquierda */}
          <div className="w-full lg:w-[70%] flex flex-col gap-5">
            {/* Imagenes */}
            <div className="simple-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center gap-6 ">
              <h3 className="text-[18px] font-semibold col-span-full">Imagenes</h3>
              {product.images?.length > 0 ?
                product.images.map((image, number) => (
                  <div key={image + number} className="flex justify-center">
                    <img src={`http://127.0.0.1:8000/storage/${image.path}`} className="rounded-lg aspect-square object-cover w-full max-w-60 border border-base-300"/>
                  </div>
                ))
              : <p className="col-span-full">Actualmente no hay ninguna imagen</p> }
            </div>

            <div className="simple-container">
              <h3 className="text-[18px] font-semibold mb-4">Descripcion</h3>
              <p className="text-base-400">{product.description ? product.description : "Este producto aun no tiene descripcion"}</p>
            </div>

            {/* Características */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold mb-4">Características</h3>
              {product.features?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(
                    product.features.reduce((acc, feature) => {
                      const typeName = feature.type?.name || "Sin tipo";
                      if (!acc[typeName]) acc[typeName] = [];
                      acc[typeName].push(feature.value);
                      return acc;
                    }, {})
                  ).map(([typeName, values]) => (
                    <div key={typeName} className="flex flex-col gap-1">
                      <h4 className="font-bold text-primary text-sm uppercase tracking-wider">{typeName}</h4>
                      <p className="text-base-content font-medium">{values.join(", ")}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base-400 italic">Este producto no tiene características asignadas</p>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[30%] flex flex-col gap-5">
            {/* Precio */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold">Precio</h3>
              <p className="text-primary font-bold text-4xl mt-4">{product.price}€</p>
            </div>

            {/* Inventario */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold">Inventario</h3>
              <div className="flex items-center justify-between">
                <p className="mt-4 text-base-400 font-semibold">Stock actual</p>
                <p className="mt-4 text-primary font-bold">{product.stock}u</p>
              </div>

              {/* Si tiene llaves extras se muestra */}
              {product.extra_keys > 0 &&
                <div>
                  <hr className="border-base-300 my-5" />
                  <p className="text-base-400 font-semibold">{product.extra_keys} llaves extras incluidas</p>
                </div>
              }
            </div>

            {/* Categoria */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold">Categoria</h3>
              <p className="mt-4 font-semibold text-base-400">{product.category?.name}</p>
            </div>

            {/* Estado */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold">Estado</h3>
              <div className="w-full flex items-center justify-between mt-3">
                <p className="font-semibold text-base-400">Visibilidad</p>
                <p className={`p-1 text-center border rounded-lg w-16 font-medium ${product.is_active == null ? "" : product.is_active == 1 ? "bg-success text-success-content" : "bg-error text-error-content"}`}>{product.is_active == null ? "-" : product.is_active == 1 ? "Actiu" : "Inactiu"}</p>
              </div>

              <div className="w-full flex items-center justify-between mt-2">
                <p className="font-semibold text-base-400">Producto destacado</p>
                <p>{product.is_important_to_show ? "Si" : "No" }</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminShowProduct