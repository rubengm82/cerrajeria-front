import React, { useState } from 'react';
import { createFaq, updateFaq } from '../../api/faq_api';
import { useNavigate, Link } from "react-router-dom";
import LoadingAnimation from '../LoadingAnimation';
import Notifications from '../Notifications';
import { HiArrowLeft } from 'react-icons/hi2';

function FaqForm({ initialData, submitText, title, subtitle, backLink }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        question: initialData.question || "",
        answer: initialData.answer || "",
      }
    }
    return {
      question: "",
      answer: "",
    }
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const formData = {
        question: form.question,
        answer: form.answer,
      }

      if (initialData && initialData.id) {
        await updateFaq(initialData.id, formData)
      } else {
        await createFaq(formData)
      }

      navigate("/admin/faqs", { state: { notificationType: "success", notificationMessage: initialData && initialData.id ? "Pregunta actualitzada correctament" : "Pregunta creada correctament" }})

    } catch (error) {
      console.log("Error: " + error);
      if (error.response?.status == 422) {
        const errors = error.response.data.errors
        setErrors(errors)
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
            <p>Tornar enrere</p>
          </Link>
        )}
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {subtitle && <p className="text-md mt-1 text-base-content/60">{subtitle}</p>}
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col justify-center gap-5'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-base-100 rounded-lg shadow-md border border-base-300'>
          <h3 className="text-[20px] font-semibold col-span-1 md:col-span-3">Informació bàsica</h3>

          {/* Pregunta */}
          <div className="w-full md:col-span-3">
            <label className="label text-base-content" htmlFor="question">Pregunta *</label>
            <input
              type="text"
              name="question"
              id="question"
              autoComplete="off"
              value={form.question}
              onChange={handleChange}
              placeholder="Pregunta"
              className="input w-full"
              required
            />
            {errors.question && <span className="text-error text-sm">{errors.question[0]}</span>}
          </div>

          {/* Respuesta */}
          <div className="w-full md:col-span-3">
            <label className="label text-base-content" htmlFor="answer">Resposta *</label>
            <textarea
              name="answer"
              id="answer"
              value={form.answer}
              onChange={handleChange}
              placeholder="Resposta"
              className="textarea w-full min-h-[120px]"
              required
            />
            {errors.answer && <span className="text-error text-sm">{errors.answer[0]}</span>}
          </div>
        </div>

        {/* Botones */}
        <div className='col-span-2 flex gap-2 justify-end'>
          <button type='button' onClick={() => navigate(-1)} className='btn btn-secondary'>Cancel·lar</button>
          <button type='submit' className='btn btn-primary'>{submitText}</button>
        </div>
      </form>

      {/* Se muestran los errores */}
      {Object.keys(errors).length > 0 && <Notifications type={"error"} errors={errors} />}
    </div>
  );
};

export default FaqForm;
