import React, { useState, useEffect, useRef } from 'react';
import { getCategories } from '../api/categories_api';
import { getFeatures } from '../api/features_api';
import { createProduct, createProductImage, deleteProductImage, updateProduct } from "../api/products_api";
import { useNavigate, Link } from "react-router-dom";
import LoadingAnimation from "./LoadingAnimation";
import Notifications from './Notifications';

function ProductForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [availableFeatures, setAvailableFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    code: "",
    discount: 0,
    category_id: "",
    is_installable: false,
    is_important_to_show: false,
    images: [],
    installation_price: 0,
    extra_keys: 0,
    is_active: true,
    feature_ids: []
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        images: [],
        is_installable: !!initialData.is_installable,
        is_important_to_show: !!initialData.is_important_to_show,
        is_active: !!initialData.is_active,
        feature_ids: initialData.features ? initialData.features.map(f => f.id) : []
      })
    }
  }, [initialData])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [categoriesRes, featuresRes] = await Promise.all([
          getCategories(),
          getFeatures()
        ])
        setCategories(categoriesRes.data)
        setAvailableFeatures(featuresRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Agrupar características por tipo
  const groupedFeatures = availableFeatures.reduce((acc, feature) => {
    const typeName = feature.type?.name || "Sin tipo";
    if (!acc[typeName]) acc[typeName] = [];
    acc[typeName].push(feature);
    return acc;
  }, {});

  const removeNewImage = (indexToRemove) => {
    setForm(current => ({...current, images: current.images.filter((_, index) => index != indexToRemove)}))
  }
  const removeExistingImage = (imageId) => {
    setImagesToDelete(current => [...current, imageId])
  }

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target
    if (type == "file") {
      const newFiles = Array.from(files)
      setForm(current => ({
        ...current, images: [...current.images, ...newFiles]
      }))
      event.target.value = null
    } else {
      setForm(current => ({
        ...current, [name]: type == 'checkbox' ? checked : value
      }))
    }
  }

  const handleFeatureChange = (featureId) => {
    setForm(current => {
      const ids = [...current.feature_ids];
      if (ids.includes(featureId)) {
        return { ...current, feature_ids: ids.filter(id => id !== featureId) };
      } else {
        return { ...current, feature_ids: [...ids, featureId] };
      }
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    const { images, features, ...formWithoutImage } = form
    const payload = {
      ...formWithoutImage,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      discount: parseInt(form.discount) || 0,
      installation_price: parseFloat(form.installation_price) || 0,
      extra_keys: parseInt(form.extra_keys) || 0,
      category_id: parseInt(form.category_id),
      is_installable: form.is_installable ? 1 : 0,
      is_important_to_show: form.is_important_to_show ? 1 : 0,
      is_active: form.is_active ? 1 : 0,
      feature_ids: form.feature_ids
    }

    try {
      let response = null
      if (initialData && initialData.id) {
        response = await updateProduct(initialData.id, payload)
      } else {
        response = await createProduct(payload)
      }
      const product = response.data

      if (images.length > 0) {
        for (const image of images) {
            const formData = new FormData()
            formData.append('product_id', product.id)
            formData.append('image', image)
            formData.append('is_important', 0)
            await createProductImage(formData)
        }
      }

      if (imagesToDelete.length > 0) {
        for(const imageId of imagesToDelete) {
          await deleteProductImage(imageId)
        }
      }

      navigate("/admin/products", { state: { notificationType: "success", notificationMessage: initialData && initialData.id ? "Producto actualizado correctamente" : "Producto creado correctamente" }})

    } catch (error) {
      if (error.response?.status == 422) {
        setErrors(error.response.data.errors)
      }
    } finally {
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
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-2">Información básica</h3>
          {/* Nombre */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor="name">Nombre del producto *</label>
            <input type="text" name="name" id='name' value={form.name} onChange={handleChange} placeholder="Nombre del producto" className="input w-full" required/>
          </div>
          {/* Codigo */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='code'>Código *</label>
            <input type="text" name="code" id='code' value={form.code} onChange={handleChange} placeholder="Código del producto" className="input w-full" required/>
          </div>
          {/* Descripcion */}
          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='description'>Descripción</label>
            <textarea name="description" id='description' value={form.description} onChange={handleChange} placeholder="Descripción del producto" className="textarea h-auto max-h-28 w-full"></textarea>
          </div>
          {/* Categoria */}
          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='category_id'>Categoría *</label>
            <select name="category_id" id="category_id" value={form.category_id} onChange={handleChange} className='select w-full' required>
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Características */}
        <div className='grid grid-cols-1 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold">Características del producto</h3>
          <p className='text-sm text-base-content/60 -mt-4'>Selecciona las opciones que definen a este producto.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.keys(groupedFeatures).length > 0 ? Object.entries(groupedFeatures).map(([typeName, features]) => (
              <div key={typeName} className="flex flex-col gap-2">
                <h4 className="font-bold text-primary border-b border-primary/20 pb-1 mb-2">{typeName}</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {features.map(feature => (
                    <label key={feature.id} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={form.feature_ids.includes(feature.id)} onChange={() => handleFeatureChange(feature.id)}/>
                      <span className="text-sm">{feature.value}</span>
                    </label>
                  ))}
                </div>
              </div>
            )) : (
              <p className="col-span-2 text-center py-4 text-md rounded">
                No hay características disponibles. <Link to="/admin/features/new" className="text-primary underline">Crear una</Link>
              </p>
            )}
          </div>
        </div>

        {/* Precio y stock */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-3">Precio y stock</h3>
          {/* Precio */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='price'>Precio(€) *</label>
            <input type="number" name="price" id='price' value={form.price} onChange={handleChange} placeholder="0.00" className="input w-full" required step="0.01"/>
          </div>

          {/* Stock */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='stock'>Stock *</label>
            <input type="number" name="stock" id='stock' value={form.stock} onChange={handleChange} placeholder="0" className="input w-full" required/>
          </div>

          {/* Descuento */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='discount'>Descuento (%):</label>
            <input type="number" name="discount" id='discount' value={form.discount} onChange={handleChange} placeholder="0" className="input w-full"/>
          </div>
        </div>

        {/* Imagenes */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold md:col-span-3">Imagenes del producto</h3>
          <div className='md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-130 overflow-y-auto justify-items-center md:justify-items-start'>

            {/* Se muestra un div para subir la imagen */}
            <input type="file" multiple name="images" id="images" accept="image/*" onChange={handleChange} ref={fileInputRef} className="hidden"/>
            <div className='w-full max-w-60 aspect-square bg-primary/10 rounded-lg border-2 border-dashed border-primary flex items-center justify-center cursor-pointer' onClick={() => fileInputRef.current.click()}>
                <div className='flex flex-col items-center gap-2 text-primary p-4 text-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p>Añadir nueva imagen</p>
                </div>
            </div>

            {/* Se muestra la nueva imagen seleccionada */}
            {form.images.length > 0 && (
              form.images.map((image, index) => (
                <div key={index} className="relative w-full max-w-60 aspect-square">
                  <img key={index} src={URL.createObjectURL(image)} alt={`Nueva imagen ${index}`} className="w-full h-full object-cover rounded-lg border border-base-300" />

                  {/* Boton para eliminar las imagenes que aun no se han subido */}
                  <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 aspect-square flex items-center justify-center text-sm cursor-pointer">X</button>
                </div>
              )))}

            {/* Se muestran las imagenes subidas del producto */}
            {initialData?.images?.length > 0 ?
              initialData.images.filter(image => !imagesToDelete.includes(image.id)).map((image, index) => (
                <div key={index} className="relative w-full max-w-60 aspect-square">
                  <img key={image.id} src={`http://127.0.0.1:8000/storage/${image.path}`} className="w-full h-full object-cover rounded-lg border border-base-300" alt="imagen"/>

                  {/* Boton para eliminar las imagenes subidas al servidor */}
                  <button type="button" onClick={() => removeExistingImage(image.id)} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 aspect-square flex items-center justify-center text-sm cursor-pointer">X</button>
                </div>
              ))
            : ""}
          </div>
        </div>

        {/* Instalacion y extras */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-2">Instalación y extras</h3>

          {/* Es instalable */}
          <div className="flex items-center justify-between col-span-1 md:col-span-2 w-full border border-base-300 p-3 rounded-lg">
            <div>
              <label className="label text-base-content" htmlFor='is_installable'>Es instalable</label>
              <p className='text-sm font-semibold text-base-content/55'>El producto puede ser instalado</p>
            </div>
            <input id='is_installable' name='is_installable' type="checkbox" checked={!!form.is_installable} onChange={handleChange} className="toggle checked:border-primary checked:bg-primary checked:text-primary-content transition-all"/>
          </div>

          {/* Precio instalación */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='installation_price'>Precio instalación(€)</label>
            <input type="number" name="installation_price" id='installation_price' value={form.installation_price} onChange={handleChange} placeholder="0.00" className="input w-full" step="0.01"/>
          </div>

          {/* Llaves extras */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='extra_keys'>Llaves extras(€)</label>
            <input type="number" name="extra_keys" id='extra_keys' value={form.extra_keys} onChange={handleChange} placeholder="0" className="input w-full" step="0.01"/>
          </div>
        </div>

        {/* Estado y visibilidad */}
        <div className='grid grid-cols-1 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold">Estado y visibilidad</h3>

          {/* Producto activo */}
          <div className="flex items-center justify-between w-full border border-base-300 p-3 rounded-lg">
            <div>
              <label className="label text-base-content" htmlFor='is_active'>Producto activo</label>
              <p className='text-sm font-semibold text-base-content/55'>El producto está visible y disponible para la venta</p>
            </div>
            <input id='is_active' name='is_active' type="checkbox" checked={!!form.is_active} onChange={handleChange} className="toggle checked:border-primary checked:bg-primary checked:text-primary-content transition-all"/>
          </div>
          {/* Producto destacado */}
          <div className="flex items-center justify-between w-full border border-base-300 p-3 rounded-lg">
            <div>
              <label className="label text-base-content" htmlFor='is_important_to_show'>Producto destacado</label>
              <p className='text-sm font-semibold text-base-content/55'>Aparecerá en la sección de productos destacados</p>
            </div>
            <input id='is_important_to_show' name='is_important_to_show' type="checkbox" checked={!!form.is_important_to_show} onChange={handleChange} className="toggle checked:border-primary checked:bg-primary checked:text-primary-content transition-all"/>
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

export default ProductForm;
