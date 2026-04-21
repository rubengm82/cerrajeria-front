import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { HiArrowLeft, HiXMark, HiOutlineAdjustmentsHorizontal, HiSparkles, HiOutlineFunnel } from 'react-icons/hi2'
import { FiPackage } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import { search } from '../../api/search_api'
import { getProduct } from '../../api/products_api'
import { getPack } from '../../api/packs_api'
import { getFeatures, getFeatureTypes } from '../../api/features_api'
import ProductCard from '../../components/ProductCard'
import ProductDetailModal from '../../components/ProductDetailModal'
import Notifications from '../../components/Notifications'
import '../../../scss/main_shop.scss'

const searchSkeletons = Array.from({ length: 5 })

const getFiltersFromSearchParams = (searchParams) => ({
  category: searchParams.get('category') ? Number(searchParams.get('category')) : null,
  price_min: searchParams.get('price_min') || null,
  price_max: searchParams.get('price_max') || null,
  only_packs: searchParams.get('only_packs') === 'true' || false,
})

function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams))

  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingItem, setIsLoadingItem] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    setFilters(getFiltersFromSearchParams(searchParams))
    setSelectedFeatures([])
  }, [query, searchParams])

  // Fetch features and feature types for filter modal
  const { data: featuresData } = useQuery({
    queryKey: ['features'],
    queryFn: async () => {
      const res = await getFeatures()
      return res.data
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const { data: featuresTypesData } = useQuery({
    queryKey: ['featureTypes'],
    queryFn: async () => {
      const res = await getFeatureTypes()
      return res.data
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const features = Array.isArray(featuresData) ? featuresData : []
  const featuresTypes = Array.isArray(featuresTypesData) ? featuresTypesData : []

  const { data: searchData, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => search(query, {}, 50),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
  })

  const { products = [], packs = [], categories = [] } = searchData || {}

  const filteredProducts = useMemo(() => {
    // If only_packs filter is active, show no products
    if (filters.only_packs) return []

    let result = [...products]
    if (filters.price_min) {
      result = result.filter(p => parseFloat(p.price) >= parseFloat(filters.price_min))
    }
    if (filters.price_max) {
      result = result.filter(p => parseFloat(p.price) <= parseFloat(filters.price_max))
    }
    if (filters.category) {
      result = result.filter(p => p.category?.id === filters.category)
    }
    if (selectedFeatures.length > 0) {
      const featuresByType = {}
      selectedFeatures.forEach(featureKey => {
        const [typeName, value] = featureKey.split('-')
        if (!featuresByType[typeName]) {
          featuresByType[typeName] = []
        }
        featuresByType[typeName].push(value)
      })

      result = result.filter(product => {
        return Object.entries(featuresByType).every(([typeName, values]) => {
          return product.features?.some(f => f.type?.name === typeName && values.includes(f.value))
        })
      })
    }
    return result
  }, [products, filters, selectedFeatures])

  const filteredPacks = useMemo(() => {
    let result = [...packs]
    if (filters.price_min) {
      result = result.filter(p => parseFloat(p.total_price || p.price || 0) >= parseFloat(filters.price_min))
    }
    if (filters.price_max) {
      result = result.filter(p => parseFloat(p.total_price || p.price || 0) <= parseFloat(filters.price_max))
    }
    if (selectedFeatures.length > 0) {
      const featuresByType = {}
      selectedFeatures.forEach(featureKey => {
        const [typeName, value] = featureKey.split('-')
        if (!featuresByType[typeName]) {
          featuresByType[typeName] = []
        }
        featuresByType[typeName].push(value)
      })

      result = result.filter(pack => {
        return Object.entries(featuresByType).every(([typeName, values]) => {
          return pack.features?.some(f => f.type?.name === typeName && values.includes(f.value))
        })
      })
    }
    return result
  }, [packs, filters.price_min, filters.price_max, selectedFeatures])

  const resultsExist = useMemo(() => {
    return filteredProducts.length > 0 || filteredPacks.length > 0
  }, [filteredProducts, filteredPacks])

  const filteredTotal = filteredProducts.length + filteredPacks.length

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  // Función para crear un identificador único combinando tipo + valor
  const getFeatureKey = (typeName, value) => `${typeName}-${value}`

  const toggleFeature = useCallback((featureKey) => {
    setSelectedFeatures(current =>
      current.includes(featureKey)
        ? current.filter(key => key !== featureKey)
        : [...current, featureKey]
    )
  }, [])

  const clearFilters = useCallback(() => {
    const emptyFilters = { category: null, price_min: null, price_max: null, only_packs: false }
    updateFilters(emptyFilters)
    setSelectedFeatures([])
  }, [updateFilters])

  const toggleCategoryFilter = useCallback((categoryId) => {
    const newCategory = filters.category === categoryId ? null : categoryId
    updateFilters({ ...filters, category: newCategory })
  }, [filters, updateFilters])

  const togglePackFilter = useCallback(() => {
    updateFilters({ ...filters, only_packs: !filters.only_packs })
  }, [filters, updateFilters])

  const openItemModal = async (item, type) => {
    setSelectedType(type)
    setSelectedItem(item)
    setIsLoadingItem(true)
    setIsModalOpen(true)

    try {
      const response = type === 'product'
        ? await getProduct(item.id)
        : await getPack(item.id)

      let newItem = response.data
      if (newItem?.data) {
        newItem = newItem.data
      }

      if (type === 'product' && item.features && Array.isArray(item.features) && item.features.length > 0) {
        newItem = { ...newItem, features: item.features }
      }

      setSelectedItem(newItem)
    } catch (error) {
      console.error('Error fetching item details:', error)
      setSelectedItem(item)
    } finally {
      setIsLoadingItem(false)
    }
  }

  const closeItemModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setSelectedType(null)
  }, [])

  if (!query) {
    return (
      <div className='search-page'>
        <div className="search-page__container">
          <div className="search-page__empty">
            <HiSparkles />
            <h1>Introdueix un terme de cerca</h1>
            <p>Utilitza la barra de cerca per trobar productes i packs</p>
            <Link to="/" className="btn btn-primary">
              Tornar a l'inici
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='search-page'>
        <div className="search-page__container">
          <div className="search-page__error">
            <h1>Error en la cerca</h1>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='search-page'>

      {notification && (
        <Notifications
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="search-page__container">
        <div className="search-page__body">
          <div className="products-top">
            <div>
              <Link to="/" className="link link-hover text-primary mb-2 flex items-center gap-2">
                <HiArrowLeft />
                <p>Tornar a l'inici</p>
              </Link>
              <h1 className="products-top__title">Resultats per "{query}"</h1>
            </div>

            <div className="products-top__actions">
              <p className="products-top__count text-base-400">
                {isLoading ? "Carregant resultats" : `${filteredTotal} resultats trobats`}
              </p>
              <button
                type="button"
                className="btn products-top__filters-button"
                disabled={isLoading}
                onClick={() => document.getElementById("search-filters-modal").showModal()}
                aria-label="Obrir filtres de cerca"
              >
                <HiOutlineAdjustmentsHorizontal className="filters-box__icon" aria-hidden="true" />
                Filtres
              </button>
            </div>
          </div>

          <main className="search-results">
          {isLoading ? (
            <>
              <section className="search-results__section">
                <div className="search-results__section-header">
                  <h2 className="search-results__section-title">Productes</h2>
                </div>
                <div className="search-results__grid">
                  {searchSkeletons.map((_, index) => (
                    <div className="product-card-skeleton" key={`search-product-skeleton-${index}`} aria-hidden="true">
                      <div className="skeleton product-card-skeleton__media"></div>
                      <div className="product-card-skeleton__body">
                        <div className="skeleton product-card-skeleton__line product-card-skeleton__line--tag"></div>
                        <div className="skeleton product-card-skeleton__line product-card-skeleton__line--title"></div>
                        <div className="skeleton product-card-skeleton__line"></div>
                        <div className="skeleton product-card-skeleton__line product-card-skeleton__line--short"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="search-results__section search-results__section--packs">
                <div className="search-results__section-header">
                  <h2 className="search-results__section-title">Packs</h2>
                </div>
                <div className="search-results__grid search-results__grid--packs">
                  {searchSkeletons.map((_, index) => (
                    <div className="product-card-skeleton" key={`search-pack-skeleton-${index}`} aria-hidden="true">
                      <div className="skeleton product-card-skeleton__media"></div>
                      <div className="product-card-skeleton__body">
                        <div className="skeleton product-card-skeleton__line product-card-skeleton__line--tag"></div>
                        <div className="skeleton product-card-skeleton__line product-card-skeleton__line--title"></div>
                        <div className="skeleton product-card-skeleton__line"></div>
                        <div className="skeleton product-card-skeleton__line product-card-skeleton__line--short"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : !resultsExist ? (
            <div className="search-results__empty">
              <HiSparkles />
              <h2>No s'han trobat resultats</h2>
            </div>
          ) : (
            <>
                {filteredProducts.length > 0 && (
                  <section className="search-results__section">
                    <div className="search-results__section-header">
                      <h2 className="search-results__section-title">Productes</h2>
                    </div>
                    <div className="search-results__grid">
                      {filteredProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onView={() => openItemModal(product, 'product')}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {filteredPacks.length > 0 && (
                  <section className="search-results__section search-results__section--packs">
                    <div className="search-results__section-header">
                      <h2 className="search-results__section-title">Packs</h2>
                    </div>
                    <div className="search-results__grid search-results__grid--packs">
                      {filteredPacks.map(pack => (
                       <ProductCard
                         key={pack.id}
                         product={pack}
                         onView={() => openItemModal(pack, 'pack')}
                       />
                     ))}
                   </div>
                 </section>
               )}
            </>
          )}
        </main>
        </div>
      </div>

      {/* Modal de filtros */}
      <dialog id="search-filters-modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box filters-modal">
          <div className="filters-box">
            <div className="filters-box__head">
              <div className="filters-box__head-content">
                <HiOutlineFunnel className="filters-box__icon" aria-hidden="true" />
                <h2 id="search-filters-title" className="filters-box__title">Filtres</h2>
              </div>
              <div className="modal-action filters-box__modal-close">
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm mr-2"
                  aria-label="Treure tots els filtres"
                >
                  Sense filtres
                </button>
                <form method="dialog">
                  <button aria-label="Tancar filtres">
                    <HiXMark className="filters-box__icon filters-box__close-icon" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>

            <div className="filters-box__content">
              {/* Categories Section */}
              {categories && categories.length > 0 && (
                <div className="collapse collapse-arrow filters-box__section border-base-300">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title filters-box__section-title">
                    <h4 className="filters-box__label text-primary">Categories</h4>
                  </div>
                  <div className="collapse-content filters-box__section-body">
                    <div className="filters-box__list">
                      {categories.map((category) => (
                        <label key={category.id} className="filters-box__item">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm border-base-300"
                            checked={filters.category === category.id}
                            onChange={() => toggleCategoryFilter(category.id)}
                          />
                          <span className="filters-box__item-name">
                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                          </span>
                          <span className="filters-box__item-count text-base-400">
                            ({category.products_count ?? category.products?.length ?? 0})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Range Section */}
              <div className="collapse collapse-arrow filters-box__section border-base-300">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title filters-box__section-title">
                  <h4 className="filters-box__label text-primary">Rang de preu</h4>
                </div>
                <div className="collapse-content filters-box__section-body">
                  <div className="filters-box__price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      className="input input-bordered w-full"
                      value={filters.price_min || ''}
                      onChange={(e) => updateFilters({ ...filters, price_min: e.target.value || null })}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="input input-bordered w-full"
                      value={filters.price_max || ''}
                      onChange={(e) => updateFilters({ ...filters, price_max: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              {/* Packs Only Section */}
              <div className="collapse collapse-arrow filters-box__section border-base-300">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title filters-box__section-title">
                  <h4 className="filters-box__label text-primary">Tipus</h4>
                </div>
                <div className="collapse-content filters-box__section-body">
                  <label className="filters-box__item">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-base-300"
                      checked={filters.only_packs}
                      onChange={togglePackFilter}
                    />
                    <FiPackage className="filters-box__pack-icon" aria-hidden="true" />
                    <span className="filters-box__item-name">Només packs</span>
                  </label>
                </div>
              </div>

              {/* Features Section */}
              {featuresTypes && featuresTypes.length > 0 && (
                <div className="collapse collapse-arrow filters-box__section border-base-300">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title filters-box__section-title">
                    <h4 className="filters-box__label text-primary">Característiques</h4>
                  </div>
                  <div className="collapse-content filters-box__section-body">
                    {featuresTypes.map((featureType) => (
                      <div key={featureType.name} className="filters-box__type-group">
                        <div className="divider" aria-label={`Tipus de característica ${featureType.name}`}>
                          {featureType.name.charAt(0).toUpperCase() + featureType.name.slice(1)}
                        </div>
                        <div className="filters-box__list">
                          {featureType.features?.map((feature) => {
                            const featureKey = getFeatureKey(featureType.name, feature.value)
                            const featureWithCount = features.find(
                              f => f.type?.name === featureType.name && f.value === feature.value
                            )
                            const productsCount = featureWithCount?.products_count || 0
                            return (
                              <label key={featureKey} className="filters-box__item">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-sm border-base-300"
                                  checked={selectedFeatures.includes(featureKey)}
                                  onChange={() => toggleFeature(featureKey)}
                                  aria-label={`Filtrar per ${featureType.name}: ${feature.value}`}
                                />
                                <span className="filters-box__item-name">
                                  {feature.value.charAt(0).toUpperCase() + feature.value.slice(1)}
                                </span>
                                <span className="filters-box__item-count text-base-400">
                                  ({productsCount})
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </dialog>

      <ProductDetailModal
        key={selectedItem?.id || 'no-item'}
        product={selectedItem}
        isOpen={isModalOpen}
        onClose={closeItemModal}
        entityType={selectedType}
        isLoading={isLoadingItem}
      />

    </div>
  )
}

export default SearchResults
