import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getProducts } from '../api/products_api';
import { createPack, updatePack } from '../api/packs_api';
import { createPackImage, deletePackImage } from '../api/pack_images_api'; // Importamos la nueva API
import LoadingAnimation from './LoadingAnimation';
import Notifications from './Notifications';

function PackForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [form, setForm] = useState({
    name: "",
    total_price: "",
    description: "",
    product_ids: [],
    images: []
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        total_price: initialData.total_price || "",
        description: initialData.description || "",
        product_ids: initialData.products?.map(p => p.id) || [],
        images: []
      })
    }
  }, [initialData])

  useEffect(() => {
    setLoading(true)
    getProducts()
      .then(response => setProducts(response.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (event) => {
    const { name, value, type, files } = event.target
    if (type == "file") {
      const newFiles = Array.from(files)
      setForm(current => ({
        ...current, images: [...current.images, ...newFiles]
      }))
      event.target.value = null
    } else {
      setForm(current => ({
        ...current, [name]: value
      }))
    }
  }

  const removeNewImage = (indexToRemove) => {
    setForm(current => ({...current, images: current.images.filter((_, index) => index !== indexToRemove)}))
  }

  const removeExistingImage = (imageId) => {
    setImagesToDelete(current => [...current, imageId])
  }

  const handleProductToggle = (productId) => {
    setForm(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId]
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    const { images, ...payloadData } = form
    const payload = {
      ...payloadData,
      total_price: parseFloat(form.total_price) || 0,
    }

    try {
      let response;
      if (initialData && initialData.id) {
        response = await updatePack(initialData.id, payload)
      } else {
        response = await createPack(payload)
      }

      const pack = response.data

      // Subir nuevas imágenes
      if (images.length > 0) {
        for (const image of images) {
            const formData = new FormData()
            formData.append('pack_id', pack.id)
            formData.append('image', image)
            formData.append('is_important', 0)
            await createPackImage(formData)
        }
      }

      // Eliminar imágenes marcadas
      if (imagesToDelete.length > 0) {
        for(const imageId of imagesToDelete) {
          await deletePackImage(imageId)
        }
      }
      navigate("/admin/packs", {state: { notificationType: "success", notificationMessage: initialData && initialData.id ? "Pack actualizado correctamente" : "Pack creado correctamente" }
      })

    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status == 422) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  return loading ? <LoadingAnimation /> : (
    <div className="lg:w-[70%] lg:min-w-150 w-full pb-10">
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

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        {/* Información Básica */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-2">Información del Pack</h3>

          <div className="w-full">
            <label className="label text-base-content" htmlFor="name">Nombre del pack *</label>
            <input type="text" name="name" id='name' value={form.name} onChange={handleChange} placeholder="Nombre del pack" className="input w-full" required/>
          </div>

          <div className="w-full">
            <label className="label text-base-content" htmlFor='total_price'>Precio Total(€) *</label>
            <input type="number" name="total_price" id='total_price' value={form.total_price} onChange={handleChange} placeholder="0.00" className="input w-full" required step="0.01"/>
          </div>

          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='description'>Descripción</label>
            <textarea name="description" id='description' value={form.description} onChange={handleChange} placeholder="Descripción..." className="textarea h-auto max-h-28 w-full"></textarea>
          </div>
        </div>

        {/* Imágenes */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold md:col-span-3">Imágenes del pack</h3>
          <div className='md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center md:justify-items-start'>

            <input type="file" multiple name="images" id="images" accept="image/*" onChange={handleChange} ref={fileInputRef} className="hidden"/>
            <div className='w-full max-w-60 aspect-square bg-primary/10 rounded-lg border-2 border-dashed border-primary flex items-center justify-center cursor-pointer' onClick={() => fileInputRef.current.click()}>
                <div className='flex flex-col items-center gap-2 text-primary p-4 text-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p>Añadir imagen</p>
                </div>
            </div>

            {/* Nuevas imágenes */}
            {form.images.map((image, index) => (
              <div key={index} className="relative w-full max-w-60 aspect-square">
                <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-base-300" />
                <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">X</button>
              </div>
            ))}

            {/* Imágenes existentes */}
            {initialData?.images?.filter(img => !imagesToDelete.includes(img.id)).map((image) => (
              <div key={image.id} className="relative w-full max-w-60 aspect-square">
                <img src={`http://127.0.0.1:8000/storage/${image.path}`} alt="Existente" className="w-full h-full object-cover rounded-lg border border-base-300"/>
                <button type="button" onClick={() => removeExistingImage(image.id)} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">X</button>
              </div>
            ))}
          </div>
        </div>

        {/* Productos */}
        <div className='flex flex-col gap-4 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold">Productos incluidos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
            {products.map(product => (
              <div key={product.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${form.product_ids.includes(product.id) ? 'border-primary bg-primary/5' : 'border-base-300'}`} onClick={() => handleProductToggle(product.id)}>
                <input type="checkbox" checked={form.product_ids.includes(product.id)} className="checkbox checkbox-primary checkbox-sm" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                  <span className="text-xs text-base-content/50">{product.price}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex gap-2 justify-end'>
          <button type='button' onClick={() => navigate(-1)} className='btn btn-secondary'>Cancelar</button>
          <button type='submit' className='btn btn-primary'>{submitText}</button>
        </div>
      </form>

      {Object.keys(errors).length > 0 && <Notifications type={"error"} errors={errors} />}
    </div>
  );
};

export default PackForm;
