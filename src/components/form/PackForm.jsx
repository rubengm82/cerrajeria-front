import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getProductsWithTrashed } from '../../api/products_api';
import { createPack, updatePack } from '../../api/packs_api';
import { createPackImage, deletePackImage, updatePackImage } from '../../api/pack_images_api';
import LoadingAnimation from '../LoadingAnimation';
import Notifications from '../Notifications';
import ConfirmableModal from '../ConfirmableModal';
import { HiArrowLeft, HiPhoto } from 'react-icons/hi2';

function PackForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [newImportantImage, setNewImportantImage] = useState(null)
  const [importantImageId, setImportantImageId] = useState(() => {
    if (initialData?.images?.length > 0) {
      const importantImage = initialData.images.find((image) => image.is_important == 1)
      return importantImage ? importantImage.id : null
    }
    return null
  })
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        total_price: initialData.total_price || "",
        description: initialData.description || "",
        product_ids: initialData.products?.map(p => p.id) || [],
        images: []
      }
    }
    return {
      name: "",
      total_price: "",
      description: "",
      product_ids: [],
      images: []
    }
  })

  useEffect(() => {
    getProductsWithTrashed()
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
      // Si no hay imagen principal y se añaden nuevas imágenes, la primera será principal
      if (newImportantImage == null && importantImageId == null && newFiles.length > 0) {
        setNewImportantImage(newFiles[0])
      }
      event.target.value = null
    } else {
      setForm(current => ({
        ...current, [name]: value
      }))
    }
  }

  const removeNewImage = (indexToRemove, image) => {
    if (newImportantImage == image) {
      setNewImportantImage(null)
    }
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

      /* Si se suben nuevas imágenes y alguna se marca como principal, desmarcar las existentes */
      if (newImportantImage != null && initialData?.images?.length > 0) {
        for (const image of initialData.images) {
          await updatePackImage(image.id, { pack_id: pack.id, is_important: 0 })
        }
      }

      // Subir nuevas imágenes
      if (images.length > 0) {
        for (const image of images) {
            const formData = new FormData()
            formData.append('pack_id', pack.id)
            formData.append('image', image)
            formData.append('is_important', newImportantImage == image ? 1 : 0)
            await createPackImage(formData)
        }
      }

      /* Si alguna imagen existente se ha seleccionado como destacada */
      if (importantImageId != null) {
        // Primero desmarcar todas las imágenes existentes del pack
        if (initialData?.images?.length > 0) {
          for (const image of initialData.images) {
            await updatePackImage(image.id, { pack_id: pack.id, is_important: 0 })
          }
        }
        // Luego marcar la imagen seleccionada como principal
        await updatePackImage(importantImageId, { pack_id: pack.id, is_important: 1 })
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
      setLoading(false)
    }
  }

  return loading ? <LoadingAnimation /> : (
    <div className="lg:w-[70%] lg:min-w-150 w-full pb-10">
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

      <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
        {/* Información Básica */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-2">Información del Pack</h3>

          <div className="w-full">
            <label className="label text-base-content" htmlFor="name">Nombre del pack *</label>
            <input type="text" name="name" id='name' autoComplete="off" value={form.name} onChange={handleChange} placeholder="Nombre del pack" className="input w-full" required/>
          </div>

          <div className="w-full">
            <label className="label text-base-content" htmlFor='total_price'>Precio Total(€) *</label>
            <input type="number" name="total_price" id='total_price' autoComplete="off" value={form.total_price} onChange={handleChange} placeholder="0.00" className="input w-full" required step="0.01"/>          </div>

          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='description'>Descripción</label>
            <textarea name="description" id='description' autoComplete="off" value={form.description} onChange={handleChange} placeholder="Descripción..." className="textarea h-auto max-h-28 w-full"></textarea>
          </div>
        </div>

        {/* Imágenes */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <div className="flex items-center justify-between md:col-span-3">
            <h3 className="text-[20px] font-semibold">Imágenes del pack</h3>
            <button type="button" onClick={() => fileInputRef.current.click()} className="btn btn-primary btn-sm gap-2">
              <HiPhoto className="size-5" />
              Añadir imagen
            </button>
          </div>
          <div className='md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center md:justify-items-start'>

            <input type="file" multiple name="images" id="images" accept="image/*" onChange={handleChange} ref={fileInputRef} className="hidden"/>

            {/* Nuevas imágenes */}
            {form.images.map((image, index) => (
              <div key={index} onClick={(e) => { setNewImportantImage(image); setImportantImageId(null); e.stopPropagation()}} className="relative w-full max-w-60 aspect-square cursor-pointer">
                <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-base-300 transition-opacity duration-300 hover:opacity-90" />
                <ConfirmableModal
                  title="Eliminar imagen"
                  message="¿Estás seguro de que quieres eliminar esta imagen?"
                  onConfirm={() => removeNewImage(index, image)}
                >
                  <span className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">X</span>
                </ConfirmableModal>
                {newImportantImage === image && <span className='text-white text-sm cursor-pointer font-semibold px-2 py-1 bg-primary rounded-lg absolute bottom-2 left-2'>Principal</span> }
              </div>
            ))}

            {/* Imágenes existentes */}
            {initialData?.images?.filter(img => !imagesToDelete.includes(img.id)).map((image) => (
              <div key={image.id} onClick={(e) => { setImportantImageId(image.id); setNewImportantImage(null); e.stopPropagation()}} className="relative w-full max-w-60 aspect-square cursor-pointer">
                <img src={`/storage/${image.path}`} alt="Existente" className="w-full h-full object-cover rounded-lg border border-base-300 transition-opacity duration-300 hover:opacity-90"/>
                <ConfirmableModal
                  title="Eliminar imagen"
                  message="¿Estás seguro de que quieres eliminar esta imagen?"
                  onConfirm={() => removeExistingImage(image.id)}
                >
                  <span className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">X</span>
                </ConfirmableModal>
                {(importantImageId === image.id) && <span className='text-white text-sm cursor-pointer font-semibold px-2 py-1 bg-primary rounded-lg absolute bottom-2 left-2'>Principal</span> }
              </div>
            ))}
          </div>
        </div>

        {/* Productos */}
        <div className='flex flex-col gap-4 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold">Productos incluidos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
            {products.filter(p => !p.deleted_at).map(product => (
              <label key={product.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${form.product_ids.includes(product.id) ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                <input 
                  type="checkbox" 
                  id={`product-${product.id}`}
                  checked={form.product_ids.includes(product.id)} 
                  onChange={() => handleProductToggle(product.id)}
                  className="checkbox checkbox-primary checkbox-sm" 
                />
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-sm line-clamp-1">{product.name}</span>
                  <span className="text-xs text-base-content/50">{product.price}€</span>
                </div>
              </label>
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
