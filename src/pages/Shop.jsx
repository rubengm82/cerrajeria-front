import { HiArrowRight } from 'react-icons/hi'
import { FiHeadphones, FiShield, FiTruck } from 'react-icons/fi'
import { getImportantProducts } from '../api/products_api'
import { getImportantCategories } from "../api/categories_api";
import ProductCard from '../components/ProductCard'
import CategoryCard from '../components/CategoryCard'
import ProductDetailModal from '../components/ProductDetailModal'
import LoadingAnimation from '../components/LoadingAnimation'
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';
import '../../scss/main_shop.scss'


function Shop() {
  const navigate = useNavigate()
  
  // Estado para el modal de ver producto
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Se obtiene el data de lo que retorna el usePersistedQuery
  const { data: importantProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['importantProducts'],
    queryFn: async () => {
      const res = await getImportantProducts();
      sessionStorage.setItem('cached_importantProducts', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const { data: importantCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['importantCategories'],
    queryFn: async () => {
      const res = await getImportantCategories();
      sessionStorage.setItem('cached_importantCategories', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (isLoadingProducts || isLoadingCategories) {
    return <LoadingAnimation />
  }

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="shop-home">
      <div className='shop-home__top'>
        <div className="shop-home__container shop-home__container--hero">
          <div className="hero-box bg-base-200">
            <div className="hero-box__content">
              <h1 className="hero-box__title">
                <span className="hero-box__line hero-box__line--nowrap">
                  El mejor <span className="text-primary">servicio</span>
                </span>
                <span className="hero-box__line">en un solo lugar</span>
              </h1>

              <p className="hero-box__text text-base-400">
                Descubre nuestra seleccion de herramientas y materiales de ferreteria profesional. Calidad garantizada al mejor precio
              </p>

              <div className="hero-box__actions">
                <Link to='/products' type="button" className="btn btn-primary hero-box__button">
                  <p>Ver productos</p>
                  <HiArrowRight className="shop-icon" />
                </Link>

                <Link to='/categories' type="button" className="btn btn-secondary hero-box__button">
                  <p>Ver categorias</p>
                  <HiArrowRight className="shop-icon" />
                </Link>
              </div>
            </div>

            <div className="hero-box__image-wrap">
              <img src="http://127.0.0.1:8000/storage/images/imagen_principal.png" alt="Cerrajero trabajando en una puerta" fetchPriority="high" className="hero-box__image"/>
            </div>
          </div>

          <div className="feature-list bg-base-100 border-base-300">
            <div className="feature-list__item feature-list__item--line border-base-300">
              <FiTruck className="feature-list__icon text-primary" strokeWidth={1.8} />
              <div>
                <h2 className="feature-list__title">Envio gratuito</h2>
                <p className="feature-list__text text-base-300">En pedidos de mas de 60 €</p>
              </div>
            </div>

            <div className="feature-list__item feature-list__item--line border-base-300">
              <FiShield className="feature-list__icon text-primary" strokeWidth={1.8} />
              <div>
                <h2 className="feature-list__title">Garantia de calidad</h2>
                <p className="feature-list__text text-base-300">Todos los productos de alta calidad</p>
              </div>
            </div>

            <div className="feature-list__item">
              <FiHeadphones className="feature-list__icon text-primary" strokeWidth={1.8} />
              <div>
                <h2 className="feature-list__title">Atencion experta</h2>
                <p className="feature-list__text text-base-300">Atencion profesional de calidad</p>
              </div>
            </div>
          </div>

          <div className="shop-section shop-section--products">
            <div className="section-head">
              <div>
                <p className="section-head__tag text-primary">Lo mas destacado</p>
                <h2 className="section-head__title">Productos Destacados</h2>
              </div>

              <button onClick={() => navigate("/products")} type="button" className="section-link section-link--desktop text-primary">
                Ver todos
                <HiArrowRight className="shop-icon" />
              </button>
            </div>

            <div className="products-grid">
              { importantProducts && importantProducts.length > 0 ? importantProducts.map((product) => (
                <ProductCard key={product.id} product={product} onView={openProductModal} />
              )) :
              <p className='shop-empty'>Actualmente no hay productos destacados</p>
              }
            </div>

            <button onClick={() => navigate("/products")} type="button" className="section-link section-link--mobile text-primary">
              Ver todos
              <HiArrowRight className="shop-icon" />
            </button>
          </div>
        </div>
      </div>
      {/* Banner naranja */}
      <div className='promo-banner bg-primary'>
        <h3 className='promo-banner__text text-base-100'>La llave de tu tranquilidad, a un solo clic</h3>
      </div>

      {/* Categorias */}
      <div className='shop-home__categories'>
        <div className="shop-home__container shop-home__container--categories">
          <div className="section-head">
            <div>
              <p className="section-head__tag text-primary">Explora nuestro catalogo</p>
              <h2 className="section-head__title">Categorias principales</h2>
            </div>

            <button onClick={() => navigate("/categories")} type="button" className="section-link section-link--desktop text-primary">
              Ver todas
              <HiArrowRight className="shop-icon" />
            </button>
          </div>

          <div className="categories-grid">
            {importantCategories && importantCategories.length > 0 ? importantCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            )) : (
              <p className="shop-empty">Actualmente no hay categorias destacadas</p>
            )}
          </div>

          <button onClick={() => navigate("/categories")} type="button" className="section-link section-link--mobile text-primary">
            Ver todas
            <HiArrowRight className="shop-icon" />
          </button>
        </div>
      </div>

      {/* Modal de ver producto */}
      <ProductDetailModal 
        key={selectedProduct?.id || 'no-product'}
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={closeProductModal}
      />

      {/* Banner naranja de contacto */}
      <div className='contact-banner bg-primary'>
        <h3 className='contact-banner__title text-base-100'>Contacta con nosotros ahora</h3>
        <p className='contact-banner__text text-base-100'>Contacta con nosotros ahora, somos especialistas en cerrajeria</p>

        <button className='btn btn-secondary contact-banner__button'>Contacta con nosotros ahora</button>
      </div>

    </div>
  )
}

export default Shop
