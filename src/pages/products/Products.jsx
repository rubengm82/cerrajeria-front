import { useState } from "react"
import { Link } from "react-router-dom"
import { HiArrowLeft } from "react-icons/hi2"
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "../../api/products_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import ProductDetailModal from "../../components/ProductDetailModal"
import { HiOutlineAdjustmentsHorizontal, HiMagnifyingGlass, HiXMark, HiOutlineFunnel } from "react-icons/hi2";
import { getCategories } from "../../api/categories_api";
import { getFeatures, getFeatureTypes } from "../../api/features_api";
import '../../../scss/main_shop.scss'

function Products() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Caché para productos
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await getProducts();
      sessionStorage.setItem('cached_products', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Caché para categorías
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      sessionStorage.setItem('cached_categories', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Caché para features
  const { data: featuresData, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['features'],
    queryFn: async () => {
      const res = await getFeatures();
      sessionStorage.setItem('cached_features', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Caché para feature types
  const { data: featuresTypesData, isLoading: isLoadingFeaturesTypes } = useQuery({
    queryKey: ['featureTypes'],
    queryFn: async () => {
      const res = await getFeatureTypes();
      sessionStorage.setItem('cached_featureTypes', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Estados con datos de cache o fallback
  const products = productsData || [];
  const categories = categoriesData || [];
  const features = featuresData || [];
  const featuresTypes = featuresTypesData || [];

  const loading = isLoadingProducts || isLoadingCategories || isLoadingFeatures || isLoadingFeaturesTypes;

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const toggleCategory = (categoryName) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(categoryName)
        ? currentCategories.filter((name) => name !== categoryName)
        : [...currentCategories, categoryName]
    )
  }

  // Función para crear un identificador único combinando tipo + valor
  const getFeatureKey = (typeName, value) => `${typeName}-${value}`;

  const toggleFeature = (featureKey) => {
    setSelectedFeatures((currentFeature) =>
      currentFeature.includes(featureKey)
        ? currentFeature.filter((key) => key !== featureKey)
        : [...currentFeature, featureKey]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedFeatures([])
  }

  // Filtro con lógica "Y" (AND): el producto debe tener TODAS las características seleccionadas
  const filteredProducts = products.filter((product) => {
    // Verificar categorías
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category?.name);
    
    // Verificar características (todas las seleccionadas deben estar presentes)
    const featuresMatch = selectedFeatures.length === 0 || 
      selectedFeatures.every(selectedKey => {
        return product.features?.some(feature => {
          const featureKey = getFeatureKey(feature.type?.name, feature.value);
          return featureKey === selectedKey;
        });
      });
    
    return categoryMatch && featuresMatch;
  });


  return loading ? <LoadingAnimation /> : (
    <div className='products-page'>
      <div className="products-page__container">
        <div className="products-page__body">
          <div className="products-top">
            <div>
              <Link to="/" className="link link-hover text-primary mb-2 flex items-center gap-2 cursor-pointer">
                <HiArrowLeft className="size-5" />
                <p>Tornar a l'inici</p>
              </Link>
              <p className="products-top__tag text-primary">Catàleg</p>
              <h2 className="products-top__title">Productes</h2>
            </div>

            <div className="products-top__actions">
              <p className="products-top__count text-base-400">
                Mostrant {filteredProducts.length} productes
              </p>

              <button type="button" className="btn products-top__filters-button" onClick={() => document.getElementById("products-filters-modal").showModal()}>
                <HiOutlineAdjustmentsHorizontal className="filters-box__icon" />
                Filtres
              </button>
            </div>
          </div>

          <div className="products-layout">
            <div>
              <div className="products-list">
                { filteredProducts.length > 0 ?
                  filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onView={openProductModal} />
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
                    <button 
                      onClick={clearFilters} 
                      className="btn btn-ghost btn-sm mr-2"
                    >
                      Sense filtres
                    </button>
                    <form method="dialog">
                      <button>
                        <HiXMark className="filters-box__icon filters-box__close-icon" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="filters-box__content">
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

                  <div className="collapse collapse-arrow filters-box__section border-base-300">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title filters-box__section-title">
                      <h4 className="filters-box__label text-primary">Característiques</h4>
                    </div>

                    <div className="collapse-content filters-box__section-body">
                      {featuresTypes.map((featureType) => (
                        <div key={featureType.name} className="filters-box__type-group">
                          <div className="divider">{featureType.name.charAt(0).toUpperCase() + featureType.name.slice(1)}</div>
                          <div className="filters-box__list">
                            {featureType.features?.map((feature) => {
                               const featureKey = getFeatureKey(featureType.name, feature.value);
                               const featureWithCount = features.find(f => f.type?.name === featureType.name && f.value === feature.value);
                               const productsCount = featureWithCount?.products_count || 0;
                               return (
                              <label key={featureKey} className="filters-box__item">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-sm border-base-300"
                                  checked={selectedFeatures.includes(featureKey)}
                                  onChange={() => toggleFeature(featureKey)}
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

      {/* Modal de ver producto */}
      <ProductDetailModal 
        key={selectedProduct?.id || 'no-product'}
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={closeProductModal}
      />
    </div>
  )
}

export default Products
