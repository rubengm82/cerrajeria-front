import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeatureForm from '../../components/form/FeatureForm';
import { getFeature } from '../../api/features_api';
import LoadingAnimation from '../../components/LoadingAnimation';

function EditFeature() {
  const { id } = useParams();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeature(id)
      .then(response => {
        setFeature(response.data);
      })
      .catch(error => {
        console.error("Error fetching feature:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingAnimation />;

  return (
    <div className='flex justify-center'>
      <FeatureForm initialData={feature} submitText="Actualitzar Caracteristica" title="Editar Caracteristica" subtitle="Modifica els detalls de la caracteristica" backLink="/admin/features"/>
    </div>
  );
}

export default EditFeature;
