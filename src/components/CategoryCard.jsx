import { Navigate, useNavigate } from "react-router-dom"

function CategoryCard({ category }) {
  const navigate = useNavigate()
  const imagePath = category?.image

  return category ? (
    <div onClick={() => navigate(`/categories/${category.id}`)} className="group relative min-h-48 cursor-pointer overflow-hidden rounded-3xl border border-base-300">
      {imagePath ? (
        <img src={`http://127.0.0.1:8000/storage/${imagePath}`} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/15">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10 text-base-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-2xl font-medium tracking-tight text-black">{category.name}</h3>
      </div>
    </div>
  ) : null
}

export default CategoryCard
