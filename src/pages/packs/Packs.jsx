import { useState } from "react"
import { Link } from "react-router-dom"
import { HiArrowLeft } from "react-icons/hi2"
import { useQuery } from "@tanstack/react-query"
import { getPack, getPacks } from "../../api/packs_api"
import LoadingAnimation from "../../components/LoadingAnimation"
import ProductCard from "../../components/ProductCard"
import ProductDetailModal from "../../components/ProductDetailModal"
import '../../../scss/main_shop.scss'

function Packs() {
  const [selectedPack, setSelectedPack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSelectedPack, setIsLoadingSelectedPack] = useState(false);

  // Caché para packs
  const { data: packsData, isLoading: isLoadingPacks } = useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const res = await getPacks();
      sessionStorage.setItem('cached_packs', JSON.stringify(res.data));
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const packs = packsData || [];

  const openProductModal = async (pack) => {
    setIsModalOpen(true);
    setIsLoadingSelectedPack(true);
    setSelectedPack(pack);

    try {
      const response = await getPack(pack.id);
      setSelectedPack(response.data);
    } catch (error) {
      console.error("Error en carregar el detall del pack", error);
    } finally {
      setIsLoadingSelectedPack(false);
    }
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedPack(null);
    setIsLoadingSelectedPack(false);
  };

  return isLoadingPacks ? <LoadingAnimation /> : (
    <div className='products-page'>
      <div className="products-page__container">
        <div className="products-page__body">
          <div className="products-top">
            <div>
              <Link to="/" className="link link-hover text-primary mb-2 flex items-center gap-2 cursor-pointer" aria-label="Tornar a la pàgina d'inici">
                <HiArrowLeft className="size-5" aria-hidden="true" />
                <p>Tornar a l'inici</p>
              </Link>
              <p className="products-top__tag text-primary">Catàleg</p>
              <h1 id="packs-page-title" className="products-top__title">Packs</h1>
            </div>

            <div className="products-top__actions">
              <p className="products-top__count text-base-400">
                Mostrant {packs.length} packs
              </p>
            </div>
          </div>

          <div className="products-layout">
            <div>
              <div className="products-list">
                { packs.length > 0 ?
                  packs.map((pack) => (
                  <ProductCard key={pack.id} product={pack} onView={openProductModal} />
                  )) :
                <p className='products-empty'>Actualment no hi ha packs</p>}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de ver producto */}
      <ProductDetailModal 
        key={selectedPack?.id || 'no-product'}
        product={selectedPack} 
        isOpen={isModalOpen} 
        onClose={closeProductModal}
        entityType="pack"
        isLoading={isLoadingSelectedPack}
      />
    </div>
  )
}

export default Packs
