import ProductForm from '../components/ProductForm';
import {Link} from "react-router-dom"

const CreateProduct = () => {

  return (
  <div className='flex flex-col items-center'>
    <div className='lg:w-[70%] lg:min-w-150 w-full mb-5'>
      <Link to='/admin/products' className='text-primary'>
        Volver atras
      </Link>
    </div>
    <ProductForm submitText={"Crear producto"} title={"Crear producto"} />
  </div>
  )
};

export default CreateProduct;
