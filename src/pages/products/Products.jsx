import { useEffect, useState } from "react"
import { getProducts } from "../../api/products_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import { HiOutlineAdjustmentsHorizontal, HiMagnifyingGlass, HiXMark, HiOutlineFunnel } from "react-icons/hi2";
import { getCategories } from "../../api/categories_api";
import { getFeatures, getFeatureTypes } from "../../api/features_api";
import '../../../scss/main_shop.scss'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [features, setFeatures] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [featuresTypes, setFeaturesTypes] = useState([])

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getFeatures(), getFeatureTypes()])
      .then(([productsResponse, categoriesResponse, featuresResponse, featuresTypesResponse]) => {
        setProducts(productsResponse.data)
        setCategories(categoriesResponse.data)
        setFeatures(featuresResponse.data)
        setFeaturesTypes(featuresTypesResponse.data)
      })
      .catch(error => {
          console.error(error)
          setProducts([])
          setCategories([])
          setFeatures([])
          setFeaturesTypes([])
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

  const toggleFeature = (featureValue) => {
    setSelectedFeatures((currentFeature) =>
      currentFeature.includes(featureValue)
        ? currentFeature.filter((value) => value !== featureValue)
        : [...currentFeature, featureValue]
    )
  }

  const filteredProducts = products.filter((product) => (
    (selectedCategories.length === 0 || selectedCategories.includes(product.category?.name)) &&
    (selectedFeatures.length === 0 || product.features?.some(feature => selectedFeatures.includes(feature.value)))
  ))


  return loading ? <LoadingAnimation /> : (
    <div className='products-page'>
      <div className="products-page__container">
        <div className="products-page__body">
          <div className="products-top">
            <div>
              <p className="products-top__tag text-primary">Catàleg</p>
              <h2 className="products-top__title">Productes</h2>
            </div>

            <div className="products-top__actions">
              <p className="products-top__count text-base-400">
                Mostrant {filteredProducts.length} productes
              </p>

              <button type="button" className="btn products-top__filters-button" onClick={() => document.getElementById("products-filters-modal").showModal()}>
                <HiOutlineAdjustmentsHorizontal className="filters-box__icon " />
                Filtres
              </button>
            </div>
          </div>

          <div className="products-layout">
            <div>
              <div className="products-list">
                { filteredProducts.length > 0 ?
                  filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                  )) :
                <p className='products-empty'>Actualment no hi ha productes</p>}
              </div>
            </div>
          </div>

          <dialog id="products-filters-modal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box filters-modal">
              <div className="filters-box">
                <div className="filters-box__head">
                  <div className="filters-box__head-content">
                    <HiOutlineFunnel className="filters-box__icon" />
                    <h3 className="filters-box__title">Filtres</h3>
                  </div>
                  <div className="modal-action filters-box__modal-close">
                    <form method="dialog">
                      <button>
                        <HiXMark className="filters-box__icon filters-box__close-icon" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="filters-box__content">
                  {/* <label className="input filters-box__search">
                    <HiMagnifyingGlass className="filters-box__icon text-base-300" />
                    <input type="search" placeholder="Buscar..." />
                  </label> */}
                  <div className="collapse collapse-arrow filters-box__section border-base-300">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title filters-box__section-title">
                      <h4 className="filters-box__label text-primary">Categories</h4>
                    </div>

                    <div className="collapse-content filters-box__section-body">
                      <div className="filters-box__list">
                        {categories.map((category) => (
                          <label key={category.name} className="filters-box__item">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-base-300"
                              checked={selectedCategories.includes(category.name)}
                              onChange={() => toggleCategory(category.name)}
                            />
                            <span className="filters-box__item-name">{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
                            <span className="filters-box__item-count text-base-400">({category.products?.length})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1. Título principal "Características" */}
                  <div className="collapse collapse-arrow filters-box__section border-base-300">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title filters-box__section-title">
                      <h4 className="filters-box__label text-primary">Característiques</h4>
                    </div>

                    <div className="collapse-content filters-box__section-body">
                      {/* 2. Iterar por cada FeatureType */}
                      {featuresTypes.map((featureType) => (
                        <div key={featureType.name} className="filters-box__type-group">
                          
                          {/* 3. Nombre del tipo como subtítulo */}
                          <div className="divider">{featureType.name.charAt(0).toUpperCase() + featureType.name.slice(1)}</div>
                          
                          {/* 4. Los valores (features) como checkboxes */}
                          <div className="filters-box__list">
                            {featureType.features?.map((feature) => {
                               const featureWithCount = features.find(f => f.value === feature.value);
                               const productsCount = featureWithCount?.products_count || 0;
                               return (
                              <label key={feature.value} className="filters-box__item">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-sm border-base-300"
                                  checked={selectedFeatures.includes(feature.value)}
                                  onChange={() => toggleFeature(feature.value)}
                                />
                                <span className="filters-box__item-name">{feature.value.charAt(0).toUpperCase() + feature.value.slice(1)}</span>
                                <span className="filters-box__item-count text-base-400">
                                  ({productsCount})
                                </span>
                              </label>
                            );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </dialog>

        </div>
      </div>
    </div>
    )
}

export default Products
