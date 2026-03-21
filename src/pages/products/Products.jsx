import { useEffect, useState } from "react"
import { getProducts } from "../../api/products_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import { HiOutlineAdjustmentsHorizontal, HiMagnifyingGlass } from "react-icons/hi2";
import { getCategories } from "../../api/categories_api";
import '../../../scss/main_shop.scss'

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
    <div className='products-page'>
      <div className="products-page__container">
        <div className="products-page__body">
          <div className="products-top">
            <div>
              <p className="products-top__tag text-primary">Catalogo</p>
              <h2 className="products-top__title">Productes</h2>
            </div>

            <p className="products-top__count text-base-400">
              Mostrant {products.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name))).length} productes
            </p>
          </div>

          <div className="products-layout">
            <aside className="filters-box simple-container">
              <div className="filters-box__head">
                <HiOutlineAdjustmentsHorizontal className="filters-box__icon" />
                <h3 className="filters-box__title">Filtres</h3>
              </div>

              <div className="filters-box__content">
                <div className="collapse collapse-arrow filters-box__section border-base-300">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title filters-box__section-title">
                    <h4 className="filters-box__label">Categories</h4>
                  </div>

                  <div className="collapse-content filters-box__section-body">
                    <label className="input filters-box__search">
                      <HiMagnifyingGlass className="filters-box__search-icon text-base-300" />
                      <input type="search" placeholder="Buscar categoria.." />
                    </label>

                    <div className="filters-box__list">
                      {categories.map((category) => (
                        <label key={category.name} className="filters-box__item">
                          <input type="checkbox" className="checkbox checkbox-md border-base-300" checked={selectedCategories.includes(category.name)} onChange={() => toggleCategory(category.name)}/>
                          <span className="filters-box__item-name">{category.name}</span>
                          <span className="filters-box__item-count text-base-400">({category.products?.length})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div>
              <div className="products-list">
                { products.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name))).length > 0 ?
                  products.filter((product) => (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name))).map((product) => (
                  <ProductCard key={product.id} product={product} />
                  )) :
                <p className='products-empty'>Actualment no hi ha productes</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default Products
