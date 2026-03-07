import ProductForm from '../components/ProductForm';

const CreateProduct = () => {
  return (
    <div className='flex flex-col items-center'>
      <ProductForm submitText={"Crear producto"} title={"Crear producto"} subtitle={"Completa la informacion para crear un nuevo producto"} backLink={"/admin/products"}/>
    </div>
  )
};

export default CreateProduct;
