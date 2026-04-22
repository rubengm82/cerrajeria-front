import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFaq } from '../../api/faq_api';
import FaqForm from '../../components/form/FaqForm';
import LoadingAnimation from '../../components/LoadingAnimation';

const EditFaq = () => {
  const { id } = useParams()
  const [faq, setFaq] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFaq(id)
      .then(response => setFaq(response.data))
      .catch(error => {
        console.error(error);
        setFaq(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  return loading ? <LoadingAnimation/> : (
    <div className='flex flex-col items-center'>
      <FaqForm
        initialData={faq}
        submitText="Actualitzar pregunta"
        title="Editar pregunta freqüent"
        subtitle="Completa la informació per editar la pregunta freqüent"
        backLink="/admin/faqs"
      />
    </div>
  )
};

export default EditFaq;
