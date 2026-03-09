import React from 'react';
import FeatureForm from '../../components/FeatureForm';

function CreateFeature() {
  return (
    <div className='flex justify-center'>
      <FeatureForm submitText="Crear Característica" title="Nueva Característica" subtitle="Añade una nueva característica para tus productos (Ej: Color, Material, etc.)" backLink="/admin/features"/>
    </div>
  );
}

export default CreateFeature;
