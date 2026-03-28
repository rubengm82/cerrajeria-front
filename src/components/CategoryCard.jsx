import { useNavigate } from "react-router-dom"

function CategoryCard({ category }) {
  const navigate = useNavigate()
  const imagePath = category?.image

  return category ? (
    <div onClick={() => navigate(`/categories/${category.id}`)} className="category-card border-base-300">
      {imagePath ? (
        <img src={`/storage/${imagePath}`} alt={category.name} className="category-card__image"/>
      ) : (
        <div className="category-card__empty bg-primary/15">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="category-card__empty-icon text-base-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
      )}

      <div className="category-card__content">
        <h3 className="category-card__name">{category.name}</h3>
      </div>
    </div>
  ) : null
}

export default CategoryCard
