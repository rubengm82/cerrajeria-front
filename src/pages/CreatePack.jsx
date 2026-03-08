import PackForm from '../components/PackForm';

const CreatePack = () => {
  return (
    <div className='flex flex-col items-center'>
      <PackForm submitText="Crear pack" title="Crear pack" subtitle="Completa la informacion para crear un nuevo pack" backLink="/admin/packs"/>
    </div>
  )
};

export default CreatePack;
