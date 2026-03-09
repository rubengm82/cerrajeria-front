import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategory } from '../../api/categories_api';
import CategoryForm from '../../components/CategoryForm';
import LoadingAnimation from '../../components/LoadingAnimation';

const EditCategory = () => {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCategory(id)
    .then(response => setCategory(response.data))
    .catch(error => {
      console.error(error);
      setCategory(null)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [id])

  return loading ? <LoadingAnimation/> : (
    <div className='flex flex-col items-center'>
      <CategoryForm initialData={category} submitText="Actualitzar categoria" title="Editar categoria" subtitle="Completa la informació per editar la categoria" backLink="/admin/categories"/>
    </div>
  )
};

export default EditCategory;
