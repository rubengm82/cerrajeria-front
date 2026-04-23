import { useEffect, useState } from 'react'
import { getFaqs } from '../../api/faq_api'
import LoadingAnimation from '../../components/LoadingAnimation'

function FAQs() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openFaqId, setOpenFaqId] = useState(null)

  useEffect(() => {
    getFaqs()
      .then(response => {
        setFaqs(response.data)
        // Open the first FAQ by default if there are any
        if (response.data && response.data.length > 0) {
          setOpenFaqId(response.data[0].id)
        }
      })
      .catch(err => {
        console.error('Error fetching FAQs:', err)
        setFaqs([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAccordionChange = (id) => {
    setOpenFaqId(openFaqId === id ? null : id)
  }

  if (loading) {
    return <LoadingAnimation />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-base-content mb-8">
        Preguntes Freqüents
      </h1>

      {faqs.length > 0 ? (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="collapse collapse-arrow bg-base-100 border border-base-300"
            >
              <input
                type="radio"
                name="faq-accordion"
                checked={openFaqId === faq.id}
                onChange={() => handleAccordionChange(faq.id)}
              />
              <div className="collapse-title font-semibold text-base-content">
                {faq.question}
              </div>
              <div className="collapse-content text-sm text-base-content">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-base-content/60">
            No hi ha preguntes freqüents disponibles en aquest moment.
          </p>
        </div>
      )}
    </div>
  )
}

export default FAQs
