import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../api/products_api';
import ProductForm from '../../components/form/ProductForm';
import LoadingAnimation from '../../components/LoadingAnimation';
import Notifications from '../../components/Notifications';

const EditProduct = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProduct(id)
    .then(response => {
      const data = response.data;
      // Verificar si el elemento está eliminado (softdeleted)
      if (data.deleted_at) {
        setError("Aquest producte està eliminat. Restaura'l per poder editar-lo.");
        setProduct(null);
      } else {
        setProduct(data);
      }
    })
    .catch(error => {
      console.error(error);
      setError("Error en carregar el producte");
      setProduct(null)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [id])

  if (loading) return <LoadingAnimation/>;

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-8'>
        <Notifications type="error" message={error} />
        <button 
          onClick={() => navigate('/admin/products')} 
          className='btn btn-primary mt-4'
        >
          Tornar a la llista
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      <ProductForm initialData={product} submitText={"Actualitzar producte"} title={"Editar producte"} subtitle={"Completa la informació per editar el producte"} backLink={"/admin/products"}/>
    </div>
  )
};

export default EditProduct;
