import React from 'react';
import FeatureForm from '../../components/form/FeatureForm';

function CreateFeature() {
  return (
    <div className='flex justify-center'>
      <FeatureForm submitText="Crear Caracteristica" title="Nova Caracteristica" subtitle="Afegeix una nova caracteristica per als teus productes (Ex: Color, Material, etc.)" backLink="/admin/features"/>
    </div>
  );
}

export default CreateFeature;
