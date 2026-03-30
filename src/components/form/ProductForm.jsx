import React, { useState, useEffect, useRef } from 'react';
import { getCategories } from '../../api/categories_api';
import { getFeatures } from '../../api/features_api';
import { createProduct, createProductImage, deleteProductImage, updateProduct, updateProductImage } from '../../api/products_api';
import { useNavigate, Link } from "react-router-dom";
import LoadingAnimation from '../LoadingAnimation';
import Notifications from '../Notifications';
import ConfirmableModal from '../ConfirmableModal';
import { HiArrowLeft, HiPhoto } from 'react-icons/hi2';
import MultiSelectFeatures from '../MultiSelectFeatures';

function ProductForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null)
  const [newImportantImage, setNewImportantImage] = useState(null)
  const [importantImageId, setImportantImageId] = useState(null)
  const [categories, setCategories] = useState([])
  const [availableFeatures, setAvailableFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        images: [],
        is_installable: !!initialData.is_installable,
        is_important_to_show: !!initialData.is_important_to_show,
        is_active: !!initialData.is_active,
        feature_ids: initialData.features ? initialData.features.map(f => f.id) : []
      }
    }
    return {
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
    }
  })

  /* Se obtiene el ID de la imagen destacada */
  useEffect(() => {
    if (initialData?.images?.length > 0) {
      const importantImage = initialData.images.find((image) => image.is_important == 1)
      if (importantImage) {
        setImportantImageId(importantImage.id)
      }
    }
  }, [initialData])

  useEffect(() => {
    const fetchData = async () => {
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



  const removeNewImage = (indexToRemove, image) => {
    if (newImportantImage == image) {
      console.log(image);
      setNewImportantImage(null)
    }
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
      // Si no hay imagen principal y se añaden nuevas imágenes, la primera será principal
      if (newImportantImage == null && importantImageId == null && newFiles.length > 0) {
        setNewImportantImage(newFiles[0])
      }
      event.target.value = null
    } else {
      setForm(current => ({
        ...current, [name]: type == 'checkbox' ? checked : value
      }))
    }
  }



  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    const { images, ...formWithoutImage } = form
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

      /* Si se suben nuevas imágenes y alguna se marca como principal, desmarcar las existentes */
      if (newImportantImage != null && initialData?.images?.length > 0) {
        for (const image of initialData.images) {
          await updateProductImage(image.id, { product_id: product.id, is_important: 0 })
        }
      }

      if (images.length > 0) {
        for (const image of images) {
            const formData = new FormData()
            formData.append('product_id', product.id)
            formData.append('image', image)
            formData.append('is_important', newImportantImage == image ? 1 : 0)
            await createProductImage(formData)
        }
      }

      /* Si alguna imagen existente se ha seleccionado como destacada */
      if (importantImageId != null) {
        // Primero desmarcar todas las imágenes existentes del producto
        if (initialData?.images?.length > 0) {
          for (const image of initialData.images) {
            await updateProductImage(image.id, { product_id: product.id, is_important: 0 })
          }
        }
        // Luego marcar la imagen seleccionada como principal
        await updateProductImage(importantImageId, { product_id: product.id, is_important: 1 })
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
            <HiArrowLeft className="size-5" />
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
            <input type="text" name="name" id='name' autoComplete="off" value={form.name} onChange={handleChange} placeholder="Nombre del producto" className="input w-full" required/>
          </div>
          {/* Codigo */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='code'>Código</label>
            <input type="text" name="code" id='code' autoComplete="off" value={form.code} onChange={handleChange} placeholder="Código del producto" className="input w-full"/>
          </div>
          {/* Descripcion */}
          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='description'>Descripción</label>
            <textarea name="description" id='description' autoComplete="off" value={form.description} onChange={handleChange} placeholder="Descripción del producto" className="textarea h-auto max-h-28 w-full"></textarea>
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
          
          <MultiSelectFeatures
            features={availableFeatures}
            selectedIds={form.feature_ids}
            onChange={(ids) => setForm(current => ({ ...current, feature_ids: ids }))}
            label="Selecciona las características del producto"
          />
        </div>

        {/* Precio y stock */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-3">Precio y stock</h3>
          {/* Precio */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='price'>Precio(€) *</label>
            <input type="number" name="price" id='price' autoComplete="off" value={form.price} onChange={handleChange} placeholder="0.00" className="input w-full" required step="0.01"/>
          </div>

          {/* Stock */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='stock'>Stock *</label>
            <input type="number" name="stock" id='stock' autoComplete="off" value={form.stock} onChange={handleChange} placeholder="0" className="input w-full" required/>
          </div>

          {/* Descuento */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='discount'>Descuento (%):</label>
            <input type="number" name="discount" id='discount' autoComplete="off" value={form.discount} onChange={handleChange} placeholder="0" className="input w-full"/>
          </div>
        </div>

        {/* Imagenes */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <div className="flex items-center justify-between md:col-span-3">
            <h3 className="text-[20px] font-semibold">Imágenes del producto</h3>
            <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-primary btn-sm gap-2">
              <HiPhoto className="size-5" />
              Añadir imagen
            </button>
          </div>
          <div className='md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-130 overflow-y-auto justify-items-center md:justify-items-start'>

            <input type="file" multiple name="images" id="images" accept="image/*" onChange={handleChange} ref={fileInputRef} className="hidden"/>

            {/* Se muestra la nueva imagen seleccionada */}
            {form.images.length > 0 && (
              form.images.map((image, index) => (
                <div key={index} onClick={(e) => { setNewImportantImage(image); setImportantImageId(null); e.stopPropagation()}} className="relative w-full max-w-60 aspect-square">
                  <img src={URL.createObjectURL(image)} alt={`Nueva imagen ${index}`} className="w-full h-full object-cover rounded-lg border border-base-300 transition-opacity cursor-pointer duration-300 hover:opacity-90" />

                  {/* Boton para eliminar las imagenes que aun no se han subido */}
                  <ConfirmableModal
                    title="Eliminar imagen"
                    message="¿Estás seguro de que quieres eliminar esta imagen?"
                    onConfirm={() => removeNewImage(index, image)}
                  >
                    <button type="button" className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 aspect-square flex items-center justify-center text-sm cursor-pointer">X</button>
                  </ConfirmableModal>
                  {newImportantImage === image && <span className='text-white text-sm cursor-pointer font-semibold px-2 py-1 bg-primary rounded-lg absolute bottom-2 left-2'>Principal</span> }
                </div>
              )))}

            {/* Se muestran las imagenes subidas del producto */}
            {initialData?.images?.length > 0 ?
              initialData.images.filter(image => !imagesToDelete.includes(image.id)).map((image, index) => (
                <div key={index} onClick={(e) => { setImportantImageId(image.id); setNewImportantImage(null); e.stopPropagation()}} className="relative w-full max-w-60 aspect-square">
                  <img src={`/storage/${image.path}`} className="w-full h-full object-cover rounded-lg border border-base-300 transition-opacity cursor-pointer duration-300 hover:opacity-90" alt="imagen"/>

                  {/* Boton para eliminar las imagenes subidas al servidor */}
                  <ConfirmableModal
                    title="Eliminar imagen"
                    message="¿Estás seguro de que quieres eliminar esta imagen?"
                    onConfirm={() => removeExistingImage(image.id)}
                  >
                    <span className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 aspect-square flex items-center justify-center text-sm cursor-pointer">X</span>
                  </ConfirmableModal>
                  {/* Para destacar una imagen */}
                  {(importantImageId === image.id ) && <span className='text-white text-sm cursor-pointer font-semibold px-2 py-1 bg-primary rounded-lg absolute bottom-2 left-2'>Principal</span> }
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
            <input type="number" name="installation_price" id='installation_price' autoComplete="off" value={form.installation_price} onChange={handleChange} placeholder="0.00" className="input w-full" step="0.01"/>
          </div>

          {/* Llaves extras */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='extra_keys'>Llaves extras(€)</label>
            <input type="number" name="extra_keys" id='extra_keys' autoComplete="off" value={form.extra_keys} onChange={handleChange} placeholder="0" className="input w-full" step="0.01"/>
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
