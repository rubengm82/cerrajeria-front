import ProductForm from '../../components/form/ProductForm';

const CreateProduct = () => {
  return (
    <div className='flex flex-col items-center'>
      <ProductForm submitText={"Crear producte"} title={"Crear producte"} subtitle={"Completa la informació per crear un nou producte"} backLink={"/admin/products"}/>
    </div>
  )
};

export default CreateProduct;
