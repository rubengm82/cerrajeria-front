import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { HiArrowLeft } from "react-icons/hi2"
import { useAuth } from "../../context/AuthContext"
import { getCartOrder } from "../../api/orders_api"
import CheckoutSteps from "../../components/CheckoutSteps"
import LoadingAnimation from "../../components/LoadingAnimation"
import OrderSummary from "../../components/OrderSummary"
import { getCartTotals } from "../../utils/cartTotals"
import "../../../scss/main_shop.scss"

function Checkout() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { data: cartOrder, isLoading, isError } = useQuery({
    queryKey: ["cart-order"],
    queryFn: async () => {
      const response = await getCartOrder()
      return response.data
    },
    enabled: Boolean(user),
    retry: 1,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/products", {
        replace: true,
        state: {
          notificationType: "error",
          notificationMessage: "Primer has d'iniciar sessió per tramitar la comanda.",
        },
      })
    }
  }, [authLoading, navigate, user])

  const products = cartOrder?.products || []
  const { itemCount, subtotal, shipping, total } = getCartTotals(products)
  const userDataDescriptionId = "checkout-user-data-description"

  const content = authLoading || !user || isLoading ? (
    <LoadingAnimation heightClass="h-32" />
  ) : isError ? (
    <div className="checkout-page__notice border-base-300 bg-base-100" role="alert">
      <h2>No hem pogut carregar la comanda</h2>
      <p className="text-base-400">Torna-ho a provar d'aquí a uns instants.</p>
    </div>
  ) : !cartOrder || products.length === 0 ? (
    <div className="checkout-page__notice border-base-300 bg-base-100">
      <h2>No hi ha productes per tramitar</h2>
      <p className="text-base-400">Afegeix productes al carret abans de continuar.</p>
      <Link to="/products" className="btn btn-primary">Veure productes</Link>
    </div>
  ) : (
    <>
      <CheckoutSteps activeStep={1} />

      <div className="checkout-page__layout">
        <section className="checkout-page__panel border-base-300 bg-base-100" aria-labelledby="checkout-user-data-title" aria-describedby={userDataDescriptionId}>
          <header className="checkout-page__panel-header">
            <h2 id="checkout-user-data-title">Dades personals</h2>
            <p id={userDataDescriptionId} className="text-base-400">Introdueix les teves dades per processar la comanda.</p>
          </header>
        </section>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          itemCount={itemCount}
          buttonLabel="Continuar amb el pagament"
          actionTo="/checkout/payment"
        />
      </div>
    </>
  )

  return (
    <section className="checkout-page" aria-label="Tramitar comanda">
      <div className="checkout-page__container">
        <Link to="/cart" className="checkout-page__back text-primary">
          <HiArrowLeft className="checkout-page__back-icon" aria-hidden="true" />
          Tornar al carret
        </Link>

        <header className="checkout-page__header">
          <h1>Tramitar comanda</h1>
        </header>

        {content}
      </div>
    </section>
  )
}

export default Checkout
