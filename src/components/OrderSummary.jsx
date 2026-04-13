import { HiOutlineArchiveBox, HiOutlineShieldCheck } from "react-icons/hi2"
import { Link } from "react-router-dom"
import { formatPrice } from "../utils/cartTotals"

function OrderSummary({
  subtotal = 0,
  shipping = 0,
  total = 0,
  itemCount = 0,
  actionTo,
  buttonLabel = "Tramitar comanda",
}) {
  const actionClassName = "btn btn-primary order-summary__button"

  return (
    <aside className="order-summary border-base-300 bg-base-100" aria-label="Resum de la comanda">
      <h2 className="order-summary__title">Resum de la comanda</h2>

      <div className="order-summary__lines">
        <div className="order-summary__line">
          <span>Subtotal ({itemCount} articles)</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>

        <div className="order-summary__line">
          <span>Enviament</span>
          <strong>{shipping > 0 ? formatPrice(shipping) : "Gratuït"}</strong>
        </div>
      </div>

      <div className="order-summary__total">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      {actionTo ? (
        <Link to={actionTo} className={actionClassName} aria-label={buttonLabel}>
          {buttonLabel}
        </Link>
      ) : (
        <button type="button" className={actionClassName} aria-label={buttonLabel}>
          {buttonLabel}
        </button>
      )}

      <div className="order-summary__benefits text-base-400">
        <p>
          <HiOutlineShieldCheck className="order-summary__benefit-icon text-primary" aria-hidden="true" />
          Pagament segur garantit
        </p>
        <p>
          <HiOutlineArchiveBox className="order-summary__benefit-icon text-primary" aria-hidden="true" />
          Productes de qualitat
        </p>
      </div>
    </aside>
  )
}

export default OrderSummary
