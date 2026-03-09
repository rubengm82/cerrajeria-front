import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import { getProduct } from '../../api/products_api';
import ProductForm from '../../components/ProductForm';
import LoadingAnimation from '../../components/LoadingAnimation';

const EditProduct = () => {
  const {id} = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProduct(id)
    .then(response => setProduct(response.data))
    .catch(error => {
      console.error(error);
      setProduct(null)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [id])

  return loading ? <LoadingAnimation/> : (
    <div className='flex flex-col items-center'>
      <ProductForm initialData={product} submitText={"Actualitzar producte"} title={"Editar producte"} subtitle={"Completa la informació per editar el producte"} backLink={"/admin/products"}/>
    </div>
  )
};

export default EditProduct;
