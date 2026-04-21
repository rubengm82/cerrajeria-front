import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import ProductDetailModal from "../../components/ProductDetailModal"
import { HiArrowLeft } from "react-icons/hi2"
import { getCategory } from "../../api/categories_api"
import { getProduct, getProducts } from "../../api/products_api"
import '../../../scss/main_shop.scss'

function CategoriesShow() {
  const {id} = useParams()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingSelectedProduct, setIsLoadingSelectedProduct] = useState(false)

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

  // Caché para productos
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await getProducts();
      sessionStorage.setItem('cached_products', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const categoryProducts = Object.values(category?.products || {})
  const products = productsData || []

  const openProductModal = async (product) => {
    setSelectedProduct(product)
    setIsLoadingSelectedProduct(true)
    setIsModalOpen(true)

    try {
      const response = await getProduct(product.id)
      setSelectedProduct(response.data)
    } catch (error) {
      console.error("Error en carregar el detall del producte", error)
      const fullProduct = products.find(p => p.id === product.id)
      setSelectedProduct(fullProduct || product)
    } finally {
      setIsLoadingSelectedProduct(false)
    }
  }

  const closeProductModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setIsLoadingSelectedProduct(false)
  }

  return loading ? <LoadingAnimation /> : (
    <div className='bg-base-200 flex flex-col items-center justify-center'>
      <div className="w-full max-w-390 px-4">
        <div className="px-0 py-12 sm:py-16 lg:px-4">
          <Link to="/categories" className="link link-hover text-primary mb-4 flex items-center gap-2 cursor-pointer" aria-label="Tornar al llistat de categories">
            <HiArrowLeft className="size-5" aria-hidden="true" />
            <p>Tornar a les categories</p>
          </Link>
          <h1 id="category-detail-title" className="mt-1 text-4xl font-medium tracking-tight sm:text-3xl mb-10">{category.name}:</h1>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoryProducts.length > 0 ? categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} onView={openProductModal} />
          )) : <p className='col-span-full font-semibold text-2xl'>Actualment no hi ha productes</p> }
          </div>
        </div>
      </div>
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        isLoading={isLoadingSelectedProduct}
      />
    </div>
  )
}

export default CategoriesShow
