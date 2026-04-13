const checkoutSteps = [
  {
    number: 1,
    label: "Adreça",
    description: "Dades personals i enviament",
  },
  {
    number: 2,
    label: "Pagament",
    description: "Afegir mètode de pagament",
  },
  {
    number: 3,
    label: "Resum",
    description: "Confirmar comanda",
  },
]

function CheckoutSteps({ activeStep = 1 }) {
  const descriptionId = `checkout-steps-description-${activeStep}`
  const currentStep = checkoutSteps.find((step) => step.number === activeStep)

  return (
    <nav className={`checkout-page__steps checkout-page__steps--active-${activeStep}`} aria-label="Passos per comprar" aria-describedby={descriptionId}>
      <p id={descriptionId} className="checkout-page__sr-only">
        Ara ets al pas de {currentStep?.label.toLowerCase() || "la comanda"}.
      </p>

      <ul className="steps steps-horizontal">
        {checkoutSteps.map((step) => (
          <li
            key={step.number}
            className={`step checkout-page__step${step.number <= activeStep ? " step-primary" : ""}`}
            data-content={step.number}
            aria-current={step.number === activeStep ? "step" : undefined}
          >
            <span>{step.label}</span>
            <small>{step.description}</small>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default CheckoutSteps
