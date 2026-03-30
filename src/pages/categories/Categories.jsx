import { Link } from "react-router-dom"
import { HiArrowLeft } from "react-icons/hi2"
import { useQuery } from "@tanstack/react-query"
import { getCategories } from "../../api/categories_api"
import CategoryCard from "../../components/CategoryCard"
import LoadingAnimation from "../../components/LoadingAnimation"
import '../../../scss/main_shop.scss'

function Categories() {
  // Caché para categorías
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      sessionStorage.setItem('cached_categories', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return loading ? <LoadingAnimation /> : (
    <div className="categories-page">
      <div className="categories-page__container">
        <div className="categories-page__body">
          <div className="mb-4">
            <Link to="/" className="link link-hover text-primary mb-2 flex items-center gap-2 cursor-pointer">
              <HiArrowLeft className="size-5" />
              <p>Tornar a l'inici</p>
            </Link>
            {categories.length > 0 && <h2 className="categories-page__title">Categories:</h2>}
          </div>
          <div className="categories-list">
            {categories.length > 0 ? categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            )) : (
              <p className="categories-empty">Actualment no hi ha categories</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories
