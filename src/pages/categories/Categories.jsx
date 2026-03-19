import { useEffect, useState } from "react"
import { getCategories } from "../../api/categories_api"
import CategoryCard from "../../components/CategoryCard"
import LoadingAnimation from "../../components/LoadingAnimation"

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data))
      .catch((error) => {
        console.error(error)
        setCategories([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return loading ? <LoadingAnimation /> : (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-390 px-4">
        <div className="px-0 py-12 sm:py-16 lg:px-4">
          {categories.length > 0 && <h2 className="mt-1 mb-10 text-4xl font-medium tracking-tight sm:text-3xl">Categorias:</h2>}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.length > 0 ? categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            )) : (
              <p className="col-span-full text-2xl font-semibold">Actualmente no hay categorias</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories
