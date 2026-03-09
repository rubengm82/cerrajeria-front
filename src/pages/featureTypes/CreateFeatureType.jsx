import React from 'react';
import FeatureTypeForm from '../../components/FeatureTypeForm';

function CreateFeatureType() {
  return (
    <div className='flex justify-center'>
      <FeatureTypeForm submitText="Crear Tipo" title="Nuevo Tipo de Característica" subtitle="Crea una categoría para agrupar características (Ej: Color, Material, etc.)" backLink="/admin/feature-types"/>
    </div>
  );
}

export default CreateFeatureType;
