import CategoryForm from '../../components/CategoryForm';

const CreateCategory = () => {
  return (
    <div className='flex flex-col items-center'>
      <CategoryForm submitText="Crear categoría" title="Crear categoría" subtitle="Completa la informacion para crear una nueva categoría" backLink="/admin/categories"/>
    </div>
  )
};

export default CreateCategory;
