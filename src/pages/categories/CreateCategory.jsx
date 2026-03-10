import CategoryForm from '../../components/form/CategoryForm';

const CreateCategory = () => {
  return (
    <div className='flex flex-col items-center'>
      <CategoryForm submitText="Crear categoria" title="Crear categoria" subtitle="Completa la informació per crear una nova categoria" backLink="/admin/categories"/>
    </div>
  )
};

export default CreateCategory;
