import { useEffect, useState } from "react"
import { getProducts } from "../../api/products_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import { HiChevronDown, HiOutlineAdjustmentsHorizontal, HiMagnifyingGlass } from "react-icons/hi2";
import { getCategories } from "../../api/categories_api";

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsResponse, categoriesResponse]) => {
        setProducts(productsResponse.data)
        setCategories(categoriesResponse.data)
      })
      .catch(error => {
          console.error(error)
          setProducts([])
          setCategories([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const toggleCategory = (categoryName) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(categoryName)
        ? currentCategories.filter((name) => name !== categoryName)
        : [...currentCategories, categoryName]
    )
  }


  return loading ? <LoadingAnimation /> : (
    <div className='bg-base-200 flex flex-col items-center justify-center'>
      <div className="w-full max-w-390 px-4">
        <div className="px-0 py-12 sm:py-16 lg:px-4">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[5px] text-primary">Catalogo</p>
              <h2 className="mt-1 text-4xl font-medium tracking-tight sm:text-3xl">Productes</h2>
            </div>
            <p className="text-base-400">
              Mostrant {products.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name))).length} productes
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="simple-container h-fit xl:sticky">
              <div className="flex items-center gap-3">
                <HiOutlineAdjustmentsHorizontal className="size-6" />
                <h3 className="text-2xl font-semibold">Filtres</h3>
              </div>

              <div className="mt-6 space-y-8">
                <section className="border-t border-base-300 pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Categories</h4>
                    <HiChevronDown className="size-6" />
                  </div>

                  <label className="input">
                    <HiMagnifyingGlass className="size-6 text-base-300" />
                    <input type="search" placeholder="Buscar categoria.." />
                  </label>

                  <div className="mt-5 space-y-3">
                    {categories.map((category) => (
                      <label key={category.name} className="flex items-center gap-3 text-base">
                        <input type="checkbox" className="checkbox checkbox-md border-base-300" checked={selectedCategories.includes(category.name)} onChange={() => toggleCategory(category.name)}/>
                        <span className="flex-1">{category.name}</span>
                        <span className="text-sm text-base-400">({category.products?.length})</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </aside>

            <div>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                { products.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name))).length > 0 ?
                  products.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name))).map((product) => (
                  <ProductCard key={product.id} product={product} />
                  )) :
                <p className='col-span-full font-semibold text-2xl'>Actualment no hi ha productes</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default Products
