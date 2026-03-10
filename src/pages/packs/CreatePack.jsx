import PackForm from '../../components/form/PackForm';

const CreatePack = () => {
  return (
    <div className='flex flex-col items-center'>
      <PackForm submitText="Crear pack" title="Crear pack" subtitle="Completa la informació per crear un nou pack" backLink="/admin/packs"/>
    </div>
  )
};

export default CreatePack;
