import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPack } from '../../api/packs_api';
import PackForm from '../../components/form/PackForm';
import LoadingAnimation from '../../components/LoadingAnimation';
import Notifications from '../../components/Notifications';

const EditPack = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [pack, setPack] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPack(id)
    .then(response => {
      const data = response.data;
      // Verificar si el elemento está eliminado (softdeleted)
      if (data.deleted_at) {
        setError("Aquest pack està eliminat. Restaura'l per poder editar-lo.");
        setPack(null);
      } else {
        setPack(data);
      }
    })
    .catch(error => {
      console.error(error);
      setError("Error en carregar el pack");
      setPack(null)
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
          onClick={() => navigate('/admin/packs')} 
          className='btn btn-primary mt-4'
        >
          Tornar a la llista
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      <PackForm initialData={pack} submitText={"Actualitzar pack"} title={"Editar pack"} subtitle={"Completa la informació per editar el pack"} backLink={"/admin/packs"}/>
    </div>
  )
};

export default EditPack;
