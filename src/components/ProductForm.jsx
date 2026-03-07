import React, { useState, useEffect } from 'react';
import { getCategories } from '../api/categories_api';
import { createProduct, updateProduct } from "../api/products_api";
import { useNavigate, Link } from "react-router-dom";
import LoadingAnimation from "./LoadingAnimation";

function ProductForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
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
    installation_price: 0,
    extra_keys: 0,
    is_active: true
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        is_installable: !!initialData.is_installable,
        is_important_to_show: !!initialData.is_important_to_show,
        is_active: !!initialData.is_active,
      })
    }
  }, [initialData])

  useEffect(() => {
    getCategories()
    .then(response => setCategories(response.data))
    .catch(err => {
      console.log(err)
      setCategories([])
    })
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm(current => ({
      ...current, [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    // Se preparan los datos para el backend
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      discount: parseInt(form.discount) || 0,
      installation_price: parseFloat(form.installation_price) || 0,
      extra_keys: parseFloat(form.extra_keys) || 0,
      category_id: parseInt(form.category_id),
      is_installable: form.is_installable ? 1 : 0,
      is_important_to_show: form.is_important_to_show ? 1 : 0,
      is_active: form.is_active ? 1 : 0
    }

    try {
      if (initialData && initialData.id) {
        await updateProduct(initialData.id, payload)
      } else {
        await createProduct(payload)
      }
      navigate("/admin/products")
    } catch (error) {
      console.error("Error al guardar:", error.message);
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
          <Link to={backLink} className='text-primary mb-2 inline-block'>
            Volver atrás
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
          {/* Código */}
          <div className="w-full">
            <label className="label text-base-content" htmlFor='code'>Código *</label>
            <input type="text" name="code" id='code' value={form.code} onChange={handleChange} placeholder="Código del producto" className="input w-full" required/>
          </div>
          {/* Descripción */}
          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='description'>Descripción</label>
            <textarea name="description" id='description' value={form.description} onChange={handleChange} placeholder="Descripción del producto" className="textarea h-auto max-h-28 w-full"></textarea>
          </div>
          {/* Categoría */}
          <div className="w-full col-span-1 md:col-span-2">
            <label className="label text-base-content" htmlFor='category_id'>Categoría *</label>
            <select name="category_id" id="category_id" value={form.category_id} onChange={handleChange} className='select w-full' required>
              <option value="" disabled>Selecciona una categoría</option>
              {
                categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))
              }
            </select>
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
          <h3 className="text-[20px] font-semibold col-span-3">Imagenes del producto</h3>
          {/* Imagenes */}
{/*           <div className="w-full">
            <label className="label text-base-content" htmlFor='price'>Precio(€) *</label>
            <input type="number" name="price" id='price' value={form.price} onChange={handleChange} placeholder="0.00" className="input w-full" required/>
          </div> */}
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
    </div>
  );
};

export default ProductForm;
