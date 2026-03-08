import React, { useState, useEffect, useRef } from 'react';
import { createCategory, updateCategory } from '../api/categories_api';
import { useNavigate, Link } from "react-router-dom";
import LoadingAnimation from "./LoadingAnimation";
import Notifications from './Notifications';

function CategoryForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [existingImageRemoved, setExistingImageRemoved] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: "",
    image: null
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        image: null
      })
    }
  }, [initialData])


  // Se elimina la imagen de la que se presiona en su boton X o subir una nueva
  const removeNewImage = () => { setForm(current => ({...current, image: null}))}

  const removeExistingImage = () => { setExistingImageRemoved(true)}

  const handleChange = (event) => {
    const { name, value, type, files } = event.target
    if (type == "file") {
      const file = files[0] || null
      setForm(current => ({ ...current, image: file}))
      event.target.value = null

    } else {
      setForm(current => ({ ...current, [name]: value }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append("name", form.name)

      if (form.image) {
        formData.append("image", form.image)
      }

      // Dependiendo de si se actualiza o se crea ejecuta un metodo y notificacion u otro
      if (initialData && initialData.id) {
        // Se añade el metodo PUT para que se envie por PUT en lugar de POST y se puedan procesar las imagenes
        formData.append("_method", "PUT")
        await updateCategory(initialData.id, formData)
      } else {
        await createCategory(formData)
      }

      // Se redirecciona con una notificacion al index de productos
      navigate("/admin/categories", { state: { notificationType: "success", notificationMessage: initialData && initialData.id ? "Categoria actualizada correctamente" : "Categoria creada correctamente" }})

    } catch (error) {
      console.log("Error: " + error);
      if (error.response?.status == 422) {
        const errors = error.response.data.errors
        setErrors(errors)
      }
    }
    finally {
      setLoading(false)
    }
  }

  return loading ?
  <LoadingAnimation/>
  : (
    <div className="lg:w-[70%] lg:min-w-150 w-full">
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
      <form onSubmit={handleSubmit} className='flex flex-col justify-center gap-5'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-3">Información básica</h3>

          {/* Nombre */}
          <div className="w-full md:col-span-3">
            <label className="label text-base-content" htmlFor="name">Nombre de la categoria *</label>
            <input type="text" name="name" id='name' value={form.name} onChange={handleChange} placeholder="Nombre de la categoria" className="input w-full" required/>
          </div>

        {/* Imagenes */}
          <h3 className="text-[20px] font-semibold md:col-span-3">Imagenes del producto</h3>
          <div className='md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-130 overflow-y-auto justify-items-center md:justify-items-start'>

            {/* Se muestra un div para subir la imagen */}
            <input type="file" name="image" id="image" accept="image/*" onChange={handleChange} ref={fileInputRef} className="hidden"/>
            <div className='w-full max-w-60 aspect-square bg-primary/10 rounded-lg border-2 border-dashed border-primary flex items-center justify-center cursor-pointer' onClick={() => fileInputRef.current.click()}>
                <div className='flex flex-col items-center gap-2 text-primary p-4 text-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p>Añadir nueva imagen</p>
                </div>
            </div>

            {/* Se muestra la nueva imagen seleccionada */}
            {form.image && (
              <div className="relative w-full max-w-60 aspect-square">
                <img src={URL.createObjectURL(form.image)} alt='Nueva imagen' className="w-full h-full object-cover rounded-lg border border-base-300" />

                {/* Boton para eliminar las imagenes que aun no se han subido */}
                <button type="button" onClick={removeNewImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 aspect-square flex items-center justify-center text-sm cursor-pointer">X</button>
              </div>
            )}

            {/* Se muestran las imagenes subidas del producto */}
            {initialData?.image && !existingImageRemoved && !form.image &&
                <div className="relative w-full max-w-60 aspect-square">
                  <img src={`http://127.0.0.1:8000/storage/${initialData.image}`} className="w-full h-full object-cover rounded-lg border border-base-300"/>

                  {/* Boton para eliminar las imagenes subidas al servidor */}
                  <button type="button" onClick={removeExistingImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 aspect-square flex items-center justify-center text-sm cursor-pointer">X</button>
                </div>
              }
          </div>
        </div>

        {/* Boton de enviar y cancelar */}
        <div className='col-span-2 flex gap-2 justify-end'>
          <button type='button' onClick={() => navigate(-1)} className='btn btn-secondary'>Cancelar</button>
          <button type='submit' className='btn btn-primary'>{submitText}</button>
        </div>
      </form>

      {/* Se muestran los errores */}
      {Object.keys(errors).length > 0 && <Notifications type={"error"} errors={errors} />}
    </div>
  );
};

export default CategoryForm;
