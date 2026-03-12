import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeatureForm from '../../components/form/FeatureForm';
import { getFeature } from '../../api/features_api';
import LoadingAnimation from '../../components/LoadingAnimation';
import Notifications from '../../components/Notifications';

function EditFeature() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFeature(id)
      .then(response => {
        const data = response.data;
        // Verificar si el elemento está eliminado (softdeleted)
        if (data.deleted_at) {
          setError("Aquesta característica està eliminada. Restaura-la per poder editar-la.");
          setFeature(null);
        } else {
          setFeature(data);
        }
      })
      .catch(error => {
        console.error("Error fetching feature:", error);
        setError("Error en carregar la característica");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingAnimation />;

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center p-8'>
        <Notifications type="error" message={error} />
        <button 
          onClick={() => navigate('/admin/features')} 
          className='btn btn-primary mt-4'
        >
          Tornar a la llista
        </button>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      <FeatureForm initialData={feature} submitText="Actualitzar Caracteristica" title="Editar Caracteristica" subtitle="Modifica els detalls de la caracteristica" backLink="/admin/features"/>
    </div>
  );
}

export default EditFeature;
