import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeatureTypeForm from '../../components/FeatureTypeForm';
import { getFeatureType } from '../../api/features_api';
import LoadingAnimation from '../../components/LoadingAnimation';

function EditFeatureType() {
  const { id } = useParams();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureType(id)
      .then(response => {
        setType(response.data);
      })
      .catch(error => {
        console.error("Error fetching feature type:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingAnimation />;

  return (
    <div className='flex justify-center'>
      <FeatureTypeForm initialData={type} submitText="Actualizar Tipo" title="Editar Tipo de Característica" subtitle="Modifica el nombre del grupo de características" backLink="/admin/feature-types"/>
    </div>
  );
}

export default EditFeatureType;
