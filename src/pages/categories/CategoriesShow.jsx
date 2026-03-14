import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import { getCategory } from "../../api/categories_api"

function CategoriesShow() {
  const {id} = useParams()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategory(id)
    .then(response => setCategory(response.data))
    .catch(error => console.error(error))
    .finally(() => setLoading(false))
  }, [id])
  const categoryProducts = Object.values(category?.products || {})

  return loading ? <LoadingAnimation /> : (
    <div className='bg-base-200 flex flex-col items-center justify-center'>
      <div className="w-full max-w-390 px-4">
        <div className="px-0 py-12 sm:py-16 lg:px-4">
          <h2 className="mt-1 text-4xl font-medium tracking-tight sm:text-3xl mb-10">{category.name}:</h2>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoryProducts.length > 0 ? categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          )) : <p className='col-span-full font-semibold text-2xl'>Actualmente no hay productos</p> }
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesShow