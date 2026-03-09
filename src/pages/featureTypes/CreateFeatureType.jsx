import React from 'react';
import FeatureTypeForm from '../../components/FeatureTypeForm';

function CreateFeatureType() {
  return (
    <div className='flex justify-center'>
      <FeatureTypeForm submitText="Crear Tipus" title="Nou Tipus de Caracteristica" subtitle="Crea una categoria per agrupar caracteristiques (Ex: Color, Material, etc.)" backLink="/admin/feature-types"/>
    </div>
  );
}

export default CreateFeatureType;
