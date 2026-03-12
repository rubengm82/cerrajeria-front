import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeatureTypeForm from '../../components/form/FeatureTypeForm';
import { getFeatureType } from '../../api/features_api';
import LoadingAnimation from '../../components/LoadingAnimation';
import Notifications from '../../components/Notifications';

function EditFeatureType() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFeatureType(id)
      .then(response => {
        const data = response.data;
        // Verificar si el elemento está eliminado (softdeleted)
        if (data.deleted_at) {
          setError("Aquest tipus de característica està eliminat. Restaura'l per poder editar-lo.");
          setType(null);
        } else {
          setType(data);
        }
      })
      .catch(error => {
        console.error("Error fetching feature type:", error);
        setError("Error en carregar el tipus de característica");
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
          onClick={() => navigate('/admin/feature-types')} 
          className='btn btn-primary mt-4'
        >
          Tornar a la llista
        </button>
      </div>
    );
  }

  return (
    <div className='flex justify-center'>
      <FeatureTypeForm initialData={type} submitText="Actualitzar Tipus" title="Editar Tipus de Caracteristica" subtitle="Modifica el nom del grup de caracteristiques" backLink="/admin/feature-types"/>
    </div>
  );
}

export default EditFeatureType;
