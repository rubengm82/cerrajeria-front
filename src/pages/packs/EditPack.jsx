import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom';
import { getPack } from '../../api/packs_api';
import PackForm from '../../components/PackForm';
import LoadingAnimation from '../../components/LoadingAnimation';

const EditPack = () => {
  const {id} = useParams()
  const [pack, setPack] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPack(id)
    .then(response => setPack(response.data))
    .catch(error => {
      console.error(error);
      setPack(null)
    })
    .finally(() => {
      setLoading(false)
    })
  }, [id])

  return loading ? <LoadingAnimation/> : (
    <div className='flex flex-col items-center'>
      <PackForm initialData={pack} submitText={"Actualitzar pack"} title={"Editar pack"} subtitle={"Completa la informació per editar el pack"} backLink={"/admin/packs"}/>
    </div>
  )
};

export default EditPack;
