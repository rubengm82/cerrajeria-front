import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HiOutlinePhoto, HiOutlineEye } from "react-icons/hi2";

function CategoryCard({ category }) {
  const navigate = useNavigate()
  const imagePath = category?.image
  const [failedImagePath, setFailedImagePath] = useState(null)
  const handleNavigate = () => navigate(`/categories/${category.id}`)
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavigate()
    }
  }

  return category ? (
    <div
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="category-card border-base-300"
      role="link"
      tabIndex={0}
      aria-label={`Veure la categoria ${category.name}`}
    >
      {imagePath && failedImagePath !== imagePath ? (
        <img
          src={`/storage/${imagePath}`}
          alt={category.name}
          className="category-card__image"
          onError={() => setFailedImagePath(imagePath)}
        />
      ) : (
        <div className="category-card__empty bg-base-300/10" aria-label={`Sense imatge per a la categoria ${category.name}`}>
          <HiOutlinePhoto className="category-card__empty-icon text-base-400/60" aria-hidden="true" />
        </div>
      )}

      <div className="category-card__actions">
        <button
          type="button"
          className="category-card__action category-card__action--view bg-base-100/80"
          onClick={(event) => {
            event.stopPropagation()
            handleNavigate()
          }}
          aria-label={`Veure la categoria ${category.name}`}
        >
          <HiOutlineEye className="category-card__action-icon" aria-hidden="true" />
        </button>
      </div>

      <div className="category-card__content">
        <h3 className="category-card__name">{category.name}</h3>
      </div>
    </div>
  ) : null
}

export default CategoryCard
