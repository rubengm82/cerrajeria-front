import FaqForm from '../../components/form/FaqForm';

const CreateFaq = () => {
  return (
    <div className='flex flex-col items-center'>
      <FaqForm
        submitText="Crear pregunta"
        title="Crear pregunta freqüent"
        subtitle="Completa la informació per crear una nova pregunta freqüent"
        backLink="/admin/faqs"
      />
    </div>
  )
};

export default CreateFaq;
