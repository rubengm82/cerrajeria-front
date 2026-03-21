import { useEffect, useState } from "react"
import { getCategories } from "../../api/categories_api"
import CategoryCard from "../../components/CategoryCard"
import LoadingAnimation from "../../components/LoadingAnimation"
import '../../../scss/main_shop.scss'

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
    <div className="categories-page">
      <div className="categories-page__container">
        <div className="categories-page__body">
          {categories.length > 0 && <h2 className="categories-page__title">Categorias:</h2>}
          <div className="categories-list">
            {categories.length > 0 ? categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            )) : (
              <p className="categories-empty">Actualmente no hay categorias</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories
