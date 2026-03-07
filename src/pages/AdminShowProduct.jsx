import { useEffect, useState } from "react"
import { getProduct } from "../api/products_api"
import { useNavigate, useParams } from "react-router-dom"
import LoadingAnimation from "../components/LoadingAnimation"

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

  return loading ? <LoadingAnimation/> : (
    <div className="flex flex-col items-center">
      <div className="lg:w-[80%] lg:min-w-150 w-full">
        <button onClick={() => navigate("/admin/products")} className="text-primary mb-2 inline-block">Volver atras</button>
        <div className='full flex flex-row justify-between mb-5'>
          {/* Header del show */}
          <div className="flex items-center gap-10">
            <div>
              <h1 className='text-3xl font-bold text-base-content'>{product.name}</h1>
              <p className="text-base-400 text-lg">Codigo: {product.code}</p>
            </div>
              <p className={`p-1 text-center border rounded-lg w-16 font-medium ${product.is_active == null ? "" : product.is_active == 1 ? "bg-success text-success-content" : "bg-error text-error-content"}`}>{product.is_active == null ? "-" : product.is_active == 1 ? "Actiu" : "Inactiu"}</p>
          </div>
          <div>
            <button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="btn btn-secondary mr-2">Editar</button>
            <button onClick={() => navigate(`/admin/products/${product.id}/delete`)} className="btn btn-error">Eliminar</button>
          </div>
        </div>

        {/* Cuerpo del show */}
        <div className="flex flex-row items-start gap-10">
          {/* Contenedor de la izquierda */}
          <div className="w-[70%] flex flex-col gap-5">
            {/* Imagenes */}
            <div className="simple-container grid grid-cols-1 md:grid-cols-3 items-center gap-6 ">
              <h3 className="text-[18px] font-semibold col-span-1 md:col-span-3">Imagenes</h3>
              {product.images?.length > 0 ?
                product.images.map((image, number) => (
                  <div key={image + number}>
                    <img src={`http://127.0.0.1:8000/storage/${image.path}`} className="rounded-lg aspect-square object-cover w-60 border border-base-300"/>
                  </div>
                ))
              : <p>Actualmente no hay ninguna imagen</p> }
              {/* Carrusel */}
              {/* {product.images ?
                <div className="col-span-2 carousel carousel-center bg-base-100 rounded-box space-x-4 p-4 h-72">
                  {product.images.map((image) => (
                      <div className="carousel-item">
                        <img src={`http://127.0.0.1:8000/storage/${image.path}`}/>
                      </div>
                  ))}
              </div>
              : "No hay ninguna imagen" } */}
            </div>
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold mb-4">Descripcion</h3>
              <p className="text-base-400">{product.description ? product.description : "Este producto aun no tiene descripcion"}</p>
            </div>
          </div>


          {/* Contenedor de la derecha */}
          <div className="w-[30%] flex flex-col gap-5">
            {/* Precio */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold col-span-1 md:col-span-3">Precio</h3>
              <p className="text-primary font-bold text-4xl mt-4">{product.price}€</p>
            </div>

            {/* Inventario */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold col-span-1 md:col-span-3">Inventario</h3>
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
              <h3 className="text-[18px] font-semibold col-span-1 md:col-span-3">Categoria</h3>
              <p className="mt-4 font-semibold text-base-400">{product.category.name}</p>
            </div>

            {/* Estado */}
            <div className="simple-container">
              <h3 className="text-[18px] font-semibold col-span-1 md:col-span-3">Estado</h3>
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