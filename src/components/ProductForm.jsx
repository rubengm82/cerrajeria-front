import React, { useState, useEffect } from 'react';
import { getCategories } from '../api/categories_api';
import { createProduct } from "../api/products_api";
import { useNavigate } from "react-router-dom";

function ProductForm({ initialData, submitText, title }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: "",
    code: "",
    category_id: "",
    price: "",
    stock: "",
    is_active: ""
  })

  useEffect(() => {
    getCategories()
    .then(response => setCategories(response.data))
    .catch(err => {
      console.log(err)
      setCategories([])
    })
  }, [])

  const handleChange = (event) => {
    const {name, value} = event.target
    setForm(current => ({
      ...current, [name]: value
    }))
    console.log("Nuevo valor de datos");
    console.log(form);
  }

  return (
    <div className="lg:w-[70%] lg:min-w-150 w-full p-6 bg-base-100 rounded-lg shadow-md border border-base-300">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="w-full">
          <label className="label" htmlFor="name">Nombre del producto:</label>
          <input type="text" name="name" id='name' onChange={handleChange} placeholder="Nombre del producto" className="input w-full" required/>
        </div>
        {/* Codigo */}
        <div className="w-full">
          <label className="label" htmlFor='code'>Codigo:</label>
          <input type="text" name="code" id='code' onChange={handleChange} placeholder="Nombre del producto" className="input w-full" required/>
        </div>
        {/* Categoria */}
        <div className="w-full">
          <label className="label" htmlFor='category_id'>Categoria:</label>
          <select name="category_id" id="category_id" onChange={handleChange} className='select w-full'>
            <option value="" selected disabled>Selecciona una categoria</option>
            {
              categories.map((category) => (
                <option value={category.id}>{category.name}</option>
              ))
            }
          </select>
        </div>
        {/* Precio */}
        <div className="w-full">
          <label className="label" htmlFor='price'>Precio:</label>
          <input type="number" name="price" id='price' onChange={handleChange} placeholder="Nombre del producto" className="input w-full" required/>
        </div>
        {/* Stock */}
        <div className="w-full">
          <label className="label" htmlFor='stock'>Stock:</label>
          <input type="number" name="stock" id='stock' onChange={handleChange} placeholder="Nombre del producto" className="input w-full" required/>
        </div>
        {/* Estado */}
        <div className="w-full">
          <label className="label" htmlFor='is_active'>Estado:</label>
          <select name="is_active" id="is_active" onChange={handleChange} className='select w-full' required>
            <option value="" selected disabled>Selecciona un estado</option>
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
        {/* Boton de enviary cancelar */}
        <div className='col-span-2 flex gap-2 justify-end'>
          <button onClick={() => navigate(-1)} className='btn btn-secondary col-span-2 justify-self-end'>Cancelar</button>
          <button className='btn btn-primary col-span-2 justify-self-end'>{submitText}</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
