function CheckoutStepsSkeleton() {
  return (
    <div className="checkout-page__steps checkout-page__steps--skeleton" aria-hidden="true">
      <div className="checkout-skeleton__steps">
        {[1, 2, 3].map((step) => (
          <div key={step} className="checkout-skeleton__step">
            <div className="skeleton checkout-skeleton__step-circle"></div>
            <div className="skeleton checkout-skeleton__step-line"></div>
            <div className="skeleton checkout-skeleton__step-subline"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckoutSummarySkeleton() {
  return (
    <aside className="checkout-skeleton__summary border-base-300 bg-base-100" aria-hidden="true">
      <div className="skeleton checkout-skeleton__line checkout-skeleton__line--title"></div>

      <div className="checkout-skeleton__summary-lines">
        {[1, 2, 3].map((line) => (
          <div key={line} className="checkout-skeleton__summary-row">
            <div className="skeleton checkout-skeleton__line"></div>
            <div className="skeleton checkout-skeleton__line checkout-skeleton__line--value"></div>
          </div>
        ))}
      </div>

      <div className="checkout-skeleton__summary-row checkout-skeleton__summary-row--total">
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--total-label"></div>
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--total-value"></div>
      </div>

      <div className="skeleton checkout-skeleton__button"></div>
    </aside>
  )
}

function CheckoutFormSkeleton() {
  return (
    <div className="checkout-skeleton__panel border-base-300 bg-base-100" aria-hidden="true">
      <div className="checkout-skeleton__header">
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--heading"></div>
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--subheading"></div>
      </div>

      <div className="checkout-skeleton__grid">
        {[1, 2, 3, 4, 5, 6].map((field) => (
          <div key={field} className="checkout-skeleton__field">
            <div className="skeleton checkout-skeleton__line checkout-skeleton__line--label"></div>
            <div className="skeleton checkout-skeleton__input"></div>
          </div>
        ))}
        <div className="checkout-skeleton__field checkout-skeleton__field--wide">
          <div className="skeleton checkout-skeleton__line checkout-skeleton__line--section"></div>
        </div>
        <div className="checkout-skeleton__field checkout-skeleton__field--wide">
          <div className="skeleton checkout-skeleton__line checkout-skeleton__line--label"></div>
          <div className="skeleton checkout-skeleton__input"></div>
        </div>
        {[1, 2, 3, 4].map((field) => (
          <div key={`shipping-${field}`} className="checkout-skeleton__field">
            <div className="skeleton checkout-skeleton__line checkout-skeleton__line--label"></div>
            <div className="skeleton checkout-skeleton__input"></div>
          </div>
        ))}
        {[1, 2].map((toggle) => (
          <div key={`toggle-${toggle}`} className="checkout-skeleton__field checkout-skeleton__field--wide checkout-skeleton__toggle">
            <div>
              <div className="skeleton checkout-skeleton__line checkout-skeleton__line--toggle"></div>
              <div className="skeleton checkout-skeleton__line checkout-skeleton__line--toggle-sub"></div>
            </div>
            <div className="skeleton checkout-skeleton__toggle-control"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckoutPaymentSkeleton() {
  return (
    <div className="checkout-skeleton__panel border-base-300 bg-base-100" aria-hidden="true">
      <div className="checkout-skeleton__header">
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--heading"></div>
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--subheading"></div>
      </div>

      <div className="checkout-skeleton__stack">
        {[1, 2, 3].map((option) => (
          <div key={option} className="checkout-skeleton__payment-option">
            <div className="checkout-skeleton__payment-choice">
              <div className="skeleton checkout-skeleton__radio"></div>
              <div className="skeleton checkout-skeleton__line checkout-skeleton__line--payment"></div>
            </div>
            <div className="skeleton checkout-skeleton__line checkout-skeleton__line--payment-brand"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckoutReviewSkeleton() {
  return (
    <div className="checkout-skeleton__panel border-base-300 bg-base-100" aria-hidden="true">
      <div className="checkout-skeleton__header">
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--heading"></div>
        <div className="skeleton checkout-skeleton__line checkout-skeleton__line--subheading"></div>
      </div>

      <div className="checkout-skeleton__review">
        {[1, 2, 3].map((section) => (
          <div key={section} className="checkout-skeleton__review-section">
            <div className="skeleton checkout-skeleton__line checkout-skeleton__line--section"></div>
            <div className="checkout-skeleton__details">
              {[1, 2].map((item) => (
                <div key={item} className="checkout-skeleton__detail">
                  <div className="skeleton checkout-skeleton__line checkout-skeleton__line--label"></div>
                  <div className="skeleton checkout-skeleton__line"></div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="checkout-skeleton__review-section">
          <div className="skeleton checkout-skeleton__line checkout-skeleton__line--section"></div>
          <div className="checkout-skeleton__products">
            {[1, 2].map((product) => (
              <div key={product} className="checkout-skeleton__product">
                <div className="skeleton checkout-skeleton__product-image"></div>
                <div className="checkout-skeleton__product-copy">
                  <div className="skeleton checkout-skeleton__line checkout-skeleton__line--label"></div>
                  <div className="skeleton checkout-skeleton__line checkout-skeleton__line--product"></div>
                  <div className="skeleton checkout-skeleton__line checkout-skeleton__line--short"></div>
                </div>
                <div className="skeleton checkout-skeleton__line checkout-skeleton__line--value"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckoutSkeleton({ step = 1 }) {
  return (
    <>
      <CheckoutStepsSkeleton />
      <div className="checkout-page__layout">
        {step === 1 && <CheckoutFormSkeleton />}
        {step === 2 && <CheckoutPaymentSkeleton />}
        {step === 3 && <CheckoutReviewSkeleton />}
        <CheckoutSummarySkeleton />
      </div>
    </>
  )
}

export default CheckoutSkeleton
