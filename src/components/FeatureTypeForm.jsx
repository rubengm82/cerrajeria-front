import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { createFeatureType, updateFeatureType } from '../api/features_api';
import LoadingAnimation from './LoadingAnimation';
import Notifications from './Notifications';

function FeatureTypeForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        name: initialData.name || ""
      }
    }
    return {
      name: ""
    }
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      if (initialData && initialData.id) {
        await updateFeatureType(initialData.id, form)
      } else {
        await createFeatureType(form)
      }

      navigate("/admin/feature-types", {state: { notificationType: "success", notificationMessage: initialData && initialData.id ? "Tipo de característica actualizado correctamente" : "Tipo de característica creado correctamente" }})

    } catch (error) {
      if (error.response?.status == 422) {
        setErrors(error.response.data.errors)
      }
      setLoading(false)
    }
  }

  return loading ? <LoadingAnimation /> : (
    <div className="lg:w-[50%] lg:min-w-120 w-full">
      <div className="mb-5">
        {backLink && (
          <Link to={backLink} className='text-primary mb-2 flex items-center gap-2 cursor-pointer'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <p>Volver atrás</p>
          </Link>
        )}
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {subtitle && <p className="text-md mt-1 text-base-content/60">{subtitle}</p>}
      </div>

      <form className='flex flex-col gap-5 p-6 bg-base-100 rounded-lg shadow-md border border-base-300' onSubmit={handleSubmit}>
        <div className="w-full">
          <label className="label text-base-content" htmlFor="name">Nombre del Tipo *</label>
          <input type="text" name="name" id='name' value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ej: Material, Color, Grosor, etc." className="input input-bordered w-full" required/>
        </div>

        <div className='flex gap-2 justify-end mt-4'>
          <button type='button' onClick={() => navigate(-1)} className='btn btn-ghost'>Cancelar</button>
          <button type='submit' className='btn btn-primary'>{submitText}</button>
        </div>
      </form>

      {Object.keys(errors).length > 0 && <Notifications type={"error"} errors={errors} />}
    </div>
  );
};

export default FeatureTypeForm;
