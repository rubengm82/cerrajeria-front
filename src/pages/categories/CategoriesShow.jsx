import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import { HiArrowLeft } from "react-icons/hi2"
import { getCategory } from "../../api/categories_api"

function CategoriesShow() {
  const {id} = useParams()

  // Caché para categoría con sus productos
  const { data: category = null, isLoading: loading } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const res = await getCategory(id);
      sessionStorage.setItem(`cached_category_${id}`, JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const categoryProducts = Object.values(category?.products || {})

  return loading ? <LoadingAnimation /> : (
    <div className='bg-base-200 flex flex-col items-center justify-center'>
      <div className="w-full max-w-390 px-4">
        <div className="px-0 py-12 sm:py-16 lg:px-4">
          <Link to="/categories" className="link link-hover text-primary mb-4 flex items-center gap-2 cursor-pointer">
            <HiArrowLeft className="size-5" />
            <p>Tornar a categories</p>
          </Link>
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