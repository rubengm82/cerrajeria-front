import { HiArrowRight } from 'react-icons/hi'
import { FiHeadphones, FiKey, FiLock, FiSettings, FiShield, FiTool, FiTruck } from 'react-icons/fi'
import { getImportantProducts, getProduct } from '../api/products_api'
import { getImportantCategories } from "../api/categories_api";
import ProductCard from '../components/ProductCard'
import CategoryCard from '../components/CategoryCard'
import ProductDetailModal from '../components/ProductDetailModal'
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react';
import '../../scss/main_shop.scss'

const productSkeletons = Array.from({ length: 5 })
const categorySkeletons = Array.from({ length: 5 })

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

  const openProductModal = async (product) => {
    try {
      const response = await getProduct(product.id)
      setSelectedProduct(response.data)
    } catch (error) {
      console.error(error)
      setSelectedProduct(product)
    }

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
          <section className="hero-box">
            <div className="hero-box__content">
              <p className="hero-box__eyebrow text-primary">Serralleria professional</p>
              <h1 id="shop-hero-title" className="hero-box__title text-5xl lg:text-7xl font-black leading-tight tracking-tighter">
                <span className="hero-box__line hero-box__line--nowrap flex flex-wrap items-center gap-x-3 md:gap-x-4">
                  <span>El millor</span>
                  <span className="text-rotate text-primary duration-20000 inline-grid px-2">
                    <span>
                      <span>servei</span>
                      <span>preu</span>
                      <span>material</span>
                      <span>suport</span>
                      <span>estil</span>
                    </span>
                  </span>
                </span>
                <span className="hero-box__line">en un sol lloc</span>
              </h1>

              <p className="hero-box__text text-base-400">
                Descobreix la nostra selecció d'eines i materials de serralleria professional. Qualitat garantida al millor preu.
              </p>

              <div className="hero-box__actions">
                <Link to='/products' type="button" className="btn btn-primary hero-box__button" aria-label="Anar al catàleg de productes">
                  <p>Veure productes</p>
                  <HiArrowRight className="shop-icon" aria-hidden="true" />
                </Link>

                <Link to='/categories' type="button" className="btn btn-secondary hero-box__button" aria-label="Anar al llistat de categories">
                  <p>Veure categories</p>
                  <HiArrowRight className="shop-icon" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="hero-box__image-wrap">
              <img src="/banner.png" alt="Banner de serralleria professional" className='block w-[min(100%,32rem)] min-h-[clamp(18rem,32vw,26rem)] aspect-square mx-auto object-cover rounded-2xl' />

              {/*
              <div className="hero-orbit" aria-label="Serveis de serralleria professional">
                <div className="hero-orbit__outer-ring" aria-hidden="true"></div>
                <div className="hero-orbit__inner-ring" aria-hidden="true"></div>

                <div className="hero-orbit__center bg-primary text-base-100" aria-hidden="true">
                  <FiKey className="hero-orbit__center-icon" />
                </div>

                <div className="hero-orbit__items">
                  <div className="hero-orbit__item hero-orbit__item--unlock">
                    <div className="hero-orbit__card tooltip" data-tip="Eines professionals" tabIndex={0} aria-label="Eines professionals">
                      <FiTool />
                    </div>
                  </div>

                  <div className="hero-orbit__item hero-orbit__item--lock">
                    <div className="hero-orbit__card tooltip" data-tip="Panys i seguretat" tabIndex={0} aria-label="Panys i seguretat">
                      <FiLock />
                    </div>
                  </div>

                  <div className="hero-orbit__item hero-orbit__item--settings">
                    <div className="hero-orbit__card tooltip" data-tip="Solucions a mida" tabIndex={0} aria-label="Solucions a mida">
                      <FiSettings />
                    </div>
                  </div>

                  <div className="hero-orbit__item hero-orbit__item--shield">
                    <div className="hero-orbit__card tooltip" data-tip="Garantia de qualitat" tabIndex={0} aria-label="Garantia de qualitat">
                      <FiShield />
                    </div>
                  </div>
                </div>
              </div>
              */}
            </div>
          </section>

          <section className="feature-list bg-base-100 border-base-300" aria-label="Avantatges del servei">
            <div className="feature-list__item feature-list__item--line border-base-300">
              <FiTruck className="feature-list__icon text-primary" strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h2 className="feature-list__title">Enviament gratuït</h2>
                <p className="feature-list__text text-base-300">En comandes de més de 60 €</p>
              </div>
            </div>

            <div className="feature-list__item feature-list__item--line border-base-300">
              <FiShield className="feature-list__icon text-primary" strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h2 className="feature-list__title">Garantia de qualitat</h2>
                <p className="feature-list__text text-base-300">Tots els productes són d'alta qualitat</p>
              </div>
            </div>

            <div className="feature-list__item">
              <FiHeadphones className="feature-list__icon text-primary" strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h2 className="feature-list__title">Atenció experta</h2>
                <p className="feature-list__text text-base-300">Atenció professional de qualitat</p>
              </div>
            </div>
          </section>

          <section className="shop-section shop-section--products">
            <div className="section-head">
              <div>
                <p className="section-head__tag text-primary">El més destacat</p>
                <h2 id="featured-products-title" className="section-head__title">Productes destacats</h2>
              </div>

              <button onClick={() => navigate("/products")} type="button" className="section-link section-link--desktop text-primary" aria-label="Veure tots els productes destacats">
                Veure'ls tots
                <HiArrowRight className="shop-icon" aria-hidden="true" />
              </button>
            </div>

            <div className="products-grid">
              {isLoadingProducts ? productSkeletons.map((_, index) => (
                <div className="product-card-skeleton" key={`featured-product-skeleton-${index}`} aria-hidden="true">
                  <div className="skeleton product-card-skeleton__media"></div>
                  <div className="product-card-skeleton__body">
                    <div className="skeleton product-card-skeleton__line product-card-skeleton__line--tag"></div>
                    <div className="skeleton product-card-skeleton__line product-card-skeleton__line--title"></div>
                    <div className="skeleton product-card-skeleton__line"></div>
                    <div className="skeleton product-card-skeleton__line product-card-skeleton__line--short"></div>
                  </div>
                </div>
              )) : importantProducts && importantProducts.length > 0 ? importantProducts.map((product, index) => (
                <div className="shop-card-reveal" key={product.id} style={{ '--reveal-delay': `${Math.min(index, 5) * 70}ms` }}>
                  <ProductCard product={product} onView={openProductModal} />
                </div>
              )) :
              <p className='shop-empty'>Actualment no hi ha productes destacats</p>
              }
            </div>

            <button onClick={() => navigate("/products")} type="button" className="section-link section-link--mobile text-primary" aria-label="Veure tots els productes destacats">
              Veure'ls tots
              <HiArrowRight className="shop-icon" aria-hidden="true" />
            </button>
          </section>
        </div>
      </div>
      {/* Banner naranja */}
      <div className='promo-banner bg-primary h-48 grid place-items-center' aria-label="Missatge destacat">
        <h3 className='promo-banner__text m-0 h-full w-full flex items-center justify-center px-4 text-base-100 font-black text-center leading-tight'>
          <span className="promo-banner__rotator">
            <span>
              <span className="promo-banner__phrase">"La clau de la teva tranquil·litat, a un sol clic"</span>
              <span className="promo-banner__phrase">"Seguretat per a la teva llar, sense esperes"</span>
              <span className="promo-banner__phrase">"Solucions de serralleria a mida per a tu"</span>
              <span className="promo-banner__phrase">"Qualitat i confiança en cada pany"</span>
              <span className="promo-banner__phrase">"El teu expert de confiança, sempre a prop"</span>
            </span>
          </span>
        </h3>
      </div>

      {/* Categorias */}
      <div className='shop-home__categories'>
        <div className="shop-home__container shop-home__container--categories">
          <section>
          <div className="section-head">
            <div>
              <p className="section-head__tag text-primary">Explora el nostre catàleg</p>
              <h2 id="featured-categories-title" className="section-head__title">Categories principals</h2>
            </div>

            <button onClick={() => navigate("/categories")} type="button" className="section-link section-link--desktop text-primary" aria-label="Veure totes les categories">
              Veure-les totes
              <HiArrowRight className="shop-icon" aria-hidden="true" />
            </button>
          </div>

          <div className="categories-grid">
            {isLoadingCategories ? categorySkeletons.map((_, index) => (
              <div className="category-card-skeleton skeleton" key={`featured-category-skeleton-${index}`} aria-hidden="true">
                <div className="skeleton category-card-skeleton__line"></div>
              </div>
            )) : importantCategories && importantCategories.length > 0 ? importantCategories.map((category, index) => (
              <div className="shop-card-reveal" key={category.id} style={{ '--reveal-delay': `${Math.min(index, 5) * 70}ms` }}>
                <CategoryCard category={category} />
              </div>
            )) : (
              <p className="shop-empty">Actualment no hi ha categories destacades</p>
            )}
          </div>

          <button onClick={() => navigate("/categories")} type="button" className="section-link section-link--mobile text-primary" aria-label="Veure totes les categories">
            Veure-les totes
            <HiArrowRight className="shop-icon" aria-hidden="true" />
          </button>
          </section>
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
        <h3 id="contact-banner-title" className='contact-banner__title text-base-100'>Contacta amb nosaltres ara</h3>
        <p className='contact-banner__text text-base-100'>Contacta amb nosaltres ara, som especialistes en serralleria i et podem ajudar.</p>

        <button onClick={() => navigate("/custom-solutions")} className='btn btn-secondary contact-banner__button' aria-label="Anar al formulari de solucions personalitzades">Solucions Personalitzades</button>
      </div>

    </div>
  )
}

export default Shop
