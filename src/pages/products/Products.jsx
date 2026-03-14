import { useEffect, useState } from "react"
import { getProducts } from "../../api/products_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      getProducts()
      .then(response => setProducts(response.data))
      .catch(error => {
          console.error(error)
          setProducts([])
      })
      .finally(() => {
          setLoading(false)
      })
  }, [])


  return loading ? <LoadingAnimation /> : (
    <div className=" bg-base-200">
      <div className='flex flex-col items-center justify-center'>
        <div className="w-full max-w-390 px-4">
          <div className="px-0 py-12 sm:py-16 lg:px-4">
            {products.length > 0 && <h2 className="mt-1 text-4xl font-medium tracking-tight sm:text-3xl mb-10">Productos:</h2>}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              { products.length > 0 ? products.map((product) => (
                <ProductCard key={product.id} product={product} />
                )) :
              <p className='col-span-full font-semibold text-2xl'>Actualmente no hay productos</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default Products
